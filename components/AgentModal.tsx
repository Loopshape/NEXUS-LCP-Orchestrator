
import React from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS } from '../constants';
import { X, Shield, Activity, Cpu, Terminal } from 'lucide-react';

interface Props {
  role: AgentRole;
  onClose: () => void;
}

export const AgentModal: React.FC<Props> = ({ role, onClose }) => {
  const agent = AGENT_ENsemble.find(a => a.role === role);

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0d0d0d] border-2 border-neutral-800 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
      >
        <div className="flex items-center justify-between p-8 bg-[#121212] border-b border-neutral-800/50">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/30 shadow-inner">
              <Cpu className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">{agent.role} <span className="text-neutral-600 font-light lowercase">unit</span></h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] mono text-blue-400 font-black uppercase tracking-widest">{agent.function}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-600 hover:text-white hover:bg-neutral-800 transition-all p-3 rounded-full border border-neutral-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-neutral-500 uppercase mono text-[10px] font-black tracking-[0.3em]">
                <Shield size={14} className="text-blue-500/70" />
                Epistemic Duty
              </div>
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 shadow-inner">
                <p className="text-neutral-300 leading-relaxed font-medium">
                  {agent.responsibility}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-neutral-500 uppercase mono text-[10px] font-black tracking-[0.3em]">
                <Activity size={14} className="text-emerald-500/70" />
                Runtime Priority
              </div>
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 shadow-inner h-full flex items-center">
                <p className="text-neutral-400 text-xs italic leading-relaxed">
                  Allocated to high-precision {agent.role.toLowerCase()}-based reasoning within the asynchronous parallel ensemble.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-neutral-500 uppercase mono text-[10px] font-black tracking-[0.3em]">
                <Terminal size={14} className="text-amber-500/70" />
                LCP Runtime Instruction
              </div>
              <span className="mono text-[8px] text-neutral-700 tracking-widest uppercase">Kernel_v1.0.4_Stable</span>
            </div>
            <div className="bg-black p-8 rounded-2xl border-2 border-neutral-800/80 font-mono text-[13px] leading-relaxed text-blue-300/80 whitespace-pre-wrap shadow-2xl relative">
              <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-amber-500/20 animate-pulse" />
              {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800/50 flex flex-wrap justify-between items-center text-[9px] mono text-neutral-600 font-bold uppercase tracking-[0.3em]">
            <span>Logical_ID: LCP_{role.toUpperCase()}_0x884</span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              <span>Sovereign_Validation: PASS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
