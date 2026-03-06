'use client';

import { useEffect } from 'react';

export function SuperadminLoginBackground() {
  useEffect(() => {
    const canvas = document.getElementById('superadmin-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      hue: number;
    }> = [];

    // Create larger flame-like particles
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100, // Start from bottom
        size: Math.random() * 5 + 3, // Bigger particles: 3-8px
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 30, // Orange hue variation
      });
    }

    const animate = () => {
      // Create gradient background from off-white at top to darker orange at bottom
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#fcf6e3'); // Off-white background
      gradient.addColorStop(1, '#fdf1e3'); // Slightly warmer at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Orange to dark orange color based on position (flame effect)
        const progress = 1 - particle.y / canvas.height;
        let color: string;
        
        if (progress > 0.7) {
          // Top: darker orange
          color = `rgba(194, 95, 26, ${particle.opacity * 0.6})`;
        } else if (progress > 0.4) {
          // Middle: medium orange
          color = `rgba(244, 120, 18, ${particle.opacity * 0.7})`;
        } else {
          // Bottom: lighter orange
          color = `rgba(250, 169, 56, ${particle.opacity * 0.5})`;
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Move upward (flame direction)
        particle.y -= particle.speed;
        
        // Spread horizontally slightly as they rise
        particle.x += Math.sin(particle.y * 0.01) * 0.5;
        
        // Reset when reaching top
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
          particle.opacity = Math.random() * 0.4 + 0.1;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      id="superadmin-canvas"
      className="absolute inset-0 z-0"
      style={{ display: 'block' }}
    />
  );
}
