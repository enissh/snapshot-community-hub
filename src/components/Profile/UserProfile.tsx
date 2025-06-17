
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Heart, MessageCircle, UserPlus, UserMinus, Play, Bookmark, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import EditProfile from './EditProfile';

interface UserProfileProps {
  userId: string;
}

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  post_count: number;
}

interface Post {
  id: string;
  media_urls: string[];
  media_type: string;
  like_count: number;
  comment_count: number;
}

const UserProfile = ({ userId }: UserProfileProps) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    fetchReels();
    if (isOwnProfile) {
      fetchSavedPosts();
      fetchTaggedPosts();
    }
    if (currentUser && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, media_urls, media_type, like_count, comment_count')
      .eq('user_id', userId)
      .eq('media_type', 'photo')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  };

  const fetchReels = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, media_urls, media_type, like_count, comment_count')
      .eq('user_id', userId)
      .eq('media_type', 'video')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reels:', error);
      return;
    }

    setReels(data || []);
  };

  const fetchSavedPosts = async () => {
    // This would require a saved_posts table
    setSavedPosts([]);
  };

  const fetchTaggedPosts = async () => {
    // This would require a post_tags table
    setTaggedPosts([]);
  };

  const checkFollowStatus = async () => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId)
      .single();

    setIsFollowing(!!data);
  };

  const toggleFollow = async () => {
    if (!currentUser || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast.success('Followed successfully');
      }
      fetchProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const PostGrid = ({ posts }: { posts: Post[] }) => (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square relative group cursor-pointer">
          {post.media_type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                src={post.media_urls[0]}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute top-2 right-2">
                <Play className="h-5 w-5 text-white" />
              </div>
            </div>
          ) : (
            <img
              src={post.media_urls[0]}
              alt="Post"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
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
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Profile Header */}
      <div className="cyber-card p-6 mb-8 holographic">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-primary/50 animate-pulse-neon">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-accent text-white">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-light text-foreground">{profile.username}</h1>
                {profile.is_verified && (
                  <Badge className="bg-primary text-primary-foreground animate-pulse-neon">
                    ✓ Verified
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <EditProfile />
                ) : (
                  <>
                    <Button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={isFollowing ? "border-primary/20 hover:bg-primary/20" : "neon-button"}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/20">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="font-bold text-xl text-foreground">{profile.post_count}</div>
                <div className="text-muted-foreground text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-primary transition-colors">
                <div className="font-bold text-xl text-foreground">{profile.follower_count}</div>
                <div className="text-muted-foreground text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-primary transition-colors">
                <div className="font-bold text-xl text-foreground">{profile.following_count}</div>
                <div className="text-muted-foreground text-sm">following</div>
              </div>
            </div>

            {profile.full_name && (
              <div className="font-semibold text-foreground">{profile.full_name}</div>
            )}

            {profile.bio && (
              <div className="whitespace-pre-wrap text-foreground">{profile.bio}</div>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 cyber-card border-primary/20">
          <TabsTrigger value="posts" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">POSTS</span>
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">REELS</span>
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger value="saved" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">SAVED</span>
              </TabsTrigger>
              <TabsTrigger value="tagged" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">TAGGED</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-8">
          {posts.length === 0 ? (
            <div className="text-center py-12 cyber-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">No posts yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "Share your first post!" : "No posts to show"}
              </p>
            </div>
          ) : (
            <PostGrid posts={posts} />
          )}
        </TabsContent>

        <TabsContent value="reels" className="mt-8">
          {reels.length === 0 ? (
            <div className="text-center py-12 cyber-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">No reels yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "Create your first reel!" : "No reels to show"}
              </p>
            </div>
          ) : (
            <PostGrid posts={reels} />
          )}
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="saved" className="mt-8">
              <div className="text-center py-12 cyber-card">
                <h3 className="text-lg font-semibold mb-2 text-foreground">No saved posts</h3>
                <p className="text-muted-foreground">Save posts to view them here</p>
              </div>
            </TabsContent>

            <TabsContent value="tagged" className="mt-8">
              <div className="text-center py-12 cyber-card">
                <h3 className="text-lg font-semibold mb-2 text-foreground">No tagged posts</h3>
                <p className="text-muted-foreground">Posts you're tagged in will appear here</p>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfile;
