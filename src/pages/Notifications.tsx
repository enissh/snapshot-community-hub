
import Header from '@/components/Layout/Header';
import NotificationsList from '@/components/Notifications/NotificationsList';

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      <NotificationsList />
    </div>
  );
};

export default Notifications;
