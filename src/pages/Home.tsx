
import Header from '@/components/Layout/Header';
import StoriesBar from '@/components/Stories/StoriesBar';
import Feed from '@/components/Feed/Feed';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <StoriesBar />
        <Feed />
      </main>
    </div>
  );
};

export default Home;
