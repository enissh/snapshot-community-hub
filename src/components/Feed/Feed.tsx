
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from '@/components/Post/PostCard';
import { Loader2 } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

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
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
