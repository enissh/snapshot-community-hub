
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Users, Video, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface MessagesListProps {
  onSelectConversation: (userId: string) => void;
}

const MessagesList = ({ onSelectConversation }: MessagesListProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (id, username, avatar_url, full_name),
        recipient:profiles!messages_recipient_id_fkey (id, username, avatar_url, full_name)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    const conversationMap = new Map();
    
    messages?.forEach((message: any) => {
      const otherId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      const otherUser = message.sender_id === user.id ? message.recipient : message.sender;
      
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          id: otherId,
          other_user: otherUser,
          last_message: {
            content: message.content,
            created_at: message.created_at,
            sender_id: message.sender_id
          },
          unread_count: 0
        });
      }
    });

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 rounded w-3/4"></div>
          <div className="h-10 bg-primary/20 rounded"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-3">
              <div className="rounded-full bg-primary/20 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                <div className="h-3 bg-primary/20 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full md:w-96">
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Messages</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/20">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/20">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-primary/20 text-foreground text-large"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-muted-foreground text-large">
              {searchQuery ? 'Try a different search term' : 'Start a conversation with someone!'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.other_user.id)}
              className="p-4 border-b border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="story-ring">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={conversation.other_user.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                      {conversation.other_user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate text-foreground text-large">
                      {conversation.other_user.username}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {conversation.other_user.full_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.other_user.full_name}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                    {conversation.last_message.content}
                  </p>
                </div>
                
                {conversation.unread_count > 0 && (
                  <div className="bg-primary text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesList;
