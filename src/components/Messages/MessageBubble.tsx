
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  otherUser: Profile;
  currentUser: any;
}

const MessageBubble = ({ message, isMine, otherUser, currentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isMine && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
              {otherUser.username[0].toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div
        className={`relative px-3 py-2 rounded-2xl break-words max-w-[75%] sm:max-w-[65%] ${
          isMine 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        {message.media_url && (
          <img
            src={message.media_url}
            alt="Media"
            className="rounded-lg mb-2 max-h-48 w-auto object-cover"
          />
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className={`text-[10px] opacity-70 block mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>

      {isMine && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {currentUser?.user_metadata?.avatar_url ? (
            <AvatarImage src={currentUser.user_metadata.avatar_url} alt="You" />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
              {currentUser?.email?.[0].toUpperCase() || 'Y'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
