import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CreateStory from './CreateStory';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [userHasStory, setUserHasStory] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    // Get active stories (not expired)
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        user_id,
        media_url,
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
    
    // Check if current user has an active story
    const hasStory = data?.some(story => story.user_id === user?.id);
    setUserHasStory(!!hasStory);
  };

  // Group stories by user (show latest story per user)
  const uniqueUserStories = stories.reduce((acc: Story[], story) => {
    const existingUser = acc.find(s => s.user_id === story.user_id);
    if (!existingUser) {
      acc.push(story);
    }
    return acc;
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {/* Current user's story */}
        <div className="flex flex-col items-center gap-1 min-w-0">
          <div className="relative">
            <div className={`p-0.5 rounded-full ${
              userHasStory ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : ''
            }`}>
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CreateStory />
          </div>
          <span className="text-xs text-gray-700 text-center truncate w-16">
            Your story
          </span>
        </div>

        {/* Other users' stories */}
        {uniqueUserStories
          .filter(story => story.user_id !== user?.id)
          .map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 min-w-0">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <Avatar className="h-14 w-14 border-2 border-white">
                  <AvatarImage src={story.profiles.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {story.profiles.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-gray-700 text-center truncate w-16">
                {story.profiles.username}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StoriesBar;
