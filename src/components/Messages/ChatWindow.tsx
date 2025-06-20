
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

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
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const setupRealtimeSubscription = () => {
    if (!currentUser || isAI) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `messages-${[currentUser.id, userId].sort().join('-')}`;
    const channel = supabase.channel(channelName);

    channelRef.current = channel;

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
          const isChatActive = document.visibilityState === 'visible' && document.hasFocus();

          if (!isChatActive) {
            toast.success(`New message from ${otherUser?.username || 'user'}`, {
              description: newMsg.content.length > 30 ? `${newMsg.content.substring(0, 30)}...` : newMsg.content,
            });
          }
        }
      }
    ).subscribe();

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

  const sendMessage = async (messageContent: string) => {
    if (!currentUser || sending) return;

    setSending(true);

    if (isAI) {
      // Show user message immediately
      const userMsg: Message = {
        id: `temp-user-${Date.now()}`,
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

    // Add optimistic update for instant display
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

      // Replace temp message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
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
      <div className="h-screen flex items-center justify-center cyber-card w-full">
        <div className="text-center">
          <div className="loading-logo w-16 h-16 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col w-full bg-background relative">
      <ChatHeader otherUser={otherUser} onBack={onBack} typing={typing} />
      <div className="flex-1 overflow-hidden">
        <MessagesList 
          messages={messages} 
          otherUser={otherUser} 
          currentUser={currentUser}
          ref={messagesEndRef}
        />
      </div>
      <MessageInput 
        onSendMessage={sendMessage}
        onSendReaction={sendReaction}
        sending={sending}
      />
    </div>
  );
};

export default ChatWindow;
