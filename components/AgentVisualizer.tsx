
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
        if (dist < 40) { // Large hit area for nodes
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
      
      // Draw ambient background network
      ctx.strokeStyle = '#151515';
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

      // Draw Connection Lines
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
          ctx.lineWidth = 6;
          ctx.shadowBlur = 25;
          ctx.shadowColor = 'rgba(59, 130, 246, 1)';
        } else {
          ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(40, 40, 40, 0.5)';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;

        // Visual distinction for Focused Node
        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 18 : (isActive ? 8 : 6), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? '#60a5fa' : (isActive ? '#3b82f6' : '#1a1a1a');
        ctx.fill();
        
        if (isFocused) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          // Outer Glow Pulse for Focused
          ctx.shadowBlur = 40;
          ctx.shadowColor = '#60a5fa';
          ctx.beginPath();
          ctx.arc(x, y, 24 + Math.sin(Date.now() / 300) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (isActive) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label handling
        ctx.fillStyle = isFocused ? '#ffffff' : (isActive ? '#ffffff' : '#666');
        ctx.font = isFocused ? 'bold 15px JetBrains Mono' : '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - (isFocused ? 32 : 16));
      });

      // Central core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#3b82f6' : '#333';
      ctx.fill();
      if (isProcessing) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18 + Math.sin(Date.now() / 150) * 6, 0, Math.PI * 2);
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
    <div className="relative group cursor-crosshair select-none">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="max-w-full h-auto opacity-100 transition-all filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      />
      <div className="absolute bottom-6 left-6 mono text-[10px] text-neutral-700 tracking-[0.2em] font-bold">
        LCP_RUNTIME_TOPOLOGY_v1.4
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div className={`px-6 py-2 rounded-full border-2 backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${focusedAgent ? 'bg-blue-600/10 border-blue-500 text-blue-400 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-neutral-800 text-neutral-600'}`}>
          <div className={`w-2 h-2 rounded-full ${focusedAgent ? 'bg-blue-400 animate-pulse' : 'bg-neutral-800'}`} />
          <span className="mono text-xs font-black tracking-widest uppercase">
            {focusedAgent ? `FOCUSED_ENTITY: ${focusedAgent}` : 'CONTINUUM_SCAN: READY'}
          </span>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 mono text-[9px] text-neutral-700 max-w-[120px] text-right">
        CLICK_NODE: TOGGLE_FOCUS<br/>CLICK_BG: RESET
      </div>
    </div>
  );
};
