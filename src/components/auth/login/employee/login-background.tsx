'use client';

import { useEffect, useRef } from 'react';

export function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Pixel art elements
    const pixels: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    const colors = [
      '#E07A5F', // Warm orange
      '#D46A3A', // Darker orange
      '#F4C430', // Golden yellow
      '#F5E6D3', // Cream
      '#C4A57B', // Warm tan
      '#A0826D', // Brown
    ];

    // Create initial pixels
    for (let i = 0; i < 30; i++) {
      pixels.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 0.5 + 0.5,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FFF5E6');
      gradient.addColorStop(0.5, '#FFFAF0');
      gradient.addColorStop(1, '#FFE8D6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw pixels
      pixels.forEach((pixel, index) => {
        pixel.x += pixel.vx;
        pixel.y += pixel.vy;
        pixel.life -= 0.01;

        // Bounce off edges
        if (pixel.x < 0 || pixel.x > canvas.width) pixel.vx *= -1;
        if (pixel.y < 0 || pixel.y > canvas.height) pixel.vy *= -1;

        // Draw pixel with opacity based on life
        ctx.fillStyle = pixel.color + Math.floor(pixel.life * 255).toString(16).padStart(2, '0');
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);

        // Regenerate dead pixels
        if (pixel.life <= 0) {
          pixels[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: Math.random() * 0.5 + 0.5,
          };
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}
