
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
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <UserProfile userId={profileUserId} />
    </div>
  );
};

export default Profile;
