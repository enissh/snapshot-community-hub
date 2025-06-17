
import Header from '@/components/Layout/Header';
import NotificationsList from '@/components/Notifications/NotificationsList';

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationsList />
    </div>
  );
};

export default Notifications;
