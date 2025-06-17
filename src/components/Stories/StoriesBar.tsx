import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CreateStory from './CreateStory';
import StoryViewer from './StoryViewer';

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

const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [userHasStory, setUserHasStory] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        user_id,
        media_url,
        media_type,
        caption,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    setStories(data || []);
    const hasStory = data?.some(story => story.user_id === user?.id);
    setUserHasStory(!!hasStory);
  };

  const uniqueUserStories = stories.reduce((acc: Story[], story) => {
    const existingUser = acc.find(s => s.user_id === story.user_id);
    if (!existingUser) {
      acc.push(story);
    }
    return acc;
  }, []);

  const openStoryViewer = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const closeStoryViewer = () => {
    setSelectedStoryIndex(null);
  };

  return (
    <>
      <div className="cyber-card p-4 mb-6 holographic">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Current user's story */}
          <div className="flex flex-col items-center gap-2 min-w-0">
            <div className="relative">
              <div className={`p-1 rounded-full ${
                userHasStory 
                  ? 'bg-gradient-to-tr from-primary via-accent to-secondary animate-pulse-neon' 
                  : 'bg-gradient-to-tr from-muted to-secondary'
              }`}>
                <Avatar className="h-16 w-16 border-2 border-background">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CreateStory onStoryCreated={fetchStories} />
            </div>
            <span className="text-xs text-foreground text-center truncate w-18 font-medium">
              Your story
            </span>
          </div>

          {/* Other users' stories */}
          {uniqueUserStories
            .filter(story => story.user_id !== user?.id)
            .map((story, index) => (
              <div 
                key={story.id} 
                className="flex flex-col items-center gap-2 min-w-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => openStoryViewer(index)}
              >
                <div className="relative">
                  <div className="p-1 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary animate-pulse-neon">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage src={story.profiles.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-lg">
                        {story.profiles.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {story.media_type === 'video' && (
                    <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                      <Play className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground text-center truncate w-18 font-medium">
                  {story.profiles.username}
                </span>
              </div>
            ))}
        </div>
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={uniqueUserStories}
          initialIndex={selectedStoryIndex}
          onClose={closeStoryViewer}
        />
      )}
    </>
  );
};

export default StoriesBar;
