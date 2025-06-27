
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
    color: 'primary',
    icon: '💬'
  },
  {
    id: 'tech-talk',
    name: 'Tech Talk', 
    description: 'Technology discussions',
    color: 'secondary',
    icon: '🚀'
  },
  {
    id: 'lounge',
    name: 'Lounge',
    description: 'Casual conversations',
    color: 'tertiary', 
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="modern-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
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
          <div className="modern-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Search Results</h2>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startChat(u.id)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-gray-100"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{u.username}</h3>
                        {u.is_verified && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      {u.full_name && (
                        <p className="text-sm text-gray-500 truncate">{u.full_name}</p>
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
          <div className="space-y-6">
            {/* Chat Rooms */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Hash className="h-5 w-5 text-orange-500" />
                Chat Rooms
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {colorRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => startChat(room.id)}
                    className={`room-card ${room.color}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{room.icon}</span>
                      <h3 className="font-semibold">{room.name}</h3>
                    </div>
                    <p className="text-sm opacity-90">{room.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="modern-card p-6">
              <div 
                onClick={() => startChat('ai-assistant')}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-gray-100"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Plazoid AI</h3>
                  <p className="text-sm text-gray-500">Your personal assistant</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">🤖</span>
                </div>
              </div>
            </div>

            {/* Suggested People */}
            {!loading && allUsers.length > 0 && (
              <div className="modern-card p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Suggested People</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allUsers.slice(0, 8).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => startChat(u.id)}
                      className="p-4 text-center cursor-pointer hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
                    >
                      <Avatar className="h-14 w-14 mx-auto mb-3">
                        <AvatarImage src={u.avatar_url || ''} />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-gray-900 truncate">{u.username}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile padding for navigation */}
      <div className="h-6 md:h-0"></div>
    </div>
  );
};

export default Messages;
