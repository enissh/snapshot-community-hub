
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Bell, Eye, Lock, User, Smartphone, Moon, Sun, Globe } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      stories: false
    },
    privacy: {
      privateAccount: false,
      storyViews: true,
      readReceipts: true,
      onlineStatus: true
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    },
    appearance: {
      darkMode: true,
      language: 'en'
    }
  });

  const updateSetting = (category: string, key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    toast.success('Setting updated');
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="cyber-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="user@example.com"
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>
              </div>
              <Button className="neon-button">Update Account</Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="cyber-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-primary" />
                Privacy
              </CardTitle>
              <CardDescription>Control who can see your content and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Private Account</Label>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
                </div>
                <Switch
                  checked={settings.privacy.privateAccount}
                  onCheckedChange={(checked) => updateSetting('privacy', 'privateAccount', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Story Views</Label>
                  <p className="text-sm text-muted-foreground">Let people see if you viewed their story</p>
                </div>
                <Switch
                  checked={settings.privacy.storyViews}
                  onCheckedChange={(checked) => updateSetting('privacy', 'storyViews', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Read Receipts</Label>
                  <p className="text-sm text-muted-foreground">Let people see when you read their messages</p>
                </div>
                <Switch
                  checked={settings.privacy.readReceipts}
                  onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Online Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're active</p>
                </div>
                <Switch
                  checked={settings.privacy.onlineStatus}
                  onCheckedChange={(checked) => updateSetting('privacy', 'onlineStatus', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="cyber-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Likes</Label>
                <Switch
                  checked={settings.notifications.likes}
                  onCheckedChange={(checked) => updateSetting('notifications', 'likes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-foreground">Comments</Label>
                <Switch
                  checked={settings.notifications.comments}
                  onCheckedChange={(checked) => updateSetting('notifications', 'comments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-foreground">New Followers</Label>
                <Switch
                  checked={settings.notifications.follows}
                  onCheckedChange={(checked) => updateSetting('notifications', 'follows', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-foreground">Messages</Label>
                <Switch
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) => updateSetting('notifications', 'messages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-foreground">Story Updates</Label>
                <Switch
                  checked={settings.notifications.stories}
                  onCheckedChange={(checked) => updateSetting('notifications', 'stories', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="cyber-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactor', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified of suspicious login attempts</p>
                </div>
                <Switch
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
                />
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/20">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/20">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Manage Devices
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="cyber-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Moon className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  checked={settings.appearance.darkMode}
                  onCheckedChange={(checked) => updateSetting('appearance', 'darkMode', checked)}
                />
              </div>

              <div>
                <Label htmlFor="language" className="text-foreground">Language</Label>
                <select
                  id="language"
                  value={settings.appearance.language}
                  onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                  className="w-full mt-1 p-2 bg-secondary/50 border border-primary/20 rounded-md text-foreground"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="cyber-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/20">
                Deactivate Account
              </Button>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
