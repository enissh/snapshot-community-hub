
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_verified?: boolean;
}

interface ChatHeaderProps {
  otherUser: Profile;
  onBack: () => void;
  typing: boolean;
}

const ChatHeader = ({ otherUser, onBack, typing }: ChatHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 p-3 sm:p-4 border-b border-primary/20 flex items-center justify-between bg-background/95 backdrop-blur-md">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 flex-shrink-0">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
              {otherUser.username[0].toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="font-semibold truncate text-foreground">{otherUser.username}</p>
          <p className="text-xs text-muted-foreground truncate">
            {typing ? 'typing...' : 'online'}
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Call">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Video call">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Info">
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
