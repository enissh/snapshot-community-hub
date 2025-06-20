
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  Camera,
  LogOut,
  User,
  Settings,
  Compass,
  Video,
  Plus,
  Crown,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import CreatePost from '@/components/Post/CreatePost';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="cyber-card sticky top-0 z-50 border-b border-primary/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer interactive-glow" onClick={() => navigate('/')}>
            <div className="relative">
              <Camera className="h-8 w-8 text-primary animate-pulse-neon" />
              <Crown className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PlazaGram
            </h1>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users, hashtags, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 cyber-card border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="interactive-glow hover:text-primary">
              <Home className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/explore')} className="interactive-glow hover:text-primary">
              <Compass className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="sm:hidden interactive-glow hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/reels')} className="interactive-glow hover:text-primary">
              <Video className="h-5 w-5" />
            </Button>
            
            <CreatePost />
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="interactive-glow hover:text-primary relative">
              <Heart className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="interactive-glow hover:text-primary relative">
              <MessageCircle className="h-5 w-5" />
              <div className="online-dot absolute -top-1 -right-1" />
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full interactive-glow">
                  <div className="story-ring">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 cyber-card border-primary/20">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-primary/20">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-primary/20">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-primary/20">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/easter-egg')} className="hover:bg-primary/20">
                  <Star className="h-4 w-4 mr-2" />
                  Secret
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="interactive-glow">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="interactive-glow">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/reels')} className="interactive-glow">
            <Video className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="interactive-glow relative">
            <Heart className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="interactive-glow">
            <div className="story-ring">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </Button>
        </div>
      </div>

      {/* Floating Action Button - Mobile */}
      <Button className="fab md:hidden neon-button" onClick={() => navigate('/create')}>
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
};

export default Header;
