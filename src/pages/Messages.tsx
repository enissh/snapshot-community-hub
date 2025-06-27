
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import ChatWindow from '@/components/Messages/ChatWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, MessageSquare, Hash, Bot } from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_verified: boolean;
}

const colorRooms = [
  {
    id: 'general-chat',
    name: 'General Chat',
    description: 'Main discussion room',
    color: 'bg-indigo-600',
    icon: '💬'
  },
  {
    id: 'tech-talk',
    name: 'Tech Talk', 
    description: 'Technology discussions',
    color: 'bg-purple-600',
    icon: '🚀'
  },
  {
    id: 'lounge',
    name: 'Lounge',
    description: 'Casual conversations',
    color: 'bg-blue-600', 
    icon: '🛋️'
  }
];

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [loading, setLoading] = useState(true);

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

    try {
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (userId: string) => {
    setSelectedUserId(userId);
    setShowUsersList(false);
    setSearchQuery('');
  };

  // Mobile chat view
  if (selectedUserId) {
    return (
      <ChatWindow 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="modern-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <Button className="btn-primary text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {showUsersList ? (
          /* Search Results */
          <div className="modern-card p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Search Results</h2>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startChat(u.id)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{u.username}</h3>
                        {u.is_verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      {u.full_name && (
                        <p className="text-sm text-gray-400 truncate">{u.full_name}</p>
                      )}
                    </div>
                    <Button size="sm" className="btn-primary">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chat Rooms */}
            <div className="modern-card p-4">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-500" />
                Chat Rooms
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {colorRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => startChat(room.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:opacity-80 ${room.color}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{room.icon}</span>
                      <h3 className="font-semibold text-white">{room.name}</h3>
                    </div>
                    <p className="text-sm text-white/80">{room.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="modern-card p-4">
              <div 
                onClick={() => startChat('ai-assistant')}
                className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Plazoid AI</h3>
                  <p className="text-sm text-gray-400">Your personal assistant</p>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
              </div>
            </div>

            {/* Suggested People */}
            {!loading && allUsers.length > 0 && (
              <div className="modern-card p-4">
                <h2 className="text-lg font-semibold mb-4 text-white">Suggested People</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allUsers.slice(0, 8).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => startChat(u.id)}
                      className="p-3 text-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Avatar className="h-12 w-12 mx-auto mb-2">
                        <AvatarImage src={u.avatar_url || ''} />
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-white truncate">{u.username}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile padding for navigation */}
      <div className="h-4 md:h-0"></div>
    </div>
  );
};

export default Messages;
