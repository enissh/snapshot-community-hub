
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url?: string | null;
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
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    if (userId === 'ai-assistant') {
      setIsAI(true);
      setOtherUser({
        id: 'ai-assistant',
        username: 'Plazoid AI',
        avatar_url: null,
        full_name: 'AI Assistant',
        is_verified: true
      });
      setMessages([
        {
          id: '1',
          content: "Welcome to Plazoid! I'm your AI assistant. How can I help you today?",
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
      return;
    }

    fetchOtherUser();
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const setupRealtimeSubscription = () => {
    if (!currentUser || isAI) return;

    const channelName = `messages:${[currentUser.id, userId].sort().join('-')}`;
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
        const newMessage = payload.new as Message;
        if (newMessage.sender_id !== currentUser.id) {
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          setOtherUserTyping(false);
        }
      }
    );

    // Listen for typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.user_id !== currentUser.id) {
        setOtherUserTyping(payload.typing);
        
        if (payload.typing && typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    });

    channel.subscribe();
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
    if (!userId) return;
    
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
    if (!currentUser || !userId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      return;
    }

    setMessages(data || []);
    setLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const sendMessage = async (messageContent: string) => {
    if (!currentUser || sending || !messageContent.trim()) return;

    setSending(true);
    sendTypingIndicator(false);

    if (isAI) {
      // Add user message immediately
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        content: messageContent,
        sender_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Simulate AI typing
      setOtherUserTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: generateAIResponse(messageContent),
          sender_id: 'ai-assistant',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        setOtherUserTyping(false);
        setSending(false);
      }, 1500);
      return;
    }

    // Add optimistic message
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
        .insert({
          content: messageContent,
          sender_id: currentUser.id,
          recipient_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? data : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sendReaction = async (emoji: string) => {
    await sendMessage(emoji);
  };

  const generateAIResponse = (userMessage: string) => {
    const responses = [
      "That's interesting! Tell me more about that.",
      "I understand what you're saying. How does that make you feel?",
      "Thanks for sharing that with me. What would you like to explore next?",
      "That's a great point! I'm here to help with whatever you need.",
      "I appreciate you reaching out. What else can I assist you with?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatHeader 
        otherUser={otherUser} 
        onBack={onBack} 
        typing={otherUserTyping} 
      />
      
      <div className="chat-messages">
        <MessagesList 
          messages={messages} 
          otherUser={otherUser} 
          currentUser={currentUser}
        />
        {otherUserTyping && (
          <TypingIndicator username={otherUser?.username || 'User'} />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <MessageInput 
          onSendMessage={sendMessage}
          onSendReaction={sendReaction}
          onTyping={sendTypingIndicator}
          sending={sending}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
