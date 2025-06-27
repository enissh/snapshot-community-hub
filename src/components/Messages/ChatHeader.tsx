
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_verified?: boolean;
}

interface ChatHeaderProps {
  otherUser: Profile | null;
  onBack: () => void;
  typing: boolean;
}

const ChatHeader = ({ otherUser, onBack, typing }: ChatHeaderProps) => {
  if (!otherUser) {
    return (
      <div className="chat-header p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-header p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 flex-shrink-0">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
          ) : (
            <AvatarFallback className="bg-orange-500 text-white">
              {otherUser.username[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate text-gray-900">{otherUser.username}</h3>
            {otherUser.is_verified && (
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {typing ? 'typing...' : 'online'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
