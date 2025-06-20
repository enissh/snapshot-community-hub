
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Zap, 
  Crown, 
  Star,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    stories: true
  });
  const [privacy, setPrivacy] = useState({
    privateAccount: false,
    showOnlineStatus: true,
    allowMessageRequests: true,
    showActivity: true
  });
  const [userLevel, setUserLevel] = useState(5);
  const [userXP, setUserXP] = useState(2340);
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Post', icon: '📸', unlocked: true },
    { id: 2, name: 'Social Butterfly', icon: '🦋', unlocked: true },
    { id: 3, name: 'Viral Creator', icon: '🔥', unlocked: false },
    { id: 4, name: 'Community Leader', icon: '👑', unlocked: false }
  ]);

  const updateNotificationSetting = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Notification settings updated');
  };

  const updatePrivacySetting = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success('Privacy settings updated');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(`${darkMode ? 'Light' : 'Dark'} mode activated`);
  };

  return (
    <div className="min-h-screen cyber-grid pb-20 md:pb-0">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="cyber-card p-6 mb-6">
          <h1 className="text-3xl font-bold text-hologram mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your PlazaGram experience</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="cyber-card mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/20">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/20">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="gamification" className="data-[state=active]:bg-primary/20">
              <Star className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card className="cyber-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="story-ring">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-2xl">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">@username</h3>
                      <p className="text-muted-foreground">Level {userLevel} Creator</p>
                      <div className="xp-bar w-32 mt-2">
                        <div className="xp-fill" style={{ width: '60%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{userXP}/4000 XP</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="username" className="cyber-card border-primary/20" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user?.email} disabled className="cyber-card border-primary/20" />
                    </div>
                  </div>
                  
                  <Button className="neon-button">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="cyber-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'likes', label: 'Likes on your posts', icon: Heart },
                  { key: 'comments', label: 'Comments on your posts', icon: MessageCircle },
                  { key: 'follows', label: 'New followers', icon: Users },
                  { key: 'messages', label: 'Direct messages', icon: MessageCircle },
                  { key: 'stories', label: 'Story interactions', icon: Eye }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-4 hologram rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <Label htmlFor={key} className="text-foreground">{label}</Label>
                    </div>
                    <Switch
                      id={key}
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) => updateNotificationSetting(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="cyber-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'privateAccount', label: 'Private Account', description: 'Only approved followers can see your posts' },
                  { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re active' },
                  { key: 'allowMessageRequests', label: 'Allow Message Requests', description: 'Receive messages from people you don\'t follow' },
                  { key: 'showActivity', label: 'Show Activity Status', description: 'Let others see your recent activity' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 hologram rounded-lg">
                    <div>
                      <Label htmlFor={key} className="text-foreground font-medium">{label}</Label>
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    <Switch
                      id={key}
                      checked={privacy[key as keyof typeof privacy]}
                      onCheckedChange={(checked) => updatePrivacySetting(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="cyber-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 hologram rounded-lg">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                    <div>
                      <Label className="text-foreground font-medium">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground mt-1">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>

                <div className="p-4 hologram rounded-lg">
                  <h3 className="text-foreground font-medium mb-4">Theme Previews</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Neon', 'Matrix', 'Cyberpunk', 'Classic', 'Aurora', 'Cosmic'].map((theme) => (
                      <div key={theme} className="cyber-card p-3 text-center cursor-pointer interactive-glow">
                        <div className={`w-full h-16 rounded-lg mb-2 ${
                          theme === 'Neon' ? 'bg-gradient-to-r from-primary to-accent' :
                          theme === 'Matrix' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          theme === 'Cyberpunk' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`} />
                        <p className="text-sm text-foreground">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification">
            <div className="space-y-6">
              <Card className="cyber-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Level & Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="achievement-badge w-16 h-16 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-hologram">Level {userLevel} Creator</h3>
                      <p className="text-muted-foreground mb-2">{userXP}/4000 XP to next level</p>
                      <div className="xp-bar w-full">
                        <div className="xp-fill" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="cyber-card p-4 text-center">
                      <div className="text-2xl font-bold text-primary">127</div>
                      <div className="text-sm text-muted-foreground">Posts Created</div>
                    </div>
                    <div className="cyber-card p-4 text-center">
                      <div className="text-2xl font-bold text-accent">1.2K</div>
                      <div className="text-sm text-muted-foreground">Total Likes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`flex items-center gap-3 p-4 rounded-lg border ${
                          achievement.unlocked 
                            ? 'hologram border-primary/30' 
                            : 'cyber-card border-primary/10 opacity-50'
                        }`}
                      >
                        <div className={`text-2xl ${achievement.unlocked ? 'animate-pulse-neon' : ''}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.unlocked ? 'Unlocked!' : 'Keep creating to unlock'}
                          </p>
                        </div>
                        {achievement.unlocked && (
                          <Crown className="h-4 w-4 text-accent ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
