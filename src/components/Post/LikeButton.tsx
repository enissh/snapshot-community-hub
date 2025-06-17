
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  likeCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
}

const LikeButton = ({ postId, initialLiked = false, likeCount, onLikeChange }: LikeButtonProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, postId]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();
    
    setLiked(!!data);
  };

  const toggleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setLiked(false);
        setCurrentLikeCount(prev => prev - 1);
        onLikeChange?.(false, currentLikeCount - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        
        setLiked(true);
        setCurrentLikeCount(prev => prev + 1);
        onLikeChange?.(true, currentLikeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLike}
      disabled={loading}
      className="p-0"
    >
      <Heart 
        className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
      />
    </Button>
  );
};

export default LikeButton;
