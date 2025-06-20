
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Crown, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back to PlazaGram! 🎉');
        }
      } else {
        if (!username.trim()) {
          toast.error('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome to PlazaGram! Please check your email to verify your account. 📧');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 feed-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Camera className="h-16 w-16 text-primary animate-pulse-orange" />
              <Crown className="h-6 w-6 text-accent absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            PlazaGram
          </h1>
          <p className="text-foreground/80 text-lg flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            The Future of Visual Sharing
            <Sparkles className="h-4 w-4 text-accent" />
          </p>
          <p className="text-muted-foreground mt-2">Built with love by AI</p>
        </div>

        <Card className="plaza-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Join PlazaGram'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="bg-secondary/50 border-primary/20 text-foreground text-large"
                  />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary/50 border-primary/20 text-foreground text-large"
                  />
                </>
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-primary/20 text-foreground text-large"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-primary/20 text-foreground text-large"
              />
              <Button 
                type="submit" 
                className="w-full orange-button text-large"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-accent font-medium text-large transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-muted-foreground text-sm">
          <p>Made by <span className="font-semibold text-primary">Enis Shabani (King Mbreti)</span> 👑</p>
          <p className="mt-2">
            <a href="/about" className="text-accent hover:text-primary transition-colors">About PlazaGram</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
