import React, { useMemo } from 'react';

interface RainEffectProps {
  intensity: 'light' | 'medium' | 'heavy';
}

export const RainEffect: React.FC<RainEffectProps> = ({ intensity }) => {
  const dropCount = useMemo(() => {
    switch (intensity) {
      case 'light': return 50;
      case 'medium': return 150;
      case 'heavy': return 400;
      default: return 100;
    }
  }, [intensity]);

  const drops = useMemo(() => {
    return Array.from({ length: dropCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${0.5 + Math.random() * 0.5}s`,
      animationDelay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [dropCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};
