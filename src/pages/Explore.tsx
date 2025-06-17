
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Users, Hash, MapPin, Heart, MessageCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';

interface Post {
  id: string;
  media_urls: string[];
  media_type: string;
  like_count: number;
  comment_count: number;
  caption: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  follower_count: number;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplorePosts();
    fetchSuggestedUsers();
    fetchTrendingHashtags();
  }, []);

  const fetchExplorePosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        media_urls,
        media_type,
        like_count,
        comment_count,
        caption,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('like_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching explore posts:', error);
      return;
    }

    setExplorePosts(data || []);
    setLoading(false);
  };

  const fetchSuggestedUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, follower_count')
      .order('follower_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching suggested users:', error);
      return;
    }

    setSuggestedUsers(data || []);
  };

  const fetchTrendingHashtags = async () => {
    // Mock trending hashtags - in a real app, this would be calculated from post captions
    setTrendingHashtags([
      '#futuristic', '#cyberpunk', '#neon', '#tech', '#AI', '#space',
      '#digital', '#virtual', '#hologram', '#matrix', '#cyber', '#glow'
    ]);
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;

    // Search implementation would go here
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="cyber-card p-6 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search users, hashtags, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-primary/20 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && searchContent()}
              />
            </div>
            <Button onClick={searchContent} className="neon-button">
              Search
            </Button>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="cyber-card border-primary/20 mb-6">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
              <Users className="h-4 w-4 mr-2" />
              Suggested Users
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="data-[state=active]:bg-primary/20">
              <Hash className="h-4 w-4 mr-2" />
              Trending Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {explorePosts.map((post) => (
                <div key={post.id} className="aspect-square relative group cursor-pointer">
                  {post.media_type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={post.media_urls[0]}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                      />
                      <div className="absolute top-2 right-2">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={post.media_urls[0]}
                      alt="Explore post"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white rounded-lg">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5 fill-white" />
                      <span className="font-semibold">{post.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5 fill-white" />
                      <span className="font-semibold">{post.comment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="cyber-card p-4 text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary to-accent p-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-2xl font-bold text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{user.username}</h3>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground truncate">{user.full_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    {user.follower_count} followers
                  </p>
                  <Button size="sm" className="neon-button w-full">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hashtags">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingHashtags.map((hashtag, index) => (
                <div key={hashtag} className="cyber-card p-4 hover:bg-primary/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Hash className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hashtag}</h3>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 1000)}K posts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
