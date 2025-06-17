
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  follower_count: number;
}

interface SearchPageProps {
  onUserSelect: (userId: string) => void;
}

const SearchPage = ({ onUserSelect }: SearchPageProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchResult[]>([]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchSuggestedUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, follower_count')
      .neq('id', user?.id)
      .order('follower_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching suggested users:', error);
      return;
    }

    setSuggestedUsers(data || []);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, follower_count')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(20);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayUsers = searchQuery.trim() ? searchResults : suggestedUsers;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-lg py-3"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          {searchQuery.trim() ? 'Search Results' : 'Suggested for you'}
        </h2>

        {loading ? (
          <div className="text-center py-8">Searching...</div>
        ) : displayUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery.trim() ? 'No users found' : 'No suggestions available'}
          </div>
        ) : (
          <div className="space-y-4">
            {displayUsers.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => onUserSelect(profile.id)}
                  >
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div 
                    className="cursor-pointer"
                    onClick={() => onUserSelect(profile.id)}
                  >
                    <h3 className="font-semibold">{profile.username}</h3>
                    {profile.full_name && (
                      <p className="text-gray-600 text-sm">{profile.full_name}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {profile.follower_count} followers
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUserSelect(profile.id)}
                >
                  <User className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
