
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import ConversationsList from '@/components/Messages/ConversationsList';
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
    id: 'neon-lounge',
    name: 'Neon Lounge',
    description: 'Electric conversations',
    color: 'from-indigo-500 to-purple-600',
    icon: '💜'
  },
  {
    id: 'crimson-chat',
    name: 'Crimson Chat', 
    description: 'Hot discussions',
    color: 'from-red-500 to-pink-500',
    icon: '❤️'
  },
  {
    id: 'cyber-space',
    name: 'Cyber Space',
    description: 'Future vibes',
    color: 'from-cyan-500 to-blue-500', 
    icon: '🚀'
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

  // Mobile layout when chat is selected
  if (selectedUserId) {
    return (
      <ChatWindow 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  // Main messages page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="modern-card p-6 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <Button className="btn-primary">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
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
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
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
          <div className="space-y-6">
            {/* Color Rooms */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-400" />
                Color Rooms
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {colorRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => startChat(room.id)}
                    className="p-4 rounded-lg cursor-pointer transition-all hover:scale-105 bg-gradient-to-r hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, rgb(99 102 241 / 0.1), rgb(147 51 234 / 0.1))`,
                      border: '1px solid rgb(99 102 241 / 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{room.icon}</span>
                      <h3 className="font-semibold text-white">{room.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{room.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="modern-card p-6">
              <div 
                onClick={() => startChat('ai-assistant')}
                className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
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

            {/* Recent Conversations */}
            <ConversationsList onSelectConversation={setSelectedUserId} />

            {/* Suggested People */}
            {!loading && allUsers.length > 0 && (
              <div className="modern-card p-6">
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
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-white truncate">{u.username}</p>
                      {u.is_verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile padding */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Messages;
