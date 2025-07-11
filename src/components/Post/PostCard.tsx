
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, CheckCircle, Crown, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { toast } from 'sonner';

interface PostCardProps {
  post: {
    id: string;
    caption: string;
    media_urls: string[];
    location: string | null;
    created_at: string;
    like_count: number;
    comment_count: number;
    profiles: {
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
      full_name: string | null;
    };
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === post.media_urls.length - 1 ? 0 : prev + 1
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? post.media_urls.length - 1 : prev - 1
    );
  };

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
      toast("❤️ Liked!");
    }
  };

  const handleShare = () => {
    navigator.share?.({
      title: `Check out this post on PlazaGram`,
      text: post.caption || 'Amazing content on PlazaGram!',
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    });
  };

  return (
    <Card className="cyber-card w-full max-w-lg mx-auto mb-6 animate-fade-in overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="story-ring">
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarImage src={post.profiles.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                {post.profiles.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{post.profiles.username}</p>
              {post.profiles.is_verified && (
                <Crown className="h-4 w-4 text-accent" />
              )}
              <div className="online-dot" />
            </div>
            {post.profiles.full_name && (
              <p className="text-sm text-muted-foreground">{post.profiles.full_name}</p>
            )}
            {post.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{post.location}</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="interactive-glow">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Media */}
      <CardContent className="p-0">
        <div 
          className="relative aspect-square bg-secondary"
          onDoubleClick={handleDoubleClick}
        >
          {post.media_urls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={prevMedia}
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={nextMedia}
              >
                →
              </Button>
            </>
          )}
          
          {isVideo(post.media_urls[currentMediaIndex]) ? (
            <video
              src={post.media_urls[currentMediaIndex]}
              className="w-full h-full object-cover cursor-pointer"
              controls
              loop
            />
          ) : (
            <img
              src={post.media_urls[currentMediaIndex]}
              alt="Post content"
              className="w-full h-full object-cover cursor-pointer"
            />
          )}
          
          {post.media_urls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {post.media_urls.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentMediaIndex ? 'bg-primary' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Double-tap like animation */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="h-20 w-20 text-primary animate-pulse-neon fill-primary" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <LikeButton postId={post.id} likeCount={post.like_count} />
            <Button 
              variant="ghost" 
              size="icon" 
              className="interactive-glow"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="interactive-glow"
              onClick={handleShare}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="interactive-glow"
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className={`h-6 w-6 ${saved ? 'fill-primary text-primary' : ''}`} />
          </Button>
        </div>

        {/* Like count */}
        <div className="px-4 pb-2">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-2">
            <p className="text-foreground">
              <span className="font-semibold mr-2 text-hologram">{post.profiles.username}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments */}
        <div className="px-4 pb-2">
          <CommentSection 
            postId={post.id} 
            commentCount={post.comment_count}
          />
        </div>

        {/* Timestamp */}
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3" />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
