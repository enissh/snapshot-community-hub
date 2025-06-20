
import { forwardRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url?: string | null;
  reactions?: Record<string, string[]>;
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

interface MessagesListProps {
  messages: Message[];
  otherUser: Profile;
  currentUser: any;
}

const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, otherUser, currentUser }, ref) => {
    if (messages.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No messages yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start a conversation with {otherUser.username} by typing a message below.
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-1">
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
          <div ref={ref} className="h-1" />
        </div>
      </ScrollArea>
    );
  }
);

MessagesList.displayName = 'MessagesList';

export default MessagesList;
