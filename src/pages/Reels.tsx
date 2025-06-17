
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Layout/Header';
import LikeButton from '@/components/Post/LikeButton';

interface Reel {
  id: string;
  media_urls: string[];
  caption: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const Reels = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReelIndex && isPlaying) {
          video.play();
        } else {
          video.pause();
        }
        video.muted = isMuted;
      }
    });
  }, [currentReelIndex, isPlaying, isMuted]);

  const fetchReels = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        media_urls,
        caption,
        like_count,
        comment_count,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('media_type', 'video')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reels:', error);
      return;
    }

    setReels(data || []);
    setLoading(false);
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="relative" onWheel={handleScroll}>
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`h-screen w-full flex items-center justify-center relative ${
              index === currentReelIndex ? 'block' : 'hidden'
            }`}
          >
            {/* Video */}
            <video
              ref={el => videoRefs.current[index] = el}
              src={reel.media_urls[0]}
              className="h-full w-auto max-w-md object-cover rounded-lg cursor-pointer"
              loop
              onClick={handleVideoClick}
              onEnded={() => {
                if (currentReelIndex < reels.length - 1) {
                  setCurrentReelIndex(prev => prev + 1);
                }
              }}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <div className="bg-black/50 rounded-full p-4 animate-fade-in">
                  <Play className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="absolute bottom-4 left-4 right-20 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={reel.profiles.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                    {reel.profiles.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{reel.profiles.username}</span>
                <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  Follow
                </Button>
              </div>
              
              {reel.caption && (
                <p className="text-sm mb-2">{reel.caption}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6">
              <div className="flex flex-col items-center">
                <LikeButton postId={reel.id} likeCount={reel.like_count} />
                <span className="text-white text-sm mt-1">{reel.like_count}</span>
              </div>

              <div className="flex flex-col items-center">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <span className="text-white text-sm mt-1">{reel.comment_count}</span>
              </div>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Send className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Bookmark className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {reels.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full ${
                    idx === currentReelIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Navigation Hints */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-white/30" />
            <span>Scroll</span>
            <div className="w-px h-8 bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reels;
