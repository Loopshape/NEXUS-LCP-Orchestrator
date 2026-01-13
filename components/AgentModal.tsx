
import React from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS } from '../constants';
import { X, Shield, Activity, Cpu } from 'lucide-react';

interface Props {
  role: AgentRole;
  onClose: () => void;
}

export const AgentModal: React.FC<Props> = ({ role, onClose }) => {
  const agent = AGENT_ENsemble.find(a => a.role === role);

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#111] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 bg-[#151515] border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{agent.role.toUpperCase()} <span className="text-neutral-500 text-sm font-normal">Component</span></h2>
              <p className="text-xs mono text-blue-400/80 uppercase tracking-widest">{agent.function}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-neutral-400 uppercase mono text-[10px] font-bold tracking-widest">
              <Shield size={12} />
              Epistemic Responsibility
            </div>
            <p className="text-neutral-300 leading-relaxed bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
              {agent.responsibility}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-neutral-400 uppercase mono text-[10px] font-bold tracking-widest">
              <Activity size={12} />
              LCP Runtime Instruction
            </div>
            <div className="bg-black p-5 rounded-lg border border-neutral-800/50 font-mono text-xs leading-relaxed text-blue-300/90 whitespace-pre-wrap">
              {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-[10px] mono text-neutral-600">
            <span>DETERMINISTIC_ROLE_ID: {role.toUpperCase()}</span>
            <span>SECURE_RUNTIME: v1.0.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
