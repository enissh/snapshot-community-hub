
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Image, Video, Filter } from 'lucide-react';
import Header from '@/components/Layout/Header';
import StoriesBar from '@/components/Stories/StoriesBar';
import Feed from '@/components/Feed/Feed';

const Home = () => {
  const [feedFilter, setFeedFilter] = useState('all');

  return (
    <div className="min-h-screen bg-background feed-grid">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Stories Bar */}
        <StoriesBar />

        {/* Feed Filter Tabs */}
        <div className="plaza-card p-4 mb-6">
          <Tabs value={feedFilter} onValueChange={setFeedFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 text-large">
                <Filter className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-primary/20 text-large">
                <Image className="h-4 w-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-primary/20 text-large">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-primary/20 text-large">
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Feed */}
        <Feed filter={feedFilter} />

        {/* Load More Button */}
        <div className="text-center mt-8">
          <Button className="orange-button text-large">
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Home;
