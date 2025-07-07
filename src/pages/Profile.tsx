
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/Profile/UserProfile';
import Header from '@/components/Layout/Header';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  // If no userId in params, show current user's profile
  const profileUserId = userId || user?.id;

  if (!profileUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
            <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      <UserProfile userId={profileUserId} />
    </div>
  );
};

export default Profile;
