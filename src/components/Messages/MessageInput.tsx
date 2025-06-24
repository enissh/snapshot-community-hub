
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Zap } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendReaction: (emoji: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  sending: boolean;
}

const MessageInput = ({ onSendMessage, onSendReaction, onTyping, sending }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing indicator
    if (onTyping) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      } else if (!value.trim() && isTyping) {
        setIsTyping(false);
        onTyping(false);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 2 seconds of no typing
      if (value.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
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

  const reactions = ['😊', '❤️', '🔥', '⚡', '🚀', '✨'];

  return (
    <div className="chat-input-container mobile-safe-area">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex gap-1">
            {reactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                type="button"
                onClick={() => onSendReaction(emoji)}
                className="text-lg hover:scale-110 transition-transform p-2 h-auto rounded-full hover:bg-primary/10"
                aria-label={`Send ${emoji} reaction`}
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Message the future..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="chat-input pr-12"
              autoComplete="off"
              aria-label="Message input"
            />
            {isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="typing-indicator">
                  <div className="typing-dot w-1 h-1"></div>
                  <div className="typing-dot w-1 h-1"></div>
                  <div className="typing-dot w-1 h-1"></div>
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            aria-label="Send message"
            className="neon-button rounded-full p-3 flex-shrink-0"
          >
            {sending ? (
              <div className="loading-logo w-4 h-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
