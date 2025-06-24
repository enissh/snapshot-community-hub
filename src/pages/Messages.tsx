
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import ConversationsList from '@/components/Messages/ConversationsList';
import ChatWindow from '@/components/Messages/ChatWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, MessageSquare, Zap, Crown, Hash } from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_verified: boolean;
}

const colorRooms = [
  {
    id: 'neon-lounge',
    name: 'Neon Lounge',
    description: 'Electric conversations in purple & cyan',
    gradient: 'from-purple-500 to-cyan-400',
    icon: '💜'
  },
  {
    id: 'crimson-chat',
    name: 'Crimson Chat',
    description: 'Hot discussions in red & magenta',
    gradient: 'from-red-500 to-pink-500',
    icon: '❤️'
  },
  {
    id: 'aura-club',
    name: 'Aura Club',
    description: 'Mystical vibes in lime & electric',
    gradient: 'from-lime-400 to-cyan-300',
    icon: '✨'
  }
];

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUsersList(true);
    } else {
      setShowUsersList(false);
    }
  }, [searchQuery, allUsers]);

  const fetchAllUsers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, is_verified')
      .neq('id', user.id)
      .limit(50);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setAllUsers(data || []);
  };

  const startChat = (userId: string) => {
    setSelectedUserId(userId);
    setShowUsersList(false);
    setSearchQuery('');
  };

  // Mobile layout when chat is selected
  if (selectedUserId) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <ChatWindow 
          userId={selectedUserId} 
          onBack={() => setSelectedUserId(null)}
        />
      </div>
    );
  }

  // Desktop/tablet layout or mobile when no chat selected
  return (
    <div className="min-h-screen plazoid-grid bg-background">
      <Header />
      <div className="h-[calc(100vh-4rem)] flex plazoid-card m-0 sm:m-4 sm:max-w-6xl sm:mx-auto overflow-hidden">
        <div className="w-full flex flex-col">
          {/* Messages Header */}
          <div className="p-4 sm:p-6 border-b border-primary/20 bg-background">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-hologram font-['Orbitron']">Messages</h2>
              <Button className="neon-button text-sm sm:text-base">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users in the future..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 plazoid-card border-primary/20 text-foreground bg-background/50 text-base rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-background">
            {showUsersList ? (
              /* Search Results */
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-foreground font-['Orbitron']">Search Results</h3>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found in this dimension</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => startChat(u.id)}
                        className="flex items-center gap-3 p-3 hover:bg-primary/10 rounded-lg cursor-pointer interactive-glow plazoid-glass"
                      >
                        <div className="story-ring">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={u.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-['Orbitron']">
                              {u.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{u.username}</h3>
                            {u.is_verified && <Crown className="h-4 w-4 text-accent flex-shrink-0" />}
                          </div>
                          {u.full_name && (
                            <p className="text-sm text-muted-foreground truncate">{u.full_name}</p>
                          )}
                        </div>
                        <Button size="sm" className="neon-button flex-shrink-0">
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Color Rooms */}
                <div className="p-4 border-b border-primary/20">
                  <h3 className="text-lg font-semibold mb-4 text-foreground font-['Orbitron'] flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    Color Rooms
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {colorRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => startChat(room.id)}
                        className="room-card"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{room.icon}</span>
                          <h4 className="font-semibold text-foreground font-['Orbitron']">{room.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{room.description}</p>
                        <div className={`h-2 w-full bg-gradient-to-r ${room.gradient} rounded-full mt-3 opacity-60`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="p-4 border-b border-primary/20 bg-background">
                  <div 
                    onClick={() => startChat('ai-assistant')}
                    className="flex items-center gap-3 p-3 hover:bg-primary/10 rounded-lg cursor-pointer hologram transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground font-['Orbitron']">PlazoidAI Assistant</h3>
                      <p className="text-sm text-muted-foreground">Your guide to the digital future!</p>
                    </div>
                    <div className="achievement-badge w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🤖</span>
                    </div>
                  </div>
                </div>

                {/* Recent Chats */}
                <ConversationsList onSelectConversation={setSelectedUserId} />

                {/* Suggested People */}
                <div className="p-4 bg-background">
                  <h3 className="text-lg font-semibold mb-4 text-foreground font-['Orbitron']">Future Connections</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allUsers.slice(0, 6).map((u) => (
                      <div
                        key={u.id}
                        onClick={() => startChat(u.id)}
                        className="plazoid-card p-3 text-center cursor-pointer interactive-glow transition-colors"
                      >
                        <div className="story-ring mx-auto mb-2 w-fit">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={u.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-['Orbitron']">
                              {u.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                        {u.is_verified && <Crown className="h-3 w-3 text-accent mx-auto mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Messages;
