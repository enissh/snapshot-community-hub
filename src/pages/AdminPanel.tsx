
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BarChart, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Crown,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    activeUsers: 0
  });
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch analytics
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact' });

      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' });

      setUsers(usersData || []);
      setPosts(postsData || []);
      setAnalytics({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalMessages: messageCount || 0,
        activeUsers: Math.floor((userCount || 0) * 0.3) // Mock active users
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user verification');
    } else {
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully!`);
      fetchData();
    }
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success('Post deleted successfully!');
      fetchData();
    }
  };

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return;

    // In a real app, you would insert this into an announcements table
    toast.success('Announcement sent to all users! 📢');
    setAnnouncement('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background feed-grid">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background feed-grid">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Crown className="h-6 w-6 text-accent" />
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="plaza-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalUsers}</p>
                  <p className="text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="plaza-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <ImageIcon className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalPosts}</p>
                  <p className="text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="plaza-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalMessages}</p>
                  <p className="text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="plaza-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{analytics.activeUsers}</p>
                  <p className="text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="plaza-card border-primary/20 mb-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 text-large">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary/20 text-large">
              <ImageIcon className="h-4 w-4 mr-2" />
              Content Moderation
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-primary/20 text-large">
              <MessageSquare className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="plaza-card">
              <CardHeader>
                <CardTitle className="text-foreground">User Management</CardTitle>
                <CardDescription>Manage user accounts and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground text-large">{user.username}</p>
                            {user.is_verified && <CheckCircle className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-muted-foreground">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.follower_count || 0} followers • {user.post_count || 0} posts
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleUserVerification(user.id, user.is_verified)}
                          variant={user.is_verified ? "outline" : "default"}
                          className={user.is_verified ? "border-primary/20" : "orange-button"}
                          size="sm"
                        >
                          {user.is_verified ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        <Badge variant={user.is_private ? "secondary" : "default"}>
                          {user.is_private ? "Private" : "Public"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="plaza-card">
              <CardHeader>
                <CardTitle className="text-foreground">Content Moderation</CardTitle>
                <CardDescription>Review and moderate user posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <img
                            src={post.media_urls[0]}
                            alt="Post"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-large">
                              @{post.profiles.username}
                            </p>
                            <p className="text-muted-foreground mt-1">
                              {post.caption?.substring(0, 100)}
                              {post.caption?.length > 100 && '...'}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{post.like_count} likes</span>
                              <span>{post.comment_count} comments</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive/20"
                            onClick={() => deletePost(post.id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button variant="outline" size="sm" className="border-primary/20">
                            <Flag className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="plaza-card">
              <CardHeader>
                <CardTitle className="text-foreground">Send Announcement</CardTitle>
                <CardDescription>Broadcast messages to all PlazaGram users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Write your announcement here..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="bg-secondary/50 border-primary/20 text-foreground min-h-32 text-large"
                />
                <Button 
                  onClick={sendAnnouncement}
                  className="orange-button text-large"
                  disabled={!announcement.trim()}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
