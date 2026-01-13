
import React, { useEffect, useRef } from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';

interface Props {
  history: SemanticState[];
  isProcessing: boolean;
  activeAgents: AgentRole[];
  focusedAgent: AgentRole | null;
  onAgentClick: (role: AgentRole) => void;
  onBackgroundClick: () => void;
}

export const AgentVisualizer: React.FC<Props> = ({ history, isProcessing, activeAgents, focusedAgent, onAgentClick, onBackgroundClick }) => {
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

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 120;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      let clickedAgent = false;
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (dist < 35) { // Increased hit area for better touch/click experience
          onAgentClick(role);
          clickedAgent = true;
        }
      });

      if (!clickedAgent) {
        onBackgroundClick();
      }
    };

    canvas.addEventListener('mousedown', handleCanvasClick);

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

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 120;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      // Draw agent connections first (bottom layer)
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        if (isFocused) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 5;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        } else {
          ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 30, 30, 0.4)';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw agent nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;

        // Node
        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 14 : (isActive ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? '#60a5fa' : (isActive ? '#3b82f6' : '#262626');
        ctx.fill();
        
        if (isFocused) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#60a5fa';
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (isActive) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = isFocused ? '#ffffff' : (isActive ? '#ffffff' : '#525252');
        ctx.font = isFocused ? 'bold 14px JetBrains Mono' : '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - (isFocused ? 26 : 14));
      });

      // Central core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#3b82f6' : '#404040';
      ctx.fill();
      if (isProcessing) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 16 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [activeAgents, isProcessing, focusedAgent, onAgentClick, onBackgroundClick]);

  return (
    <div className="relative group cursor-crosshair">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="max-w-full h-auto opacity-95 transition-all"
      />
      <div className="absolute bottom-4 left-4 mono text-[10px] text-neutral-600 pointer-events-none select-none">
        NEXUS_VISUALIZER_V1.3
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <div className={`px-4 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2 ${focusedAgent ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-black/40 border-neutral-800 text-neutral-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${focusedAgent ? 'bg-blue-400 animate-pulse' : 'bg-neutral-800'}`} />
          <span className="mono text-[10px] font-bold tracking-widest uppercase">
            {focusedAgent ? `ACTIVE_FOCUS: ${focusedAgent}` : 'CONTINUUM_SCAN_READY'}
          </span>
        </div>
      </div>
    </div>
  );
};
