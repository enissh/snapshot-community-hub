
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Heart, UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  username: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton = ({ userId, username, onFollowChange }: FollowButtonProps) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId, currentUser]);

  const checkFollowStatus = async () => {
    if (!currentUser || currentUser.id === userId) return;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking follow status:', error);
      return;
    }

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!currentUser || currentUser.id === userId || loading) return;

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        if (error) throw error;

        setIsFollowing(false);
        toast.success(`You unfollowed @${username}`, {
          icon: '💔',
        });
        onFollowChange?.(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast.success(`You are now following @${username} 👑`, {
          icon: '❤️',
          description: `Get ready for amazing content!`,
        });
        onFollowChange?.(true);

        // Create follow notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            actor_id: currentUser.id,
            type: 'follow',
            message: `@${currentUser.email?.split('@')[0]} started following you`
          });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (!currentUser || currentUser.id === userId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      className={`${
        isFollowing 
          ? 'border-primary/30 text-foreground hover:bg-destructive/20 hover:text-destructive hover:border-destructive' 
          : 'neon-button'
      } transition-all duration-300`}
    >
      {loading ? (
        <div className="loading-logo w-4 h-4 mr-2" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
