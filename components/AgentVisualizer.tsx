
import React, { useEffect, useRef } from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';

interface Props {
  history: SemanticState[];
  isProcessing: boolean;
  activeAgents: AgentRole[];
}

export const AgentVisualizer: React.FC<Props> = ({ history, isProcessing, activeAgents }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const dots: { x: number, y: number, vx: number, vy: number }[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background network
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      dots.forEach((dot, i) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        dots.slice(i + 1).forEach(other => {
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      // Draw active agents constellation
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 120;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);

        // Connection to center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 30, 30, 0.5)';
        ctx.stroke();

        // Node
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#3b82f6' : '#262626';
        ctx.fill();
        if (isActive) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#3b82f6';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Label
        ctx.fillStyle = isActive ? '#fff' : '#525252';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - 12);
      });

      // Core anchor
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#3b82f6' : '#404040';
      ctx.fill();
      if (isProcessing) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [activeAgents, isProcessing]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={400} 
      className="max-w-full h-auto opacity-80"
    />
  );
};
