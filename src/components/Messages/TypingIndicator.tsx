
import React from 'react';

interface TypingIndicatorProps {
  username: string;
}

const TypingIndicator = ({ username }: TypingIndicatorProps) => {
  return (
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <span className="text-xs text-gray-500 ml-2">
        {username} is typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
