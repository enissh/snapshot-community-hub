
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendReaction: (emoji: string) => Promise<void>;
  sending: boolean;
}

const MessageInput = ({ onSendMessage, onSendReaction, sending }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    await onSendMessage(messageContent);
  };

  return (
    <div className="sticky bottom-0 p-3 sm:p-4 border-t border-primary/20 bg-background/95 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          variant="ghost"
          type="button"
          onClick={() => onSendReaction('😊')}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Send smile reaction"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          disabled={sending}
          className="flex-1 rounded-full py-2 px-4 bg-muted/50 focus:bg-muted/80 placeholder:text-muted-foreground border-primary/20"
          autoComplete="off"
          aria-label="Message input"
        />
        <Button
          type="submit"
          disabled={sending || !newMessage.trim()}
          aria-label="Send message"
          className="rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
