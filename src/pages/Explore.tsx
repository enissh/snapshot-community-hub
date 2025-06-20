
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, TrendingUp, Users, Hash, MapPin, Heart, MessageCircle, Play, ExternalLink, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';

interface Post {
  id: string;
  media_urls: string[];
  media_type: string;
  like_count: number;
  comment_count: number;
  caption: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  is_verified: boolean;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    fetchExplorePosts();
    fetchSuggestedUsers();
    fetchTrendingHashtags();
    fetchNews();
  }, []);

  const fetchExplorePosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        media_urls,
        media_type,
        like_count,
        comment_count,
        caption,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('like_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching explore posts:', error);
      return;
    }

    setExplorePosts(data || []);
    setLoading(false);
  };

  const fetchSuggestedUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, follower_count, is_verified')
      .order('follower_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching suggested users:', error);
      return;
    }

    setSuggestedUsers(data || []);
  };

  const fetchTrendingHashtags = async () => {
    setTrendingHashtags([
      '#PlazaGram', '#Futuristic', '#Neon', '#Tech', '#AI', '#Space',
      '#Digital', '#Virtual', '#Cyber', '#Matrix', '#Hologram', '#Viral',
      '#Trending', '#Aesthetic', '#Mood', '#Vibes', '#Future', '#Innovation'
    ]);
  };

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=5f81f40a30b44c51aeeb0dd9f6d87fd5`
      );
      const data = await response.json();
      
      if (data.articles) {
        setNewsArticles(data.articles.slice(0, 12));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid">
        <Header />
        <div className="flex justify-center py-12">
          <div className="loading-logo w-16 h-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid pb-20 md:pb-0">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="cyber-card p-6 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search users, hashtags, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 cyber-card border-primary/20 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && searchContent()}
              />
            </div>
            <Button onClick={searchContent} className="neon-button">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="cyber-card border-primary/20 mb-6">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
              <Users className="h-4 w-4 mr-2" />
              Suggested Users
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="data-[state=active]:bg-primary/20">
              <Hash className="h-4 w-4 mr-2" />
              Trending Tags
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-primary/20">
              <Star className="h-4 w-4 mr-2" />
              Latest News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {explorePosts.map((post) => (
                <div key={post.id} className="aspect-square relative group cursor-pointer">
                  {post.media_type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={post.media_urls[0]}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                      />
                      <div className="absolute top-2 right-2">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={post.media_urls[0]}
                      alt="Explore post"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white rounded-lg">
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
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="cyber-card p-4 text-center interactive-glow">
                  <div className="story-ring w-20 h-20 mx-auto mb-3">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-2xl">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{user.username}</h3>
                    {user.is_verified && <Star className="h-4 w-4 text-accent" />}
                  </div>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground truncate mb-2">{user.full_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    {user.follower_count} followers
                  </p>
                  <Button size="sm" className="neon-button w-full">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hashtags">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingHashtags.map((hashtag, index) => (
                <div key={hashtag} className="cyber-card p-4 cursor-pointer transition-colors interactive-glow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Hash className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hashtag}</h3>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 1000) + 100}K posts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-6">
              <div className="cyber-card p-6">
                <h2 className="text-2xl font-bold text-hologram mb-4">📰 Latest Tech News</h2>
                <p className="text-muted-foreground">Stay updated with the latest technology trends and innovations!</p>
              </div>

              {newsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="loading-logo w-16 h-16"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newsArticles.map((article, index) => (
                    <div key={index} className="cyber-card p-4 interactive-glow">
                      {article.urlToImage && (
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {article.source.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {article.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/20 hover:bg-primary/20"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Read Full Article
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
