
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Crown, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background feed-grid flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="plaza-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Camera className="h-16 w-16 text-primary animate-pulse-orange" />
                <Crown className="h-6 w-6 text-accent absolute -top-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              PlazaGram
            </CardTitle>
            <p className="text-xl text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              The Future of Visual Sharing
              <Sparkles className="h-5 w-5 text-accent" />
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground text-large leading-relaxed">
                PlazaGram is a revolutionary social media platform that brings together the best of 
                visual storytelling, real-time communication, and community building. Built with 
                cutting-edge AI technology, PlazaGram offers an Instagram-level experience with 
                a futuristic twist.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="plaza-card p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">🚀 Features</h3>
                  <ul className="text-left text-muted-foreground space-y-2">
                    <li>• Photo & Video Sharing</li>
                    <li>• Stories & Reels</li>
                    <li>• Real-time Messaging</li>
                    <li>• AI-Powered Recommendations</li>
                    <li>• Advanced Privacy Controls</li>
                  </ul>
                </div>
                
                <div className="plaza-card p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">🎨 Design</h3>
                  <ul className="text-left text-muted-foreground space-y-2">
                    <li>• Orange & White Theme</li>
                    <li>• Dark Mode First</li>
                    <li>• Mobile Responsive</li>
                    <li>• Smooth Animations</li>
                    <li>• Modern UI/UX</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-6 plaza-card">
                <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-accent" />
                  Creator
                </h3>
                <p className="text-xl text-foreground mb-2">
                  Made with <Heart className="h-5 w-5 text-destructive inline mx-1" /> by
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Enis Shabani (King Mbreti) 👑
                </p>
                <p className="text-muted-foreground mt-4">
                  "Building the future of social media, one post at a time."
                </p>
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-muted-foreground italic">
                  Built with love using AI technology and modern web standards.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center pt-6">
              <Button onClick={() => navigate('/auth')} className="orange-button text-large">
                Join PlazaGram
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="border-primary/20 text-large">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
