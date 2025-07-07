
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

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

  const reactions = ['😊', '👍', '❤️', '😂', '😮', '🔥'];

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
    <div className="flex flex-col gap-4">
      {/* Quick Reactions */}
      <div className="flex gap-2 justify-center overflow-x-auto pb-2">
        {reactions.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            type="button"
            onClick={() => onSendReaction(emoji)}
            className="text-lg hover:scale-110 transition-transform p-3 h-auto rounded-full hover:bg-orange-50 flex-shrink-0 border border-gray-200 hover:border-orange-300"
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
            className="h-12 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base px-4"
            autoComplete="off"
          />
        </div>
        
        <Button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
        >
          {sending ? (
            <div className="loading-spinner w-4 h-4" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
