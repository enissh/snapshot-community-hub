import { useState, useRef, useEffect } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Handle viewport height changes on mobile when keyboard appears
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Keep focus on input for better UX
    if (inputRef.current) {
      inputRef.current.focus();
    }

    await onSendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 p-3 sm:p-4 border-t border-primary/20 bg-background/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => onSendReaction('😊')}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 p-2"
            aria-label="Send smile reaction"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="w-full rounded-full py-3 px-4 bg-muted/50 focus:bg-muted/80 placeholder:text-muted-foreground border-primary/20 text-base"
              autoComplete="off"
              aria-label="Message input"
            />
          </div>
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            aria-label="Send message"
            className="rounded-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
