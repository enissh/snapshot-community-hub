
import React from 'react';

interface TypingIndicatorProps {
  username: string;
}

const TypingIndicator = ({ username }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 p-3 mb-2">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-xs text-muted-foreground">
        {username} is typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
