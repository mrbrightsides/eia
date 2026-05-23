
import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
  type?: 'burst' | 'sides' | 'star';
}

const Confetti: React.FC<ConfettiProps> = ({ active, onComplete, duration = 3000, type = 'burst' }) => {
  const fire = useCallback(() => {
    if (type === 'burst') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f43f5e', '#fbbf24', '#22c55e', '#a855f7'],
        zIndex: 9999,
      });
    } else if (type === 'sides') {
      const end = Date.now() + duration;
      const colors = ['#6366f1', '#f43f5e', '#fbbf24', '#22c55e', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } else if (type === 'star') {
      const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
        zIndex: 9999,
      };

      const shoot = () => {
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ['star']
        });

        confetti({
          ...defaults,
          particleCount: 10,
          scalar: 0.75,
          shapes: ['circle']
        });
      };

      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    }
  }, [type, duration]);

  useEffect(() => {
    if (active) {
      fire();
      if (onComplete) {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [active, fire, onComplete, duration]);

  return null;
};

export default Confetti;
