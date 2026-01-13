
import React, { useEffect, useRef } from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  history: SemanticState[];
  isProcessing: boolean;
  activeAgents: AgentRole[];
  focusedAgent: AgentRole | null;
  isFocusLocked: boolean;
  onAgentClick: (role: AgentRole) => void;
  onBackgroundClick: () => void;
}

export const AgentVisualizer: React.FC<Props> = ({ 
  history, 
  isProcessing, 
  activeAgents, 
  focusedAgent, 
  isFocusLocked,
  onAgentClick, 
  onBackgroundClick 
}) => {
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
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
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
        if (dist < 40) { 
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
      const time = Date.now();
      
      // Ambient background network
      ctx.strokeStyle = '#111';
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
          if (dist < 180) {
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

      // Pulse calculations
      const pulseScale = 1 + Math.sin(time / 400) * 0.1;
      const haloOpacity = 0.15 + Math.sin(time / 600) * 0.1;

      // Lines
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;

        // Subtle pulsing halo around connections of focused agent
        if (isFocused) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${haloOpacity * 0.5})`;
          ctx.lineWidth = 12;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        if (isFocused) {
          ctx.strokeStyle = isFocusLocked ? '#60a5fa' : '#3b82f6';
          ctx.lineWidth = isFocusLocked ? 6 : 4;
          ctx.setLineDash([10, 5]);
          ctx.lineDashOffset = -time / 50;
        } else {
          ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 30, 30, 0.5)';
          ctx.lineWidth = isActive ? 2 : 1;
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

        if (isFocused) {
          // Pulsing Halo
          ctx.beginPath();
          ctx.arc(x, y, 35 * pulseScale, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(x, y, 10, x, y, 35 * pulseScale);
          gradient.addColorStop(0, `rgba(59, 130, 246, ${haloOpacity})`);
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Core Circle
        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 14 : (isActive ? 8 : 6), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? '#3b82f6' : (isActive ? '#3b82f6' : '#1a1a1a');
        ctx.fill();
        
        if (isFocused) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = isFocusLocked ? '#fff' : 'rgba(255, 255, 255, 0.8)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, 22 + Math.sin(time / 150) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = isFocusLocked ? '#fff' : '#3b82f6';
          ctx.lineWidth = isFocusLocked ? 3 : 2;
          ctx.stroke();

          ctx.strokeStyle = isFocusLocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.3)';
          ctx.strokeRect(x - 28, y - 28, 56, 56);
        } else if (isActive) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = isFocused ? '#fff' : (isActive ? '#fff' : '#444');
        ctx.font = isFocused ? 'bold 12px JetBrains Mono' : '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase() + (isFocused && isFocusLocked ? ' [LOCKED]' : ''), x, y - (isFocused ? 36 : 18));
      });

      // Central core hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#3b82f6' : '#222';
      ctx.fill();
      if (isProcessing) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20 + Math.sin(time / 100) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [activeAgents, isProcessing, focusedAgent, isFocusLocked, onAgentClick, onBackgroundClick]);

  return (
    <div className="relative group cursor-crosshair select-none bg-black/20 rounded-3xl border border-neutral-900/50 p-4">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="max-w-full h-auto opacity-100 transition-all drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      />
      
      {/* Visual Indicator in Title Area */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className={`px-5 py-2 rounded-full border-2 backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${focusedAgent ? (isFocusLocked ? 'bg-blue-600 border-white text-white' : 'bg-blue-600/10 border-blue-500 text-white') : 'bg-black/40 border-neutral-800 text-neutral-600'}`}>
          {isFocusLocked ? <Lock size={12} className="animate-pulse" /> : (focusedAgent ? <Unlock size={12} /> : <div className={`w-2 h-2 rounded-full ${focusedAgent ? 'bg-blue-400 animate-pulse' : 'bg-neutral-800'}`} />)}
          <span className="mono text-[11px] font-black tracking-widest uppercase">
            {focusedAgent ? (isFocusLocked ? `FOCUS_LOCKED: ${focusedAgent}` : `LCP_ISOLATION: ${focusedAgent}`) : 'SYSTEM_STATE: NOMINAL'}
          </span>
        </div>
        {focusedAgent && (
          <div className="text-[9px] mono text-blue-500/70 font-bold tracking-widest animate-in fade-in slide-in-from-top-1">
            {isFocusLocked ? 'ENVELOPE_REINFORCED' : 'TRACE_EXTRACTION_ACTIVE'}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 mono text-[10px] text-neutral-700 tracking-[0.2em] font-bold">
        LCP_RUNTIME_TOPOLOGY_v1.5
      </div>
      
      <div className="absolute bottom-6 right-6 mono text-[9px] text-neutral-800 max-w-[140px] text-right leading-relaxed">
        NODE: TOGGLE_FOCUS<br/>
        DOUBLE_CLICK: LOCK_FOCUS<br/>
        CANVAS: RESET_VIEW
      </div>
    </div>
  );
};
