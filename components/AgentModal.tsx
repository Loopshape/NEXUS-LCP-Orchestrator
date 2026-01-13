
import React from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS, AGGREGATION_ORDER } from '../constants';
import { X, Shield, Activity, Cpu, Terminal, BookOpen, CheckCircle2, Zap, Share2, Info } from 'lucide-react';

interface Props {
  role: AgentRole;
  isFocused?: boolean;
  onClose: () => void;
}

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
  const index = AGGREGATION_ORDER.indexOf(role);
  const prevAgent = index > 0 ? AGGREGATION_ORDER[index - 1] : 'ORIGIN';
  const nextAgent = index < AGGREGATION_ORDER.length - 1 ? AGGREGATION_ORDER[index + 1] : 'OUTPUT';

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-2xl bg-[#0a0a0f] border-2 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 ${isFocused ? 'border-blue-500 shadow-blue-500/20' : 'border-neutral-800'}`}>
        <div className={`flex items-center justify-between p-8 border-b border-white/5 ${isFocused ? 'bg-blue-900/10' : 'bg-black/20'}`}>
          <div className="flex items-center gap-6">
            <div className={`p-3 rounded-2xl border-2 transition-colors ${isFocused ? 'bg-blue-500 border-white' : 'bg-blue-600/10 border-blue-500/40'}`}>
              <Cpu className={`w-8 h-8 ${isFocused ? 'text-white' : 'neon-blue'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black neon-white uppercase">{agent.role} <span className="text-[10px] mono text-neutral-500 tracking-[0.3em]">LCP_UNIT</span></h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFocused ? 'bg-white' : 'bg-blue-500'}`} />
                <p className="text-[10px] mono neon-blue font-black uppercase tracking-widest">{agent.function}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-600 hover:neon-white transition-all p-3 rounded-full border border-white/5"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Cognitive Pathways Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-600 uppercase mono text-[9px] font-black tracking-[0.4em]">
              <Share2 size={12} className="neon-blue" />
              Cognitive Pathways
            </div>
            <div className="flex items-center gap-8 bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-2 relative group">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <Zap size={16} className="neon-yellow" />
                </div>
                <span className="mono text-[8px] neon-yellow font-bold uppercase">Input</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black p-2 border border-white/10 rounded shadow-xl whitespace-nowrap z-10">
                  <div className="text-[8px] mono text-neutral-400">RECEIVING SIGNAL FROM:</div>
                  <div className="text-[10px] mono neon-white font-bold">{prevAgent}</div>
                </div>
              </div>
              <div className="h-px flex-grow bg-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-blue-500/20 to-green-500/20 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2 relative group">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                  <Share2 size={16} className="neon-green" />
                </div>
                <span className="mono text-[8px] neon-green font-bold uppercase">Output</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black p-2 border border-white/10 rounded shadow-xl whitespace-nowrap z-10">
                  <div className="text-[8px] mono text-neutral-400">EMITTING SIGNAL TO:</div>
                  <div className="text-[10px] mono neon-white font-bold">{nextAgent}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-600 uppercase mono text-[9px] font-black tracking-[0.4em]"><Shield size={12} className="neon-blue" /> Epistemic Domain</div>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 space-y-3">
                <p className="text-neutral-300 text-xs font-bold leading-relaxed">{agent.responsibility}</p>
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-neutral-500 mono">
                      <CheckCircle2 size={10} className="neon-green mt-0.5" /> {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-neutral-600 uppercase mono text-[9px] font-black tracking-[0.4em]"><Activity size={12} className="neon-green" /> Protocol Context</div>
               <div className="bg-black/40 p-5 rounded-xl border border-white/5 h-full">
                <p className="text-neutral-500 text-[10px] italic leading-relaxed">
                  Unit {agent.role} enforces sovereign logical integrity. Focus mode optimizes trace analytics for high-precision verification.
                </p>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-600 uppercase mono text-[9px] font-black tracking-[0.4em]"><Terminal size={12} className="neon-yellow" /> System Kernel Instruction</div>
            <div className="bg-black p-6 rounded-xl border border-white/10 font-mono text-[11px] leading-relaxed text-blue-300/80 shadow-inner">
              {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
