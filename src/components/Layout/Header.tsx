
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
  Zap,
  LogOut,
  User,
  Settings,
  Compass,
  Video,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
      <header className="glass-effect sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <Zap className="h-8 w-8 text-indigo-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
              Plazoid
            </h1>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modern-input pl-10"
              />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 rounded-full">
              <Home className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/explore')} className="hover:bg-white/10 rounded-full">
              <Compass className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="sm:hidden hover:bg-white/10 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/reels')} className="hover:bg-white/10 rounded-full">
              <Video className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="hover:bg-white/10 relative rounded-full">
              <Heart className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="hover:bg-white/10 relative rounded-full">
              <MessageCircle className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="modern-card">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-white/10 cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-white/10 cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-red-500/20 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="glass-effect fixed bottom-0 left-0 right-0 md:hidden z-50 border-t border-white/10">
        <div className="flex justify-around items-center h-16 px-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="rounded-full">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/reels')} className="rounded-full">
            <Video className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="relative rounded-full">
            <Heart className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="rounded-full">
            <Avatar className="h-7 w-7">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>

      {/* Floating Action Button - Mobile */}
      <Button className="btn-primary fixed bottom-20 right-4 md:hidden rounded-full w-14 h-14 shadow-lg" onClick={() => navigate('/create')}>
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
};

export default Header;
