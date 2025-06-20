import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  ArrowLeft,
  Phone, 
  Video, 
  Info, 
  Smile, 
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Types
type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url?: string | null;
  reactions?: Record<string, string[]>;
};

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
    const cleanup = setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (cleanup) cleanup();
    };
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottomSmooth();
  }, [messages]);

  const scrollToBottomSmooth = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser || isAI) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`messages-${userId}-${currentUser.id}`, {
      config: {
        presence: {
          key: `chat:${[currentUser.id, userId].sort().join('-')}`,
        },
      },
    });

    channelRef.current = channel;

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(
          and(sender_id.eq.${currentUser.id},recipient_id.eq.${userId}),
          and(sender_id.eq.${userId},recipient_id.eq.${currentUser.id})
        )`
      },
      (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.id.startsWith('temp-')) return;

        setMessages(prev => {
          const messageExists = prev.some(msg =>
            msg.id === newMsg.id ||
            (msg.content === newMsg.content &&
              msg.sender_id === newMsg.sender_id &&
              Math.abs(new Date(msg.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 1000)
          );
          if (messageExists) return prev;

          return [...prev, newMsg].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });

        if (newMsg.sender_id !== currentUser.id) {
          const isChatActive = document.visibilityState === 'visible' && document.hasFocus();

          if (!isChatActive) {
            toast.success(`New message from ${otherUser?.username || 'user'}`, {
              description: newMsg.content.length > 30 ? `${newMsg.content.substring(0, 30)}...` : newMsg.content,
              action: {
                label: 'View',
                onClick: () => window.focus(),
              }
            });
          }
        }
      }
    ).subscribe(status => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime subscription active');
      }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const otherUserTyping = Object.values(state).some(
        (presence: any) =>
          presence[0]?.user_id === userId &&
          presence[0]?.typing === true
      );
      setTyping(otherUserTyping);
    });

    return () => {
      supabase.removeChannel(channel);
    };
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    if (isAI) {
      // Show user message immediately
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        sender_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Simulate AI typing and response
      setTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: generateAIResponse(messageContent),
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        setTyping(false);
        setSending(false);
      }, 1500);

      return;
    }

    // Not AI, send message to supabase
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_id: currentUser.id,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: messageContent,
            sender_id: currentUser.id,
            recipient_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sendReaction = async (emoji: string) => {
    if (isAI) {
      const reactionMsg: Message = {
        id: Date.now().toString(),
        content: emoji,
        sender_id: currentUser?.id || '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, reactionMsg]);

      setTimeout(() => {
        const aiResponse: Message = {
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
      toast.error('Failed to send reaction');
    }
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
    <div className="h-full flex flex-col w-full bg-background max-w-md mx-auto">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary/20 flex items-center justify-between hologram">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            {otherUser.avatar_url ? (
              <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
            ) : (
              <AvatarFallback>{otherUser.username[0].toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="font-semibold truncate">{otherUser.username}</p>
            <p className="text-xs text-muted-foreground truncate">
              {typing ? 'typing...' : 'online'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Info">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-1">No messages yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              Start a conversation with {otherUser.username} by typing a message below.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 flex-shrink-0">
                    {otherUser.avatar_url ? (
                      <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
                    ) : (
                      <AvatarFallback>{otherUser.username[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                )}

                <div
                  className={`relative px-4 py-2 rounded-xl break-words max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] ${
                    isMine ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.media_url && (
                    <img
                      src={msg.media_url}
                      alt="Media"
                      className="rounded-lg mb-2 max-h-60 w-auto object-cover"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="absolute bottom-0 right-1 text-[10px] opacity-50 select-none">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>

                {isMine && (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ml-2 flex-shrink-0">
                    {currentUser?.user_metadata?.avatar_url ? (
                      <AvatarImage src={currentUser.user_metadata.avatar_url} alt="You" />
                    ) : (
                      <AvatarFallback>{currentUser?.email?.[0].toUpperCase() || 'Y'}</AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={sendMessage}
        className="p-3 sm:p-4 border-t border-primary/20 flex items-center gap-2 bg-background"
      >
        <Button
          variant="ghost"
          type="button"
          onClick={() => sendReaction('😊')}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Send smile reaction"
        >
          <Smile className="h-6 w-6" />
        </Button>
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          disabled={sending}
          className="flex-1 rounded-full py-2 px-4 bg-muted focus:bg-muted/80 placeholder:text-muted-foreground"
          autoComplete="off"
          aria-label="Message input"
        />
        <Button
          type="submit"
          disabled={sending || !newMessage.trim()}
          aria-label="Send message"
          className="rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
