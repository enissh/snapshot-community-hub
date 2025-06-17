
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

const StoriesBar = () => {
  // Sample stories data - will be replaced with real data from Supabase
  const stories = [
    { id: 1, username: 'your_story', avatar: '', hasStory: false, isOwn: true },
    { id: 2, username: 'john_doe', avatar: '', hasStory: true },
    { id: 3, username: 'jane_smith', avatar: '', hasStory: true },
    { id: 4, username: 'mike_wilson', avatar: '', hasStory: true },
    { id: 5, username: 'sarah_jones', avatar: '', hasStory: true },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 min-w-0">
            <div className="relative">
              <div className={`p-0.5 rounded-full ${
                story.hasStory ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : ''
              }`}>
                <Avatar className="h-14 w-14 border-2 border-white">
                  <AvatarImage src={story.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {story.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {story.isOwn && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  <Plus className="h-3 w-3" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-700 text-center truncate w-16">
              {story.isOwn ? 'Your story' : story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
