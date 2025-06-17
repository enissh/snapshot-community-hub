
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    user: {
      username: string;
      avatar_url?: string;
      is_verified: boolean;
    };
    media_urls: string[];
    caption?: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    isLiked?: boolean;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Implement actual like functionality with Supabase
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {post.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{post.user.username}</span>
            {post.user.is_verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-500 text-sm">{timeAgo(post.created_at)}</span>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-gray-100">
        {post.media_urls.length > 0 && (
          <img
            src={post.media_urls[0]}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className="p-0 h-auto hover:bg-transparent"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon" className="p-0 h-auto hover:bg-transparent">
              <MessageCircle className="h-6 w-6 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="p-0 h-auto hover:bg-transparent">
              <Send className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="p-0 h-auto hover:bg-transparent">
            <Bookmark className="h-6 w-6 text-gray-700" />
          </Button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <div className="mb-2">
            <span className="font-semibold text-sm">{likeCount.toLocaleString()} likes</span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-sm mr-2">{post.user.username}</span>
            <span className="text-sm">{post.caption}</span>
          </div>
        )}

        {/* Comments */}
        {post.comment_count > 0 && (
          <button className="text-gray-500 text-sm mb-2">
            View all {post.comment_count} comments
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
