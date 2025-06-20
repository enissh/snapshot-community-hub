
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

const FollowersModal = ({ isOpen, onClose, userId, type, title }: FollowersModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query;
      
      if (type === 'followers') {
        query = supabase
          .from('follows')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              username,
              full_name,
              avatar_url,
              is_verified
            )
          `)
          .eq('following_id', userId);
      } else {
        query = supabase
          .from('follows')
          .select(`
            following_id,
            profiles:following_id (
              id,
              username,
              full_name,
              avatar_url,
              is_verified
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const userList = data?.map((item: any) => item.profiles).filter(Boolean) || [];
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-primary/20 max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-hologram">{title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 cyber-card border-primary/20 text-foreground bg-background"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-logo w-12 h-12"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No users found' : `No ${type} yet`}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <div 
                  className="story-ring cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{user.username}</h3>
                    {user.is_verified && <Crown className="h-4 w-4 text-accent" />}
                  </div>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground">{user.full_name}</p>
                  )}
                </div>

                <FollowButton 
                  userId={user.id} 
                  username={user.username}
                />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
