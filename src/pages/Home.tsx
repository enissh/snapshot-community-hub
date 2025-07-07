
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Image, Video, Filter, Plus } from 'lucide-react';
import Header from '@/components/Layout/Header';
import StoriesBar from '@/components/Stories/StoriesBar';
import Feed from '@/components/Feed/Feed';

const Home = () => {
  const [feedFilter, setFeedFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stories Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-0">
          <StoriesBar />
        </div>

        {/* Create Post Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Share something amazing</h3>
              <p className="text-gray-600 text-sm">What's on your mind today?</p>
            </div>
          </div>
          <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
            Create Post
          </Button>
        </div>

        {/* Feed Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
          <Tabs value={feedFilter} onValueChange={setFeedFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-orange-50 h-12">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                <Image className="h-4 w-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Feed */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
          <Feed filter={feedFilter} />
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button className="h-12 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
            Load More Posts
          </Button>
        </div>
      </main>
      
      {/* Mobile padding for navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Home;
