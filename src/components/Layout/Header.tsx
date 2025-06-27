
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
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 md:hidden shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
            <Zap className="h-7 w-7 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Plazoid</h1>
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
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 hidden md:block shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Zap className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Plazoid</h1>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-orange-50 rounded-full text-gray-600 hover:text-orange-600">
              <Home className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="hover:bg-orange-50 rounded-full text-gray-600 hover:text-orange-600">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="hover:bg-orange-50 relative rounded-full text-gray-600 hover:text-orange-600">
              <MessageCircle className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hover:bg-orange-50 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-orange-500 text-white text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="hover:bg-orange-50 rounded-full text-gray-600 hover:text-orange-600">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full">
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-gray-900 font-medium">{user?.email}</p>
                <p className="text-gray-500 text-sm">@{user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            <nav className="space-y-2 px-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => handleNavigation('/')}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => handleNavigation('/search')}
              >
                <Search className="h-5 w-5 mr-3" />
                Search
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-orange-50 relative text-gray-700 hover:text-orange-600"
                onClick={() => handleNavigation('/messages')}
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
                <div className="absolute right-4 w-2 h-2 bg-orange-500 rounded-full" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => handleNavigation('/profile')}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => handleNavigation('/settings')}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
            </nav>
          </div>

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-red-50 text-red-500 hover:text-red-600"
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
