
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Star, Zap, Users, Globe, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="cyber-card p-12 hologram">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="story-ring">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-hologram">PlazaGram</h1>
            </div>
            <p className="text-xl text-cyber mb-6">The Future of Visual Sharing</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience social media reimagined with cutting-edge AI, futuristic design, 
              and next-generation features that connect people like never before.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <Zap className="h-8 w-8" />,
              title: "AI-Powered",
              description: "Smart captions, hashtag suggestions, and personalized content recommendations"
            },
            {
              icon: <Star className="h-8 w-8" />,
              title: "Futuristic Design",
              description: "Glassmorphism UI with neon accents and smooth animations"
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Real-time Social",
              description: "Instant messaging, live stories, and seamless interactions"
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: "Global Community",
              description: "Connect with creators and innovators worldwide"
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Achievement System",
              description: "Level up, earn badges, and unlock exclusive features"
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Privacy First",
              description: "Advanced security and granular privacy controls"
            }
          ].map((feature, index) => (
            <div key={index} className="cyber-card p-6 interactive-glow">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Creator Section */}
        <div className="cyber-card p-8 mb-16">
          <div className="text-center">
            <div className="achievement-badge w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Crown className="h-12 w-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-hologram mb-4">Created by King Mbreti 👑</h2>
            <p className="text-lg text-cyber mb-6">Enis Shabani</p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Visionary developer and digital innovator, crafting the future of social media 
              with AI-powered experiences and cutting-edge technology. PlazaGram represents 
              the perfect fusion of creativity, technology, and community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 cyber-card px-4 py-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm">Built with passion</span>
              </div>
              <div className="flex items-center gap-2 cyber-card px-4 py-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm">Powered by AI</span>
              </div>
              <div className="flex items-center gap-2 cyber-card px-4 py-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm">Future-ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { number: "100K+", label: "Active Users" },
            { number: "1M+", label: "Posts Shared" },
            { number: "50K+", label: "Stories Created" },
            { number: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={index} className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center cyber-card p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Join the Future?</h2>
          <p className="text-muted-foreground mb-6">
            Experience the next generation of social media today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} className="neon-button">
              Explore PlazaGram
            </Button>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/20">
              Learn More
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-primary/20">
          <p className="text-lg text-hologram font-semibold mb-2">
            Made by Enis Shabani (King Mbreti) 👑
          </p>
          <p className="text-sm text-muted-foreground">
            © 2025 PlazaGram. All rights reserved. Built with cutting-edge technology and endless creativity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
