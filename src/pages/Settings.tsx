
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
  const [darkMode, setDarkMode] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your Plazoid experience</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-6">
            <TabsList className="grid w-full grid-cols-5 bg-orange-50 h-12 tabs-list">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg text-gray-700 tabs-trigger">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg text-gray-700 tabs-trigger">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg text-gray-700 tabs-trigger">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg text-gray-700 tabs-trigger">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="gamification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg text-gray-700 tabs-trigger">
                <Star className="h-4 w-4 mr-2" />
                Rewards
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">@username</h3>
                    <p className="text-gray-600">Level {userLevel} Creator</p>
                    <div className="w-32 h-2 bg-orange-100 rounded-full mt-2">
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{userXP}/4000 XP</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                    <Input id="username" defaultValue="username" className="mt-2 h-12 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input id="email" defaultValue={user?.email} disabled className="mt-2 h-12 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                  </div>
                </div>
                
                <Button className="mt-6 h-12 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'likes', label: 'Likes on your posts', icon: Heart },
                  { key: 'comments', label: 'Comments on your posts', icon: MessageCircle },
                  { key: 'follows', label: 'New followers', icon: Users },
                  { key: 'messages', label: 'Direct messages', icon: MessageCircle },
                  { key: 'stories', label: 'Story interactions', icon: Eye }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-orange-500" />
                      <Label htmlFor={key} className="text-gray-900 font-medium">{label}</Label>
                    </div>
                    <Switch
                      id={key}
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) => updateNotificationSetting(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'privateAccount', label: 'Private Account', description: 'Only approved followers can see your posts' },
                  { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re active' },
                  { key: 'allowMessageRequests', label: 'Allow Message Requests', description: 'Receive messages from people you don\'t follow' },
                  { key: 'showActivity', label: 'Show Activity Status', description: 'Let others see your recent activity' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <div>
                      <Label htmlFor={key} className="text-gray-900 font-medium">{label}</Label>
                      <p className="text-sm text-gray-600 mt-1">{description}</p>
                    </div>
                    <Switch
                      id={key}
                      checked={privacy[key as keyof typeof privacy]}
                      onCheckedChange={(checked) => updatePrivacySetting(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Appearance & Theme</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="h-5 w-5 text-orange-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
                    <div>
                      <Label className="text-gray-900 font-medium">Dark Mode</Label>
                      <p className="text-sm text-gray-600 mt-1">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>

                <div className="p-4 bg-orange-50 rounded-xl">
                  <h3 className="text-gray-900 font-medium mb-4">Theme Previews</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Orange', 'Blue', 'Purple', 'Green', 'Pink', 'Teal'].map((theme) => (
                      <div key={theme} className="bg-white p-3 text-center cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <div className={`w-full h-16 rounded-lg mb-2 ${
                          theme === 'Orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          theme === 'Blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          theme === 'Purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          theme === 'Green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          theme === 'Pink' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                          'bg-gradient-to-r from-teal-500 to-teal-600'
                        }`} />
                        <p className="text-sm text-gray-900">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gamification">
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Level & Progress</h2>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Level {userLevel} Creator</h3>
                    <p className="text-gray-600 mb-2">{userXP}/4000 XP to next level</p>
                    <div className="w-full h-3 bg-orange-100 rounded-full">
                      <div className="h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 text-center rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">127</div>
                    <div className="text-sm text-gray-600">Posts Created</div>
                  </div>
                  <div className="bg-orange-50 p-4 text-center rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">1.2K</div>
                    <div className="text-sm text-gray-600">Total Likes</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-center gap-3 p-4 rounded-xl ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200' 
                          : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                        <p className="text-sm text-gray-600">
                          {achievement.unlocked ? 'Unlocked!' : 'Keep creating to unlock'}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <Crown className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile padding for navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Settings;
