
import React, { useEffect, useRef, useState } from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { Lock, Unlock, Zap } from 'lucide-react';

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
  const [fadeAlpha, setFadeAlpha] = useState(0);

  useEffect(() => {
    if (focusedAgent) {
      setFlashNode(focusedAgent);
      setFadeAlpha(1);
      const timer = setTimeout(() => setFlashNode(null), 400);
      return () => clearTimeout(timer);
    } else {
      // Fade out effect
      let alpha = 1;
      const interval = setInterval(() => {
        alpha -= 0.1;
        if (alpha <= 0) {
          setFadeAlpha(0);
          clearInterval(interval);
        } else {
          setFadeAlpha(alpha);
        }
      }, 30);
      return () => clearInterval(interval);
    }
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
        if (dist < 20) {
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

      // Draw background lines (grid-like)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Hub connections with pulse
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
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.strokeStyle;
        } else {
          ctx.strokeStyle = isActive ? 'rgba(51, 255, 51, 0.4)' : 'rgba(255, 51, 51, 0.2)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      });

      // Nodes
      AGGREGATION_ORDER.forEach((role, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const isActive = activeAgents.includes(role);
        const isFocused = focusedAgent === role;
        const isFlashing = flashNode === role;

        if (isFocused || (fadeAlpha > 0 && !focusedAgent)) {
            const alpha = focusedAgent ? 1 : fadeAlpha;
            const haloR = 22 + Math.sin(time / 200) * 4;
            ctx.beginPath();
            ctx.arc(x, y, haloR, 0, Math.PI * 2);
            ctx.fillStyle = isFocusLocked ? `rgba(255, 255, 51, ${alpha * 0.15})` : `rgba(51, 255, 255, ${alpha * 0.15})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, isFocused ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffff33' : '#33ffff') : (isActive ? '#33ff33' : '#330000');
        ctx.shadowBlur = (isFocused || isActive) ? 10 : 0;
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isFocused ? 2 : 1;
        ctx.stroke();

        if (isFlashing) {
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = isFocused ? (isFocusLocked ? '#ffff33' : '#33ffff') : (isActive ? '#33ff33' : '#888');
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(role.toUpperCase(), x, y - 18);
      });

      // Center Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
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
  }, [activeAgents, isProcessing, focusedAgent, isFocusLocked, flashNode, fadeAlpha]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-2">
      <div className="flex justify-between w-full mb-2 px-4">
        <div className={`flex items-center gap-1.5 text-[9px] font-bold ${focusedAgent ? 'neon-blue' : 'text-neutral-500'}`}>
           <Zap size={10} /> {focusedAgent ? `FOCUS: ${focusedAgent}` : 'IDLE'}
        </div>
        <div className="flex items-center gap-2">
            {isFocusLocked ? <Lock size={10} className="neon-yellow animate-pulse" /> : <Unlock size={10} className="text-neutral-600" />}
        </div>
      </div>
      <canvas ref={canvasRef} width={280} height={280} className="w-full max-w-[280px]" />
    </div>
  );
};
