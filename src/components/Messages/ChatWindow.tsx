
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Phone, Video, Info, Heart, Image, Smile, MoreHorizontal, Bot, Zap, Crown } from 'lucide-react';
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
  full_name: string | null;
  is_verified?: boolean;
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
  const [isAI, setIsAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (userId === 'ai-assistant') {
      setIsAI(true);
      setOtherUser({
        id: 'ai-assistant',
        username: 'PlazaGram AI',
        avatar_url: null,
        full_name: 'AI Assistant',
        is_verified: true
      });
      setMessages([
        {
          id: '1',
          content: "👋 Hey! I'm your PlazaGram AI assistant. I can help you with:\n\n🎨 Generate captions\n📈 Profile tips\n💡 Content ideas\n🔥 Hashtag suggestions\n\nWhat would you like help with today?",
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }

    fetchOtherUser();
    fetchMessages();
    setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottomSmooth();
  }, [messages]);

  const scrollToBottomSmooth = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser || isAI) return;

    channelRef.current = supabase
      .channel(`messages-${userId}-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUser.id}))`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          
          // Show notification for received messages
          if (newMsg.sender_id !== currentUser.id) {
            toast.success('New message received! 💬');
          }
        }
      )
      .subscribe();
  };

  const fetchOtherUser = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, is_verified')
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

  const generateAIResponse = (userMessage: string) => {
    const responses = {
      caption: [
        "✨ Here are some caption ideas:\n\n• \"Living my best life, one post at a time\"\n• \"Chasing dreams and capturing moments\"\n• \"Creating memories that last forever\"\n• \"In a world full of trends, be a classic\"",
        "🎨 Creative captions for you:\n\n• \"Plot twist: I'm the main character\"\n• \"Currently starring in my own reality show\"\n• \"Proof that I can take a decent photo\"\n• \"Just because you're awake doesn't mean you should stop dreaming\""
      ],
      hashtag: [
        "🔥 Trending hashtags:\n\n#PlazaGram #Aesthetic #Mood #Vibes #PhotoOfTheDay #InstaGood #Beautiful #Life #Style #Amazing #Cool #Fun #Happy #Love #Inspo",
        "📈 Popular tags to boost engagement:\n\n#TrendingNow #Viral #Explore #Discover #Content #Creator #Influencer #Lifestyle #Fashion #Art #Photography #Digital #Future"
      ],
      tips: [
        "💡 Profile tips:\n\n• Post consistently (1-2 times daily)\n• Use high-quality images\n• Engage with your audience\n• Use relevant hashtags\n• Post when your audience is active\n• Tell stories in your captions",
        "🚀 Growth strategies:\n\n• Collaborate with others\n• Use trending sounds in reels\n• Share behind-the-scenes content\n• Ask questions in captions\n• Cross-promote on other platforms\n• Create series content"
      ],
      ideas: [
        "💭 Content ideas:\n\n• Day in the life vlogs\n• Before/after transformations\n• Tutorial or how-to posts\n• Behind the scenes content\n• Q&A sessions\n• Throwback posts\n• Motivational quotes",
        "🎬 Creative post concepts:\n\n• Time-lapse videos\n• Photo dumps\n• Outfit of the day\n• Food photography\n• Travel content\n• Pet photos\n• Sunset/sunrise shots"
      ]
    };

    const message = userMessage.toLowerCase();
    if (message.includes('caption')) return responses.caption[Math.floor(Math.random() * responses.caption.length)];
    if (message.includes('hashtag') || message.includes('tag')) return responses.hashtag[Math.floor(Math.random() * responses.hashtag.length)];
    if (message.includes('tip') || message.includes('help') || message.includes('grow')) return responses.tips[Math.floor(Math.random() * responses.tips.length)];
    if (message.includes('idea') || message.includes('content') || message.includes('post')) return responses.ideas[Math.floor(Math.random() * responses.ideas.length)];
    
    return "🤖 I'm here to help! Try asking me about:\n\n• Caption ideas\n• Hashtag suggestions\n• Growth tips\n• Content ideas\n\nWhat specific help do you need?";
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    
    if (isAI) {
      // Add user message immediately
      const userMsg = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);
      
      const userInput = newMessage.trim();
      setNewMessage('');
      
      // Simulate AI thinking
      setTyping(true);
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(userInput),
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        setTyping(false);
        toast.success('AI response received! 🤖');
      }, 1500);
      
      setSending(false);
      return;
    }

    try {
      // Add message to local state immediately for instant feedback
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        sender_id: currentUser.id,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      const messageContent = newMessage.trim();
      setNewMessage('');

      // Send to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: userId,
          content: messageContent
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        )
      );

      toast.success('Message sent! 💬');
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendReaction = async (emoji: string) => {
    if (isAI) {
      const reactionMsg = {
        id: Date.now().toString(),
        content: emoji,
        sender_id: currentUser?.id || '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, reactionMsg]);
      
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: `${emoji} right back at you! What else can I help you with?`,
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
      return;
    }

    if (!currentUser) return;

    try {
      await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: userId,
          content: emoji
        });

      toast.success('Reaction sent! 😊');
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  if (loading || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center cyber-card w-full">
        <div className="text-center">
          <div className="loading-logo w-16 h-16 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary/20 flex items-center justify-between hologram">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="interactive-glow md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="story-ring">
            <Avatar className="h-12 w-12">
              {isAI ? (
                <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              ) : (
                <>
                  <AvatarImage src={otherUser.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{otherUser.username}</h2>
              {otherUser.is_verified && <Crown className="h-4 w-4 text-accent" />}
              {isAI && <Zap className="h-4 w-4 text-primary" />}
            </div>
            {otherUser.full_name && (
              <p className="text-sm text-muted-foreground">{otherUser.full_name}</p>
            )}
            {typing && <p className="text-xs text-primary animate-pulse">typing...</p>}
            {!isAI && <div className="online-dot mt-1" />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAI && (
            <>
              <Button variant="ghost" size="icon" className="interactive-glow">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="interactive-glow">
                <Video className="h-5 w-5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="interactive-glow">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="interactive-glow">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={otherUser.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-2xl">
                {otherUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Start a conversation with {otherUser.username}
            </h3>
            <p className="text-muted-foreground">Say hello! 👋</p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromCurrentUser = message.sender_id === currentUser?.id;
            const isFromAI = message.sender_id === 'ai-assistant';
            
            return (
              <div
                key={message.id}
                className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 ${
                    isFromCurrentUser
                      ? 'message-sent text-white'
                      : isFromAI
                      ? 'hologram text-foreground border border-primary/30'
                      : 'message-received text-foreground'
                  }`}
                >
                  {message.media_url && (
                    <img
                      src={message.media_url}
                      alt="Message media"
                      className="w-full rounded-lg mb-2"
                    />
                  )}
                  <p className="break-words whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    isFromCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick reactions */}
      <div className="px-4 py-2 border-t border-primary/10">
        <div className="flex gap-2 justify-center overflow-x-auto">
          {['❤️', '😂', '😮', '😢', '😍', '👍', '🔥', '💯', '🚀', '⭐'].map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => sendReaction(emoji)}
              className="interactive-glow text-xl flex-shrink-0"
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-primary/20 flex gap-2">
        {!isAI && (
          <Button variant="ghost" size="icon" className="interactive-glow">
            <Image className="h-5 w-5" />
          </Button>
        )}
        <Input
          placeholder={isAI ? "Ask me anything..." : `Message ${otherUser.username}...`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 cyber-card border-primary/20 text-foreground placeholder:text-muted-foreground"
          disabled={sending}
        />
        <Button variant="ghost" size="icon" className="interactive-glow">
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
