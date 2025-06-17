
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 second stories

    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleReply = () => {
    if (replyText.trim()) {
      console.log('Reply to story:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={currentStory.profiles.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
              {currentStory.profiles.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold">{currentStory.profiles.username}</span>
          <span className="text-white/70 text-sm">2h</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {currentStory.media_type === 'video' ? (
          <video
            src={currentStory.media_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            onEnded={nextStory}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="w-full h-full object-cover"
          />
        )}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 cursor-pointer" onClick={prevStory} />
          <div className="flex-1 cursor-pointer" onClick={nextStory} />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-sm">{currentStory.caption}</p>
          </div>
        )}
      </div>

      {/* Reply input */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <Input
          placeholder="Reply to story..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          onKeyPress={(e) => e.key === 'Enter' && handleReply()}
        />
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleReply} className="text-white hover:bg-white/20">
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={prevStory}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
      {currentIndex < stories.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={nextStory}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
};

export default StoryViewer;
