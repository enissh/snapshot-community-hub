
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Crown } from 'lucide-react';

interface Conversation {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_verified?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ConversationsListProps {
  onSelectConversation: (userId: string) => void;
}

const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get recent conversations by finding users who have exchanged messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          sender_id,
          recipient_id,
          content,
          created_at,
          profiles:sender_id (username, avatar_url, full_name, is_verified),
          profiles_recipient:recipient_id (username, avatar_url, full_name, is_verified)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Process messages to create conversation list
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const isFromMe = message.sender_id === user.id;
        const otherUserId = isFromMe ? message.recipient_id : message.sender_id;
        const otherUserProfile = isFromMe ? message.profiles_recipient : message.profiles;

        if (!conversationMap.has(otherUserId) && otherUserProfile) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            username: otherUserProfile.username,
            avatar_url: otherUserProfile.avatar_url,
            full_name: otherUserProfile.full_name,
            is_verified: otherUserProfile.is_verified,
            lastMessage: message.content,
            lastMessageTime: message.created_at
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loading-logo w-8 h-8"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-foreground">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a new conversation by searching for users above.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Conversations</h3>
      <div className="space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className="flex items-center gap-3 p-3 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors interactive-glow"
          >
            <div className="story-ring">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                  {conversation.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{conversation.username}</h3>
                {conversation.is_verified && <Crown className="h-4 w-4 text-accent flex-shrink-0" />}
              </div>
              {conversation.full_name && (
                <p className="text-sm text-muted-foreground truncate">{conversation.full_name}</p>
              )}
              {conversation.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {conversation.lastMessage.length > 30 
                    ? `${conversation.lastMessage.substring(0, 30)}...` 
                    : conversation.lastMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList;
