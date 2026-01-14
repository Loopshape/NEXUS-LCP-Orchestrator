
import React, { useEffect, useRef, useState } from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { Lock, Unlock, Zap, Target } from 'lucide-react';

interface Props {
  isProcessing: boolean;
  activeAgents: AgentRole[];
  focusedAgent: AgentRole | null;
  isFocusLocked: boolean;
  onAgentClick: (role: AgentRole) => void;
  onBackgroundClick: () => void;
}

export const AgentVisualizer: React.FC<Props> = ({ 
  isProcessing, activeAgents, focusedAgent, isFocusLocked, onAgentClick, onBackgroundClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flashNode, setFlashNode] = useState<AgentRole | null>(null);
  const [previousFocused, setPreviousFocused] = useState<AgentRole | null>(null);

  useEffect(() => {
    if (focusedAgent && focusedAgent !== previousFocused) {
      setFlashNode(focusedAgent);
      setTimeout(() => setFlashNode(null), 400);
    }
    setPreviousFocused(focusedAgent);
  }, [focusedAgent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const handleInteraction = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 90;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      let hit = false;
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (dist < 22) {
          onAgentClick(role);
          hit = true;
        }
      });
      if (!hit) onBackgroundClick();
    };

    canvas.addEventListener('click', handleInteraction);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 90;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      // Draw Topology Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 25) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw Connections (Advanced Pulse)
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
          ctx.strokeStyle = isFocusLocked ? '#ffff33' : '#33ffff';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -time / 50;
        } else {
          ctx.strokeStyle = isActive ? 'rgba(51, 255, 51, 0.4)' : 'rgba(255, 51, 51, 0.15)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;
        const isFlashing = flashNode === role;

        // Halo
        if (isFocused) {
            const haloSize = 25 + Math.sin(time / 200) * 5;
            const gradient = ctx.createRadialGradient(x, y, 5, x, y, haloSize);
            gradient.addColorStop(0, isFocusLocked ? 'rgba(255, 255, 51, 0.2)' : 'rgba(51, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, haloSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core Node
        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 11 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffff33' : '#33ffff') : (isActive ? '#33ff33' : '#1a0510');
        ctx.shadowBlur = (isFocused || isActive) ? 10 : 0;
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fill();
        ctx.strokeStyle = (isFocused || isActive) ? '#ffffff' : '#440000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (isFlashing) {
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Title Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffff33' : '#33ffff') : (isActive ? '#33ff33' : '#888');
        ctx.font = '800 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - 22);
      });

      // Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#ffff33' : '#ff3333';
      ctx.shadowBlur = isProcessing ? 15 : 5;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.fill();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('click', handleInteraction);
    };
  }, [activeAgents, isProcessing, focusedAgent, isFocusLocked, flashNode]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative p-2 overflow-hidden">
      {/* Topology Header Indicator */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border bg-black/60 backdrop-blur-md transition-all duration-500 ${focusedAgent ? (isFocusLocked ? 'border-yellow-500 scale-105' : 'border-blue-500 scale-100') : 'border-red-900/50 opacity-40'}`}>
          <Target size={12} className={isFocusLocked ? 'neon-yellow animate-spin-slow' : 'neon-blue'} />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isFocusLocked ? 'neon-yellow' : (focusedAgent ? 'neon-blue' : 'text-neutral-500')}`}>
            {focusedAgent ? (isFocusLocked ? `LOCKED: ${focusedAgent}` : `PROBE: ${focusedAgent}`) : 'SYSTEM_NOMINAL'}
          </span>
          {isFocusLocked && <Lock size={10} className="neon-yellow" />}
        </div>
      </div>

      <canvas ref={canvasRef} width={300} height={300} className="w-full max-w-[300px]" />

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-neutral-600">
         <span>Topological_Sync</span>
         <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${isProcessing ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div className="w-1 h-1 rounded-full bg-green-500" />
         </div>
      </div>
    </div>
  );
};
