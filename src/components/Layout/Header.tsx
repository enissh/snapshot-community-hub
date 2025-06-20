
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
  Shield
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
    <header className="plaza-card sticky top-0 z-50 border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative">
            <Camera className="h-8 w-8 text-primary animate-pulse-orange" />
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
              className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground text-large"
            />
          </form>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-primary/20 hover:text-primary">
            <Home className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/explore')} className="hover:bg-primary/20 hover:text-primary">
            <Compass className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="sm:hidden hover:bg-primary/20 hover:text-primary">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/reels')} className="hover:bg-primary/20 hover:text-primary">
            <Video className="h-5 w-5" />
          </Button>
          
          <CreatePost />
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="hover:bg-primary/20 hover:text-primary">
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="hover:bg-primary/20 hover:text-primary">
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20">
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
            <DropdownMenuContent align="end" className="w-52 plaza-card border-primary/20">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-primary/20 text-large">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-primary/20 text-large">
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-primary/20 text-large">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/20 text-large">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
