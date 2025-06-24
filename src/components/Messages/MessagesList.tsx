
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

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
}

interface MessagesListProps {
  messages?: Message[];
  otherUser?: Profile;
  currentUser: any;
}

const MessagesList = ({ messages = [], otherUser, currentUser }: MessagesListProps) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No messages yet</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          {otherUser ? `Start a conversation with ${otherUser.username}` : 'Select a conversation to start messaging.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map(msg => {
        const isMine = msg.sender_id === currentUser?.id;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={isMine}
            otherUser={otherUser}
            currentUser={currentUser}
          />
        );
      })}
    </div>
  );
};

export default MessagesList;
