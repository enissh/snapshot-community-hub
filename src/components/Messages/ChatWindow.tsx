
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Phone, Video, Info, Heart, Image, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url?: string | null;
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ChatWindowProps {
  userId: string;
  onBack: () => void;
}

const ChatWindow = ({ userId, onBack }: ChatWindowProps) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOtherUser();
    fetchMessages();
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser?.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUser?.id}))`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOtherUser = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    setOtherUser(data);
  };

  const fetchMessages = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: userId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendReaction = async (emoji: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: userId,
          content: emoji
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  if (loading || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center cyber-card">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col cyber-card">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-gradient-to-r from-secondary to-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={otherUser.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
              {otherUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold text-foreground">{otherUser.username}</h2>
            {typing && <p className="text-xs text-muted-foreground">typing...</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary/20">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/20">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/20">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid">
        {messages.map((message) => {
          const isFromCurrentUser = message.sender_id === currentUser?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isFromCurrentUser
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-secondary text-foreground border border-primary/20'
                }`}
              >
                {message.media_url && (
                  <img
                    src={message.media_url}
                    alt="Message media"
                    className="w-full rounded-lg mb-2"
                  />
                )}
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isFromCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick reactions */}
      <div className="px-4 py-2 border-t border-primary/20">
        <div className="flex gap-2">
          {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => sendReaction(emoji)}
              className="hover:bg-primary/20 text-lg"
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-primary/20 flex gap-2">
        <Button variant="ghost" size="icon" className="hover:bg-primary/20">
          <Image className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-secondary/50 border-primary/20 text-foreground placeholder:text-muted-foreground"
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
        />
        <Button variant="ghost" size="icon" className="hover:bg-primary/20">
          <Smile className="h-5 w-5" />
        </Button>
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          size="icon"
          className="neon-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
