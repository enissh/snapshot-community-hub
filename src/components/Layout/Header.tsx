
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  MessageCircle, 
  User,
  LogOut,
  Settings,
  Search,
  Zap,
  X
} from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="glass-effect sticky top-0 z-40 border-b border-gray-700 md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
            <Zap className="h-6 w-6 text-indigo-500" />
            <h1 className="text-lg font-bold text-white">Plazoid</h1>
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="glass-effect sticky top-0 z-40 border-b border-gray-700 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Zap className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-white">Plazoid</h1>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 rounded-full">
              <Home className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="hover:bg-white/10 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="hover:bg-white/10 relative rounded-full">
              <MessageCircle className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hover:bg-white/10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-600 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="hover:bg-white/10 rounded-full">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-500/20 text-red-400 rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-600 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{user?.email}</p>
                <p className="text-gray-400 text-sm">@{user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            <nav className="space-y-2 px-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-white/10"
                onClick={() => handleNavigation('/')}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-white/10"
                onClick={() => handleNavigation('/search')}
              >
                <Search className="h-5 w-5 mr-3" />
                Search
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-white/10 relative"
                onClick={() => handleNavigation('/messages')}
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
                <div className="absolute right-4 w-2 h-2 bg-indigo-500 rounded-full" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-white/10"
                onClick={() => handleNavigation('/profile')}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-white/10"
                onClick={() => handleNavigation('/settings')}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
            </nav>
          </div>

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-red-500/20 text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
