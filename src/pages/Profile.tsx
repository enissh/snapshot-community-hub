
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">User not found</h2>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UserProfile userId={profileUserId} />
    </div>
  );
};

export default Profile;
