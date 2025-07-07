
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, TrendingUp, Users, Hash, MapPin, Heart, MessageCircle, RefreshCw, ExternalLink, Clock, Star, ThumbsUp, Flame, Zap, Globe, Coffee, Lightbulb } from 'lucide-react';
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

interface ExploreCard {
  id: string;
  type: 'news' | 'tip' | 'fact' | 'meme';
  title: string;
  content: string;
  image?: string;
  url?: string;
  reactions: {
    likes: number;
    fire: number;
    comments: number;
  };
  timestamp: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [exploreCards, setExploreCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    await Promise.all([
      fetchExplorePosts(),
      fetchSuggestedUsers(),
      fetchTrendingHashtags(),
      fetchNews(),
      generateExploreCards()
    ]);
    setLoading(false);
  };

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
      '#Plazoid', '#TechNews', '#Viral', '#Daily', '#Trending', '#Fun',
      '#LifeHacks', '#Culture', '#Lifestyle', '#Innovation', '#Mood', '#Vibes'
    ]);
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=5f81f40a30b44c51aeeb0dd9f6d87fd5`
      );
      const data = await response.json();
      
      if (data.articles) {
        setNewsArticles(data.articles.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback mock data
      setNewsArticles([
        {
          title: "Latest Tech Innovations Shape the Future",
          description: "Discover the newest technological breakthroughs changing our world.",
          url: "#",
          urlToImage: "/placeholder.svg",
          publishedAt: new Date().toISOString(),
          source: { name: "Tech Today" }
        }
      ]);
    }
  };

  const generateExploreCards = () => {
    const cards: ExploreCard[] = [
      {
        id: '1',
        type: 'tip',
        title: '💡 Daily Life Hack',
        content: 'Put your phone in airplane mode instead of turning it off completely. It charges 50% faster!',
        reactions: { likes: 234, fire: 89, comments: 45 },
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'fact',
        title: '🌟 Fun Fact',
        content: 'Honey never spoils! Archaeologists have found edible honey in ancient Egyptian tombs.',
        reactions: { likes: 567, fire: 234, comments: 78 },
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        type: 'news',
        title: '📱 Tech Update',
        content: 'New AI breakthrough allows real-time language translation in video calls.',
        reactions: { likes: 445, fire: 123, comments: 89 },
        timestamp: '6 hours ago'
      },
      {
        id: '4',
        type: 'tip',
        title: '☕ Morning Tip',
        content: 'Drink water immediately after waking up. It kickstarts your metabolism and hydrates your body.',
        reactions: { likes: 678, fire: 234, comments: 123 },
        timestamp: '8 hours ago'
      },
      {
        id: '5',
        type: 'meme',
        title: '😂 Viral Meme',
        content: 'When you realize it\'s Monday tomorrow but you haven\'t finished your weekend plans yet...',
        reactions: { likes: 1234, fire: 567, comments: 234 },
        timestamp: '10 hours ago'
      },
      {
        id: '6',
        type: 'fact',
        title: '🧠 Mind Blown',
        content: 'Your brain uses about 20% of your body\'s total energy, even though it only weighs 2% of your body weight.',
        reactions: { likes: 890, fire: 345, comments: 156 },
        timestamp: '12 hours ago'
      }
    ];
    setExploreCards(cards);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllContent();
    setRefreshing(false);
  };

  const handleReaction = (cardId: string, reactionType: 'likes' | 'fire' | 'comments') => {
    setExploreCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, reactions: { ...card.reactions, [reactionType]: card.reactions[reactionType] + 1 } }
        : card
    ));
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Header />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
                <p className="text-gray-600 text-sm">Discover what's trending</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search trending topics, users, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-base"
                onKeyPress={(e) => e.key === 'Enter' && searchContent()}
              />
            </div>
            <Button onClick={searchContent} className="h-12 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0 mb-6">
            <TabsList className="grid w-full grid-cols-4 bg-orange-50 h-12">
              <TabsTrigger value="discover" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg">
                <Zap className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="people" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg">
                <Users className="h-4 w-4 mr-2" />
                People
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg">
                <Hash className="h-4 w-4 mr-2" />
                News
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exploreCards.map((card) => (
                <div key={card.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                      {card.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{card.timestamp}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{card.content}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleReaction(card.id, 'likes')}
                        className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{card.reactions.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleReaction(card.id, 'fire')}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Flame className="h-4 w-4" />
                        <span className="text-sm">{card.reactions.fire}</span>
                      </button>
                      <button 
                        onClick={() => handleReaction(card.id, 'comments')}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{card.reactions.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {explorePosts.map((post) => (
                <div key={post.id} className="aspect-square relative group cursor-pointer rounded-2xl overflow-hidden">
                  {post.media_type === 'video' ? (
                    <video
                      src={post.media_urls[0]}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={post.media_urls[0]}
                      alt="Trending post"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
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

          <TabsContent value="people">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0 text-center hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
                    {user.is_verified && <Star className="h-4 w-4 text-orange-500" />}
                  </div>
                  
                  {user.full_name && (
                    <p className="text-sm text-gray-600 truncate mb-2">{user.full_name}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-4">
                    {user.follower_count} followers
                  </p>
                  
                  <Button size="sm" className="w-full h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Trending Topics</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((hashtag, index) => (
                    <span key={hashtag} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200 cursor-pointer transition-colors">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsArticles.map((article, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    {article.urlToImage && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                        {article.source.name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                    
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-200"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Full Article
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile padding for navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Explore;
