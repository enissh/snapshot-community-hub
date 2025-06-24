import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

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
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  useEffect(() => {
    if (userId === 'ai-assistant') {
      setIsAI(true);
      setOtherUser({
        id: 'ai-assistant',
        username: 'PlazoidAI',
        avatar_url: null,
        full_name: 'AI Assistant',
        is_verified: true
      });
      setMessages([
        {
          id: '1',
          content: "🚀 Welcome to Plazoid! I'm your AI assistant from the future. I can help you with:\n\n✨ Generate futuristic captions\n🔮 Profile optimization tips\n💫 Content ideas from 2100\n🌟 Hashtag suggestions\n\nWhat would you like to explore today?",
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
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, currentUser]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const setupRealtimeSubscription = () => {
    if (!currentUser || isAI) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `chat-${[currentUser.id, userId].sort().join('-')}`;
    const channel = supabase.channel(channelName);

    channelRef.current = channel;

    // Listen for new messages
    channel.on(
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
          const messageExists = prev.some(msg => msg.id === newMsg.id);
          if (messageExists) return prev;

          const updatedMessages = [...prev, newMsg].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          return updatedMessages;
        });

        if (newMsg.sender_id !== currentUser.id) {
          setOtherUserTyping(false);
          const isChatActive = document.visibilityState === 'visible' && document.hasFocus();

          if (!isChatActive) {
            toast.success(`New message from ${otherUser?.username || 'user'}`, {
              description: newMsg.content.length > 30 ? `${newMsg.content.substring(0, 30)}...` : newMsg.content,
            });
          }
        }
      }
    );

    // Listen for typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.user_id !== currentUser.id) {
        setOtherUserTyping(payload.typing);
        
        if (payload.typing) {
          // Clear typing after 3 seconds of no activity
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (channelRef.current && !isAI) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUser?.id, typing: isTyping }
      });
    }
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

  const sendMessage = async (messageContent: string) => {
    if (!currentUser || sending) return;

    setSending(true);
    sendTypingIndicator(false);

    if (isAI) {
      const userMsg: Message = {
        id: `temp-user-${Date.now()}`,
        content: messageContent,
        sender_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

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
      }, 2000);

      return;
    }

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
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

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const sendReaction = async (emoji: string) => {
    if (isAI) {
      const reactionMsg: Message = {
        id: `temp-reaction-${Date.now()}`,
        content: emoji,
        sender_id: currentUser?.id || '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, reactionMsg]);

      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-response-${Date.now()}`,
          content: `${emoji} Future vibes! What else can I help you with?`,
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

      toast.success('Reaction sent! ✨');
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  };

  const generateAIResponse = (userMessage: string) => {
    const responses = {
      caption: [
        "✨ Futuristic captions from 2100:\n\n• \"Living in the future, one post at a time\"\n• \"Digital dreams, analog soul\"\n• \"Crafting tomorrow's memories today\"\n• \"In a world of pixels, be the resolution\"",
        "🚀 Next-gen caption ideas:\n\n• \"Plot twist: I'm the main character in this simulation\"\n• \"Currently starring in my own holographic reality\"\n• \"Proof that I exist in multiple dimensions\"\n• \"Dreams are just previews of tomorrow's reality\""
      ],
      hashtag: [
        "🔥 Trending from the future:\n\n#Plazoid #FutureVibes #DigitalNomad #CyberAesthetic #NeonLife #TechSoul #MetaVerse #QuantumMood #HoloGram #ElectricDreams",
        "📈 Next-level hashtags:\n\n#PlazoidLife #CyberPunk2100 #NeonNights #DigitalDreamer #FuturisticVibes #TechnoSoul #VirtualReality #CosmicEnergy #ElectronicEmotion"
      ],
      tips: [
        "💡 Future-proof profile tips:\n\n• Post during peak neural activity hours\n• Use holographic filters for depth\n• Engage with quantum comments\n• Share interdimensional stories\n• Cross-post to parallel universes",
        "🚀 Advanced growth strategies:\n\n• Collaborate with AI influencers\n• Use temporal hashtags\n• Create immersive AR content\n• Host virtual reality meetups\n• Build your digital twin presence"
      ],
      ideas: [
        "💭 Content from the future:\n\n• Day in the life of a digital nomad\n• Before/after reality transformations\n• Holographic tutorials\n• Behind the simulation content\n• Time-travel Q&As\n• Nostalgic 2024 throwbacks",
        "🎬 Futuristic post concepts:\n\n• Time-lapse of city evolution\n• Digital fashion shows\n• Neon food photography\n• Virtual travel content\n• AI pet adventures\n• Sunset from Mars"
      ]
    };

    const message = userMessage.toLowerCase();
    if (message.includes('caption')) return responses.caption[Math.floor(Math.random() * responses.caption.length)];
    if (message.includes('hashtag') || message.includes('tag')) return responses.hashtag[Math.floor(Math.random() * responses.hashtag.length)];
    if (message.includes('tip') || message.includes('help') || message.includes('grow')) return responses.tips[Math.floor(Math.random() * responses.tips.length)];
    if (message.includes('idea') || message.includes('content') || message.includes('post')) return responses.ideas[Math.floor(Math.random() * responses.ideas.length)];
    
    return "🤖 I'm your AI guide from the future! Try asking me about:\n\n• Futuristic captions\n• Next-gen hashtags\n• Growth strategies\n• Content ideas from 2100\n\nWhat do you want to explore?";
  };

  if (loading || !otherUser) {
    return (
      <div className="h-screen flex items-center justify-center plazoid-card w-full">
        <div className="text-center">
          <div className="loading-logo w-16 h-16 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col w-full bg-background relative">
      <ChatHeader otherUser={otherUser} onBack={onBack} typing={typing || otherUserTyping} />
      <div className="flex-1 overflow-hidden plazoid-grid">
        <MessagesList 
          messages={messages} 
          otherUser={otherUser} 
          currentUser={currentUser}
          ref={messagesEndRef}
        />
        {otherUserTyping && (
          <TypingIndicator username={otherUser.username} />
        )}
      </div>
      <MessageInput 
        onSendMessage={sendMessage}
        onSendReaction={sendReaction}
        onTyping={sendTypingIndicator}
        sending={sending}
      />
    </div>
  );
};

export default ChatWindow;
