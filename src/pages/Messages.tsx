
import { useState } from 'react';
import Header from '@/components/Layout/Header';
import MessagesList from '@/components/Messages/MessagesList';
import ChatWindow from '@/components/Messages/ChatWindow';

const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex border border-gray-200 bg-white">
        {!selectedUserId ? (
          <MessagesList onSelectConversation={setSelectedUserId} />
        ) : (
          <ChatWindow 
            userId={selectedUserId} 
            onBack={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;
