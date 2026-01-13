
import React from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS } from '../constants';
import { X, Shield, Activity, Cpu, Terminal, BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  role: AgentRole;
  isFocused?: boolean;
  onClose: () => void;
}

// Concrete examples derived from protocol responsibilities
const EPISTEMIC_EXAMPLES: Record<AgentRole, string[]> = {
  [AgentRole.CORE]: ['Detecting logical contradictions', 'Ensuring adherence to core LCP principles', 'Identifying non-negotiable axioms'],
  [AgentRole.CUBE]: ['Mapping multi-dimensional logic gaps', 'Validating structural coherence', 'Ensuring geometric/topological consistency'],
  [AgentRole.LINE]: ['Tracing causal link failures', 'Sequencing chronological dependencies', 'Identifying logical "if-then" non-sequiturs'],
  [AgentRole.SIGN]: ['Deconstructing semantic ambiguity', 'Analyzing symbol resonance', 'Standardizing linguistic precision'],
  [AgentRole.WAVE]: ['Generating non-obvious alternatives', 'Exploring divergent thought paths', 'Synthesizing creative hypotheses'],
  [AgentRole.COIN]: ['Final truth-polarity scoring', 'Assigning validation confidence levels', 'Filtering probabilistic noise'],
  [AgentRole.LOOP]: ['Monitoring for convergence drift', 'Detecting semantic oscillation', 'Managing iteration termination'],
  [AgentRole.WORK]: ['Constructing sovereign execution plans', 'Synthesizing multi-agent trace logs', 'Emitting deterministic protocol outputs']
};

export const AgentModal: React.FC<Props> = ({ role, isFocused, onClose }) => {
  const agent = AGENT_ENsemble.find(a => a.role === role);
  const examples = EPISTEMIC_EXAMPLES[role] || [];

  if (!agent) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl bg-[#0a0a0a] border-2 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 ${isFocused ? 'border-blue-500 shadow-blue-500/20' : 'border-neutral-800/80'}`}
      >
        <div className={`flex items-center justify-between p-10 border-b border-neutral-800/40 ${isFocused ? 'bg-blue-900/10' : 'bg-[#0e0e0e]'}`}>
          <div className="flex items-center gap-8">
            <div className={`p-4 rounded-3xl border-2 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-colors ${isFocused ? 'bg-blue-500 border-white' : 'bg-blue-600/10 border-blue-500/40'}`}>
              <Cpu className={`w-10 h-10 ${isFocused ? 'text-white' : 'text-blue-500'}`} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                {agent.role}
                <span className={`text-[10px] px-3 py-1 rounded-full font-mono tracking-[0.2em] ${isFocused ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {isFocused ? 'ACTIVE_FOCUS' : 'UNIT_v1.5'}
                </span>
              </h2>
              <div className="flex items-center gap-2.5 mt-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isFocused ? 'bg-white' : 'bg-blue-500'}`} />
                <p className={`text-xs mono font-black uppercase tracking-[0.2em] ${isFocused ? 'text-blue-200' : 'text-blue-400'}`}>
                  {agent.function}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-600 hover:text-white hover:bg-neutral-800 transition-all p-4 rounded-full border border-neutral-800 shadow-xl"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-12 space-y-10 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-neutral-600 uppercase mono text-[10px] font-black tracking-[0.4em]">
                <Shield size={16} className="text-blue-500/60" />
                Epistemic Boundary
              </div>
              <div className="bg-[#0c0c0c] p-7 rounded-3xl border border-neutral-800 shadow-inner space-y-4">
                <p className="text-neutral-300 leading-relaxed font-bold text-sm">
                  {agent.responsibility}
                </p>
                <div className="space-y-2 border-t border-neutral-800 pt-4">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-neutral-500 font-medium">
                      <CheckCircle2 size={12} className="text-blue-500/50 mt-0.5" />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
               <div className="flex items-center gap-3 text-neutral-600 uppercase mono text-[10px] font-black tracking-[0.4em]">
                <Activity size={16} className="text-emerald-500/60" />
                Runtime Context
              </div>
              <div className="bg-[#0c0c0c] p-7 rounded-3xl border border-neutral-800 shadow-inner h-full flex flex-col justify-center">
                <p className="text-neutral-500 text-[11px] italic leading-relaxed">
                  Agent {agent.role} enforces logical continuity within the {agent.role.toLowerCase()} domain, preventing stochastic drift across the ensemble. {isFocused && 'Current isolation mode active for priority trace analytics.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-neutral-600 uppercase mono text-[10px] font-black tracking-[0.4em]">
                <Terminal size={16} className="text-amber-500/60" />
                LCP Kernel Instruction
              </div>
              <div className="flex items-center gap-2 text-[9px] mono text-neutral-800 font-bold uppercase">
                <BookOpen size={10} />
                Kernel_v1.0.5_Stable
              </div>
            </div>
            <div className="bg-black p-10 rounded-[2rem] border-2 border-neutral-900 font-mono text-sm leading-relaxed text-blue-300/90 whitespace-pre-wrap shadow-2xl relative">
              <div className="absolute top-6 right-8 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
              </div>
              {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </div>

          <div className="pt-10 border-t border-neutral-900 flex flex-wrap justify-between items-center text-[10px] mono text-neutral-700 font-black uppercase tracking-[0.5em]">
            <span>NODE_ID: 0xLCP_{role.toUpperCase()}</span>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFocused ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <span>SOVEREIGN_SAFE: YES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
