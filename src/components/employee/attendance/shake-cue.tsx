'use client';

import React, { useEffect, useState } from 'react';

interface TimedShakeProps {
  children: React.ReactNode;
  interval?: number;   // how often to trigger shake
  duration?: number;   // how long the shake lasts
}

export const TimedShake: React.FC<TimedShakeProps> = ({
  children,
  interval = 2000,
  duration = 500,
}) => {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), duration);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, duration]);

  return (
    <div className={shaking ? 'animate-shake inline-block' : 'inline-block'}>
      {children}
    </div>
  );
};
