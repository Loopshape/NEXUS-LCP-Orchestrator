
import React, { useEffect, useRef, useState } from 'react';
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
  onAgentDblClick: (role: AgentRole) => void;
  onBackgroundClick: () => void;
}

export const AgentVisualizer: React.FC<Props> = ({ 
  history, isProcessing, activeAgents, focusedAgent, isFocusLocked, onAgentClick, onAgentDblClick, onBackgroundClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flashNode, setFlashNode] = useState<AgentRole | null>(null);

  useEffect(() => {
    if (focusedAgent) {
      setFlashNode(focusedAgent);
      const timer = setTimeout(() => setFlashNode(null), 500);
      return () => clearTimeout(timer);
    }
  }, [focusedAgent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const handleMouseAction = (e: MouseEvent, type: 'click' | 'dblclick') => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      let hit = false;
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (dist < 25) {
          if (type === 'click') onAgentClick(role);
          else onAgentDblClick(role);
          hit = true;
        }
      });
      if (!hit && type === 'click') onBackgroundClick();
    };

    const onClick = (e: MouseEvent) => handleMouseAction(e, 'click');
    const onDblClick = (e: MouseEvent) => handleMouseAction(e, 'dblclick');

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('dblclick', onDblClick);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      const angleStep = (Math.PI * 2) / AGGREGATION_ORDER.length;

      // Lines & Connection Pulse
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
          const dashOffset = -time / 50;
          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = dashOffset;
          ctx.strokeStyle = isFocusLocked ? '#ffea00' : '#00e5ff';
          ctx.lineWidth = 3;
          
          // Outer Glow Pulse for focus
          ctx.shadowBlur = 10 + Math.sin(time / 200) * 5;
          ctx.shadowColor = isFocusLocked ? 'rgba(255, 234, 0, 0.5)' : 'rgba(0, 229, 255, 0.5)';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = isActive ? 'rgba(0, 229, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = isActive ? 1.5 : 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });

      // Nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;
        const isFlashing = flashNode === role;

        if (isFocused) {
          // Pulsing Halo
          const haloR = 25 + Math.sin(time / 300) * 5;
          ctx.beginPath();
          ctx.arc(x, y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = isFocusLocked ? 'rgba(255, 234, 0, 0.1)' : 'rgba(0, 229, 255, 0.1)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 12 : (isActive ? 8 : 6), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffea00' : '#00e5ff') : (isActive ? '#00e5ff' : '#1a1a1a');
        ctx.fill();
        
        if (isFocused || isActive) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (isFlashing) {
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.stroke();
        }

        // Labels
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffea00' : '#00e5ff') : (isActive ? '#fff' : '#444');
        ctx.font = isFocused ? 'bold 10px JetBrains Mono' : '8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - (isFocused ? 24 : 14));
      });

      // Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = isProcessing ? '#00ff66' : '#222';
      ctx.fill();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('dblclick', onDblClick);
    };
  }, [activeAgents, isProcessing, focusedAgent, isFocusLocked, flashNode]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center panel p-4">
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${focusedAgent ? (isFocusLocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-blue-500 bg-blue-500/10') : 'border-white/5 bg-white/5'}`}>
          {isFocusLocked ? <Lock size={10} className="neon-yellow" /> : <Unlock size={10} className={focusedAgent ? "neon-blue" : "text-neutral-500"} />}
          <span className={`mono text-[9px] font-black uppercase tracking-widest ${isFocusLocked ? 'neon-yellow' : (focusedAgent ? 'neon-blue' : 'text-neutral-500')}`}>
            {focusedAgent ? (isFocusLocked ? 'LOCKED' : 'ISOLATED') : 'NOMINAL'}
          </span>
        </div>
        {focusedAgent && (
          <span className="mono text-[8px] neon-blue animate-pulse pl-2 font-bold uppercase">{focusedAgent} ACTIVE_PROBE</span>
        )}
      </div>

      <canvas ref={canvasRef} width={300} height={300} className="w-full h-auto max-w-[300px]" />
      
      <div className="mt-4 w-full grid grid-cols-4 gap-2">
        {AGGREGATION_ORDER.map(role => (
          <div key={role} className={`flex flex-col items-center gap-1 p-2 rounded border transition-all cursor-pointer ${focusedAgent === role ? (isFocusLocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-blue-500 bg-blue-500/10') : 'border-white/5 hover:bg-white/5'}`} onClick={() => onAgentClick(role)}>
            <div className={`w-1 h-1 rounded-full ${activeAgents.includes(role) ? 'bg-green-500 shadow-[0_0_5px_#00ff66]' : 'bg-neutral-800'}`} />
            <span className={`mono text-[8px] font-black ${focusedAgent === role ? (isFocusLocked ? 'neon-yellow' : 'neon-blue') : 'text-neutral-600'}`}>{role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
