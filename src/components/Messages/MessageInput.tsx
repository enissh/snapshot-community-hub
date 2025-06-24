
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';

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

  const reactions = ['😊', '❤️', '👍', '😂', '😢', '😮'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (onTyping) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      } else if (!value.trim() && isTyping) {
        setIsTyping(false);
        onTyping(false);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Reactions */}
      <div className="flex gap-2 justify-center">
        {reactions.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            type="button"
            onClick={() => onSendReaction(emoji)}
            className="text-lg hover:scale-110 transition-transform p-2 h-auto rounded-full hover:bg-white/10"
            disabled={sending}
          >
            {emoji}
          </Button>
        ))}
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="modern-input pr-4"
            autoComplete="off"
          />
        </div>
        
        <Button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="btn-primary rounded-full p-3 aspect-square"
        >
          {sending ? (
            <div className="loading-spinner w-4 h-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
