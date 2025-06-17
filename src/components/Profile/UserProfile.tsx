
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Heart, MessageCircle, Settings, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  like_count: number;
  comment_count: number;
}

const UserProfile = ({ userId }: UserProfileProps) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
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
      .select('id, media_urls, like_count, comment_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data || []);
    setLoading(false);
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
      fetchProfile(); // Refresh counts
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading || !profile) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex justify-center">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-light">{profile.username}</h1>
              {profile.is_verified && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  ✓
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={toggleFollow}
                  disabled={followLoading}
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
              )}
            </div>
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <div className="font-semibold">{profile.post_count}</div>
              <div className="text-gray-600 text-sm">posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profile.follower_count}</div>
              <div className="text-gray-600 text-sm">followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profile.following_count}</div>
              <div className="text-gray-600 text-sm">following</div>
            </div>
          </div>

          {profile.full_name && (
            <div className="font-semibold">{profile.full_name}</div>
          )}

          {profile.bio && (
            <div className="whitespace-pre-wrap">{profile.bio}</div>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {profile.website}
            </a>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            POSTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600">
                {isOwnProfile ? "Share your first post!" : "No posts to show"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square relative group cursor-pointer">
                  <img
                    src={post.media_urls[0]}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5 fill-white" />
                      <span>{post.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5 fill-white" />
                      <span>{post.comment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
