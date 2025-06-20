
import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      container.appendChild(particle);

      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      }, 6000);
    };

    const interval = setInterval(createParticle, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div ref={particlesRef} className="particles" />;
};

export default ParticleBackground;
