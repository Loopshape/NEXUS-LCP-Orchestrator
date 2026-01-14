
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
  [AgentRole.CORE]: ['detecting logical contradictions', 'ensuring adherence to core LCP principles', 'validating axiomatic base'],
  [AgentRole.CUBE]: ['verifying structural geometry', 'ensuring dimensional consistency', 'mapping topological constraints'],
  [AgentRole.LINE]: ['tracing causal failures', 'validating sequence linearity', 'detecting chronological drifts'],
  [AgentRole.SIGN]: ['analyzing symbol ambiguity', 'verifying semantic precision', 'decoding linguistic intent'],
  [AgentRole.WAVE]: ['generating divergent paths', 'exploring hypothesis breadth', 'synthesizing creative vectors'],
  [AgentRole.COIN]: ['calculating truth polarity', 'assigning confidence scores', 'filtering noise thresholds'],
  [AgentRole.LOOP]: ['monitoring convergence hubs', 'detecting semantic oscillation', 'triggering rehash cycles'],
  [AgentRole.WORK]: ['compiling sovereign execution', 'synthesizing trace logs', 'emitting deterministic output']
};

export const AgentModal: React.FC<Props> = ({ role, isFocused, onClose }) => {
  const agent = AGENT_ENsemble.find(a => a.role === role);
  const examples = EPISTEMIC_EXAMPLES[role] || [];
  const index = AGGREGATION_ORDER.indexOf(role);
  const prevAgent = index > 0 ? AGGREGATION_ORDER[index - 1] : 'SYSTEM_ROOT';
  const nextAgent = index < AGGREGATION_ORDER.length - 1 ? AGGREGATION_ORDER[index + 1] : 'CONTINUUM_EXIT';

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`w-full max-w-xl bg-[#1a0510] border-2 rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isFocused ? 'border-yellow-500' : 'border-red-900'}`}
      >
        <div className="bg-gradient-to-r from-[#880000] to-[#440000] px-4 py-2 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-3">
            <Cpu size={16} className="text-white" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest">{agent.role} :: PROTOCOL_SPEC</h2>
            {isFocused && <span className="bg-yellow-500 text-black text-[8px] font-bold px-1.5 rounded ml-2">ISOLATED</span>}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {/* Cognitive Pathways */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 text-[10px] font-black neon-blue uppercase tracking-widest">
                <Share2 size={12} /> Cognitive Pathways
             </div>
             <div className="grid grid-cols-3 items-center bg-black/40 p-4 border border-blue-900/30 rounded-lg">
                <div className="flex flex-col items-center gap-1 group relative">
                    <Zap size={16} className="neon-yellow" />
                    <span className="text-[8px] font-bold text-neutral-500 uppercase">Input</span>
                    <span className="text-[10px] font-black neon-white">{prevAgent}</span>
                    <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-black border border-white/20 p-2 text-[8px] text-neutral-400 z-10 w-32 text-center pointer-events-none">
                       Receives preceding semantic trace for domain processing.
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="h-px w-full bg-gradient-to-r from-yellow-500 to-green-500 animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1 group relative">
                    <Share2 size={16} className="neon-green" />
                    <span className="text-[8px] font-bold text-neutral-500 uppercase">Output</span>
                    <span className="text-[10px] font-black neon-white">{nextAgent}</span>
                    <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-black border border-white/20 p-2 text-[8px] text-neutral-400 z-10 w-32 text-center pointer-events-none">
                       Emits processed logic vector to subsequent ensemble node.
                    </div>
                </div>
             </div>
          </section>

          {/* Epistemic Boundary */}
          <section className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black neon-red uppercase tracking-widest"><Shield size={12} /> Epistemic Domain</div>
              <div className="bg-black/30 p-4 border border-red-900/40 rounded-lg h-full">
                <p className="text-[11px] font-bold text-neutral-200 mb-2">{agent.responsibility}</p>
                <div className="space-y-1.5 border-t border-red-900/30 pt-2">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-[9px] text-neutral-500 font-bold uppercase italic">
                      <CheckCircle2 size={10} className="neon-green mt-0.5" /> {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black neon-green uppercase tracking-widest"><Activity size={12} /> Logic Context</div>
              <div className="bg-black/30 p-4 border border-green-900/40 rounded-lg h-full">
                <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                  Unit ${agent.role} enforces sovereign logical continuity. In focus mode, domain precision is enhanced for cross-ensemble verification.
                </p>
              </div>
            </div>
          </section>

          {/* Kernel Instruction */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black neon-yellow uppercase tracking-widest"><Terminal size={12} /> Kernel Instruction</div>
            <div className="bg-black p-4 border border-yellow-900/30 rounded-lg font-mono text-[10px] text-blue-200 leading-relaxed">
              {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </section>
        </div>
        
        <div className="bg-[#110000] px-4 py-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[8px] text-neutral-600 font-bold">LCP_UNIT_NODE_ID: 0x{role.toUpperCase()}</span>
            <span className="text-[8px] neon-green font-bold">SOVEREIGN_SAFE_V1.5</span>
        </div>
      </div>
    </div>
  );
};
