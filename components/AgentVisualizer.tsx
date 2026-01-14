
import React, { useEffect, useRef, useState } from 'react';
import { AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { Lock, Target, X, Info } from 'lucide-react';

interface Props {
  isProcessing: boolean;
  activeAgents: AgentRole[];
  focusedAgent: AgentRole | null;
  isFocusLocked: boolean;
  onAgentClick: (role: AgentRole) => void;
  onAgentDblClick: (role: AgentRole) => void;
  onBackgroundClick: () => void;
}

export const AgentVisualizer: React.FC<Props> = ({ 
  isProcessing, activeAgents, focusedAgent, isFocusLocked, onAgentClick, onAgentDblClick, onBackgroundClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flashNode, setFlashNode] = useState<AgentRole | null>(null);
  const [previousFocused, setPreviousFocused] = useState<AgentRole | null>(null);
  const [fadeAlpha, setFadeAlpha] = useState(0); 

  useEffect(() => {
    if (focusedAgent) {
      if (focusedAgent !== previousFocused) {
        setFlashNode(focusedAgent);
        setTimeout(() => setFlashNode(null), 400);
      }
      setFadeAlpha(1);
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

    const handleDblClickInteraction = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 90;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (dist < 22) {
          onAgentDblClick(role);
        }
      });
    };

    canvas.addEventListener('click', handleInteraction);
    canvas.addEventListener('dblclick', handleDblClickInteraction);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 90;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      // Focus indicator decay
      if (!focusedAgent && fadeAlpha > 0) {
        setFadeAlpha(prev => Math.max(0, prev - 0.05));
      }

      // Topology Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Logic Path Connections
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;
        const isFading = !focusedAgent && fadeAlpha > 0 && role === previousFocused;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        
        if (isFocused || isFading) {
          const currentAlpha = isFocused ? 1 : fadeAlpha;
          ctx.strokeStyle = isFocusLocked ? `rgba(255, 255, 51, ${currentAlpha})` : `rgba(51, 255, 255, ${currentAlpha})`;
          ctx.lineWidth = (isFocusLocked ? 3 : 2) * currentAlpha;
          ctx.shadowBlur = (isFocusLocked ? 20 : (15 + Math.sin(time / 200) * 5)) * currentAlpha;
          ctx.shadowColor = isFocusLocked ? 'rgba(255, 255, 51, 0.8)' : 'rgba(51, 255, 255, 0.8)';
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -time / 50;
        } else {
          ctx.strokeStyle = isActive ? 'rgba(51, 255, 51, 0.3)' : 'rgba(255, 51, 51, 0.1)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });

      // Ensemble Nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;
        const isFlashing = flashNode === role;
        const isFadingNode = !focusedAgent && fadeAlpha > 0 && role === previousFocused;

        // Visual Status Glows
        // - Focus Locked: static yellow glow (no pulsing)
        // - Focused (Unlocked): bright cyan pulsing glow
        // - Active but not focused: subtle green glow
        if (isFocused || isFadingNode) {
          const currentAlpha = isFocused ? 1 : fadeAlpha;
          const pulse = isFocusLocked ? 1 : (1 + Math.sin(time / 200) * 0.2);
          const haloSize = (isFocusLocked ? 32 : 28) * currentAlpha * pulse;
          const gradient = ctx.createRadialGradient(x, y, 5, x, y, haloSize);
          gradient.addColorStop(0, isFocusLocked ? `rgba(255, 255, 51, ${0.4 * currentAlpha})` : `rgba(51, 255, 255, ${0.3 * currentAlpha})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, haloSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (isActive) {
          const haloSize = 18;
          const gradient = ctx.createRadialGradient(x, y, 2, x, y, haloSize);
          gradient.addColorStop(0, 'rgba(51, 255, 51, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, haloSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core Node Body
        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 12 : 8, 0, Math.PI * 2);
        
        if (isFocused || isFadingNode) {
          const currentAlpha = isFocused ? 1 : fadeAlpha;
          ctx.fillStyle = isFocusLocked ? `rgba(255, 255, 51, ${currentAlpha})` : `rgba(51, 255, 255, ${currentAlpha})`;
        } else if (isActive) {
          ctx.fillStyle = '#33ff33';
        } else {
          ctx.fillStyle = '#1a0510';
        }
        
        ctx.shadowBlur = isFocused ? (isFocusLocked ? 25 : 15) : (isActive ? 10 : 0);
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fill();
        ctx.strokeStyle = (isFocused || isActive || isFadingNode) ? '#ffffff' : '#440000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brief flash on focus
        if (isFlashing) {
          ctx.beginPath();
          ctx.arc(x, y, 40, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 6;
          ctx.stroke();
        }

        // Role Indicator Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffff33' : '#33ffff') : (isActive ? '#33ff33' : '#666');
        if (isFadingNode) ctx.fillStyle = `rgba(51, 255, 255, ${fadeAlpha})`;
        ctx.font = '900 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - 24);
      });

      // Central Processing Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#ffff33' : (activeAgents.length > 0 ? '#33ff33' : '#ff3333');
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.fill();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('click', handleInteraction);
      canvas.removeEventListener('dblclick', handleDblClickInteraction);
    };
  }, [activeAgents, isProcessing, focusedAgent, isFocusLocked, flashNode, fadeAlpha]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative p-2 overflow-hidden bg-black/20">
      {/* Topology Header Indicator */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-10">
        <div className={`flex items-center gap-3 px-5 py-2 rounded-full border bg-black/80 backdrop-blur-xl transition-all duration-500 shadow-2xl ${focusedAgent ? (isFocusLocked ? 'border-yellow-500 scale-105 shadow-[0_0_30px_rgba(255,255,51,0.4)]' : 'border-blue-500 scale-100 shadow-[0_0_20px_rgba(51,255,255,0.2)]') : 'border-neutral-800 opacity-60'}`}>
          <Target size={14} className={isFocusLocked ? 'neon-yellow' : 'neon-blue'} />
          <span className={`text-[11px] font-black uppercase tracking-[0.25em] ${isFocusLocked ? 'neon-yellow' : (focusedAgent ? 'neon-blue' : 'text-neutral-500')}`}>
            {focusedAgent ? (isFocusLocked ? `FOCUS LOCKED: ${focusedAgent}` : `PROBE ISOLATION: ${focusedAgent}`) : 'SYSTEM_TOPOLOGY_ACTIVE'}
          </span>
          {isFocusLocked && <Lock size={12} className="neon-yellow animate-pulse" />}
        </div>
      </div>

      <canvas ref={canvasRef} width={300} height={300} className="w-full max-w-[300px] cursor-crosshair" />

      {/* Dynamic Interaction Tooltip */}
      {focusedAgent && (
        <div className="absolute top-[25%] right-8 flex flex-col items-end gap-2 pointer-events-none max-w-[180px] text-right bg-black/80 p-3 border border-white/10 backdrop-blur-md rounded shadow-2xl">
           <span className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] leading-tight flex items-center gap-1.5">
              <Info size={10} /> Reset via Background Click
           </span>
           {!isFocusLocked && (
             <span className="text-[8px] font-black uppercase text-blue-500/90 tracking-[0.2em] leading-tight mt-1 animate-pulse">
                Dbl-click node for Focus Lock
             </span>
           )}
           {isFocusLocked && (
             <span className="text-[8px] font-black uppercase text-yellow-500 tracking-[0.2em] leading-tight mt-1">
                Logical Isolation Verified
             </span>
           )}
        </div>
      )}

      {/* Prominent Clear Focus Button */}
      {focusedAgent && (
        <button 
          onClick={(e) => { e.stopPropagation(); onBackgroundClick(); }}
          className="absolute bottom-14 right-8 flex items-center gap-3 bg-[#660000]/90 hover:bg-red-600 border border-red-400 text-white text-[10px] font-black uppercase px-8 py-3 rounded-sm transition-all shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:shadow-[0_0_40px_rgba(255,0,0,0.8)] active:scale-95 group z-20"
        >
          <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          Clear Isolation
        </button>
      )}

      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-neutral-600 border-t border-white/5 pt-2">
         <span>Topology_Sync</span>
         <div className="flex gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-yellow-500 shadow-[0_0_8px_yellow]' : 'bg-red-500 shadow-[0_0_8px_red]'}`} />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_green]" />
         </div>
      </div>
    </div>
  );
};
