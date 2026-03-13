import React, { useEffect, useRef } from 'react';
import './ParticleBackground.css';

function ParticleBackground() {
  const canvasRef = useRef(null);
  const circlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initCircles = () => {
      circlesRef.current = [];
      const numCircles = 8; // Fewer but bigger circles
      
      for (let i = 0; i < numCircles; i++) {
        circlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 80 + 60, // Big circles: 60-140px radius
          vx: (Math.random() - 0.5) * 0.3, // Slow movement
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.15 + 0.05, // Low opacity
          blur: Math.random() * 20 + 10,
          color: `rgba(59, 130, 246, ${Math.random() * 0.2 + 0.1})`, // Blue shades
        });
      }
    };

    const drawCircle = (circle) => {
      // Create gradient for each circle
      const gradient = ctx.createRadialGradient(
        circle.x, circle.y, 0,
        circle.x, circle.y, circle.radius
      );
      
      gradient.addColorStop(0, `rgba(59, 130, 246, ${circle.opacity})`);
      gradient.addColorStop(0.5, `rgba(99, 102, 241, ${circle.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add a subtle stroke for the circle effect
      ctx.strokeStyle = `rgba(59, 130, 246, ${circle.opacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      circlesRef.current.forEach(circle => {
        // Move circle
        circle.x += circle.vx;
        circle.y += circle.vy;

        // Gentle mouse interaction
        const dx = mouseRef.current.x - circle.x;
        const dy = mouseRef.current.y - circle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 300) {
          circle.vx += dx * 0.00001;
          circle.vy += dy * 0.00001;
        }

        // Boundary check with soft bounce
        if (circle.x < -circle.radius) circle.x = canvas.width + circle.radius;
        if (circle.x > canvas.width + circle.radius) circle.x = -circle.radius;
        if (circle.y < -circle.radius) circle.y = canvas.height + circle.radius;
        if (circle.y > canvas.height + circle.radius) circle.y = -circle.radius;

        // Draw the circle
        drawCircle(circle);
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    initCircles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initCircles();
    });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-background"
    />
  );
}

export default ParticleBackground;
