
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  otherUser?: Profile;
  currentUser: any;
}

const MessageBubble = ({ message, isMine, otherUser, currentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isMine && otherUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
          ) : (
            <AvatarFallback className="bg-indigo-600 text-white text-xs">
              {otherUser.username[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>
        {message.media_url && (
          <img
            src={message.media_url}
            alt="Media"
            className="rounded-lg mb-2 max-h-48 w-auto object-cover"
          />
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span className={`text-xs opacity-70 block mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>

      {isMine && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {currentUser?.user_metadata?.avatar_url ? (
            <AvatarImage src={currentUser.user_metadata.avatar_url} alt="You" />
          ) : (
            <AvatarFallback className="bg-indigo-600 text-white text-xs">
              {currentUser?.email?.[0]?.toUpperCase() || 'Y'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
