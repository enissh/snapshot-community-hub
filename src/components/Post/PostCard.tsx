
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: {
    id: string;
    caption: string | null;
    media_urls: string[];
    media_type: 'photo' | 'video';
    location: string | null;
    like_count: number;
    comment_count: number;
    created_at: string;
    user: {
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
    };
  };
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {post.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{post.user.username}</span>
              {post.user.is_verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            {post.location && (
              <span className="text-xs text-gray-500">{post.location}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Media */}
      <div className="aspect-square">
        {post.media_type === 'video' ? (
          <video
            src={post.media_urls[0]}
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          <img
            src={post.media_urls[0]}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <LikeButton 
              postId={post.id} 
              likeCount={post.like_count}
            />
            <Button variant="ghost" size="icon" className="p-0">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="p-0">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="p-0">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Like Count */}
        {post.like_count > 0 && (
          <div className="font-semibold text-sm mb-2">
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.user.username}</span>
            {post.caption}
          </div>
        )}

        {/* Comments */}
        <CommentSection postId={post.id} commentCount={post.comment_count} />

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-2">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
