
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
      </div>
      <div className="mt-8 text-center">
        <h1 className="text-4xl font-bold mb-2">PlazaGram</h1>
        <p className="terminal-loading text-lg">Initializing neural networks...</p>
        <p className="terminal-loading text-sm mt-2">Built by King Mbreti 👑</p>
      </div>
      <div className="mt-8 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
