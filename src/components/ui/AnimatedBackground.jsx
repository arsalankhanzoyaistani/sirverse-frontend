import React, { useEffect, useRef } from "react";

/**
 * ✨ Light Particle Background
 * Subtle particles for light theme
 */
export default function AnimatedBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Create subtle particles
    const createParticles = () => {
      const particles = [];
      const particleCount = Math.min(20, Math.floor(window.innerWidth / 30));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: `rgba(59, 130, 246, ${Math.random() * 0.1})`,
        });
      }
      return particles;
    };

    let particles = createParticles();

    const drawParticle = (particle) => {
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const updateParticles = () => {
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x <= 0) particle.x = canvas.width;
        if (particle.x >= canvas.width) particle.x = 0;
        if (particle.y <= 0) particle.y = canvas.height;
        if (particle.y >= canvas.height) particle.y = 0;
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Light background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(drawParticle);
      updateParticles();
      
      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-5 pointer-events-none opacity-40"
      style={{ background: 'transparent' }}
    />
  );
}
