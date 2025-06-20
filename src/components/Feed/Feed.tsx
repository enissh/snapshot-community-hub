
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from '@/components/Post/PostCard';
import { Loader2, Users } from 'lucide-react';

interface FeedProps {
  filter?: string;
}

const Feed = ({ filter = 'all' }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            is_verified,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'photos') {
        query = query.eq('media_type', 'photo');
      } else if (filter === 'videos') {
        query = query.in('media_type', ['video', 'reel']);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsWithUserData = data?.map(post => ({
        ...post,
        user: post.profiles
      })) || [];

      setPosts(postsWithUserData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-large">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 plaza-card">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">No posts yet</h3>
        <p className="text-muted-foreground text-large">
          {filter === 'friends' ? 'Follow some friends to see their posts!' : 'Be the first to share something amazing!'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default Feed;
