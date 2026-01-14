
import React, { useState } from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS, AGGREGATION_ORDER } from '../constants';
import { X, Shield, Activity, Cpu, Terminal, CheckCircle2, Zap, Share2, Copy, Check, Network } from 'lucide-react';

interface Props {
  role: AgentRole;
  isFocused?: boolean;
  onClose: () => void;
}

const EPISTEMIC_EXAMPLES: Record<AgentRole, string[]> = {
  [AgentRole.CORE]: ['Detecting logical contradictions', 'Ensuring adherence to core LCP principles', 'Validating base axioms'],
  [AgentRole.CUBE]: ['Verifying structural geometry', 'Ensuring dimensional consistency', 'Mapping logic topology'],
  [AgentRole.LINE]: ['Tracing causal chain failures', 'Sequencing chronological logic', 'Mapping temporal if-then loops'],
  [AgentRole.SIGN]: ['Analyzing symbol ambiguity', 'Standardizing semantic precision', 'Decoding linguistic resonance'],
  [AgentRole.WAVE]: ['Generating divergent hypotheses', 'Exploring alternate thought vectors', 'Synthesizing creative breadth'],
  [AgentRole.COIN]: ['Calculating truth polarity', 'Assigning confidence scores', 'Filtering stochastic noise'],
  [AgentRole.LOOP]: ['Monitoring for convergence drift', 'Detecting semantic oscillation', 'Managing rehash iterations'],
  [AgentRole.WORK]: ['Compiling sovereign execution plans', 'Synthesizing trace logs', 'Emitting deterministic protocol outputs']
};

export const AgentModal: React.FC<Props> = ({ role, isFocused, onClose }) => {
  const [copied, setCopied] = useState(false);
  const agent = AGENT_ENsemble.find(a => a.role === role);
  const examples = EPISTEMIC_EXAMPLES[role] || [];
  const index = AGGREGATION_ORDER.indexOf(role);
  const prevAgent = index > 0 ? AGGREGATION_ORDER[index - 1] : 'SYSTEM_ROOT';
  const nextAgent = index < AGGREGATION_ORDER.length - 1 ? AGGREGATION_ORDER[index + 1] : 'CONTINUUM_EXIT';

  if (!agent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(AGENT_SYSTEM_PROMPTS[role]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer" 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`w-full max-w-xl bg-[#0a0515] border-4 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[95vh] cursor-default transition-all duration-300 ${isFocused ? 'border-blue-500 shadow-blue-500/30' : 'border-[#880000]'}`}
      >
        <div className={`px-4 py-2 flex items-center justify-between border-b-2 ${isFocused ? 'bg-gradient-to-r from-blue-900 to-blue-700 border-blue-400' : 'bg-gradient-to-r from-[#aa0000] to-[#440000] border-red-500'}`}>
          <div className="flex items-center gap-3">
            <Cpu size={18} className="text-white" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">{agent.role} :: PROTOCOL_SPEC_v1.5</h2>
            {isFocused && <span className="bg-white text-blue-900 text-[9px] font-black px-2 rounded-full ml-2 animate-pulse">ISOLATED</span>}
          </div>
          <button onClick={onClose} className="text-white hover:neon-white transition-all"><X size={20} /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {/* Cognitive Pathways - Visual representation of data flow */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black neon-blue uppercase tracking-[0.5em]">
                <Share2 size={14} /> Cognitive Pathways
             </div>
             <div className="grid grid-cols-3 items-center bg-black/60 p-6 border-2 border-white/5 rounded-sm relative shadow-inner">
                <div 
                  className="flex flex-col items-center gap-2 group cursor-help" 
                  title={`Logical input vector received from upstream ensemble node: ${prevAgent}`}
                >
                    <Zap size={24} className="neon-yellow" />
                    <span className="text-[9px] font-black neon-white uppercase">{prevAgent}</span>
                    <span className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest">Signal_Source</span>
                </div>
                <div className="flex flex-col items-center justify-center px-4">
                    <div className="h-[2px] w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 animate-pulse" />
                    <span className="text-[6px] font-black text-neutral-800 uppercase mt-2">Enforcement_Domain</span>
                </div>
                <div 
                  className="flex flex-col items-center gap-2 group cursor-help" 
                  title={`Semantic emission transmitted to downstream ensemble node: ${nextAgent}`}
                >
                    <Network size={24} className="neon-green" />
                    <span className="text-[9px] font-black neon-white uppercase">{nextAgent}</span>
                    <span className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest">Emission_Target</span>
                </div>
             </div>
          </section>

          {/* Details Grid */}
          <section className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black neon-red uppercase tracking-[0.4em]"><Shield size={14} /> Epistemic Domain</div>
              <div className="bg-black/40 p-5 border-2 border-red-900/40 rounded-sm h-full shadow-inner">
                <p className="text-[12px] font-black neon-white mb-3 uppercase leading-tight">{agent.responsibility}</p>
                <div className="space-y-2 border-t border-red-900/30 pt-3">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-[9px] text-neutral-400 font-bold uppercase italic leading-tight">
                      <CheckCircle2 size={12} className="neon-green mt-0.5" /> {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black neon-green uppercase tracking-[0.4em]"><Activity size={14} /> Continuum Context</div>
              <div className="bg-black/40 p-5 border-2 border-green-900/40 rounded-sm h-full shadow-inner">
                <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                  Protocol node {agent.role} enforces sovereign logical integrity within the {agent.role.toLowerCase()} domain. Ensures zero-drift alignment.
                </p>
                <div className="mt-4 p-2 bg-green-900/20 border border-green-500/20 text-[9px] text-green-400 mono">
                   ROLE_ID: AG_PROT_{role.toUpperCase()}<br/>
                   CONF_V: 1.0.52_STABLE_ENF
                </div>
              </div>
            </div>
          </section>

          {/* System Prompt Logic */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black neon-yellow uppercase tracking-[0.4em]">
                <Terminal size={14} /> Kernel Kernel Instruction
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase text-neutral-400 hover:text-white transition-all bg-white/5 px-3 py-1.5 rounded border border-white/10 hover:border-white/30"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            <div className="bg-black/80 p-5 border-2 border-yellow-900/30 rounded-sm font-mono text-[11px] text-blue-200 leading-relaxed shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
               {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </section>
        </div>
        
        <div className="bg-[#050510] px-4 py-2 border-t-2 border-red-900/30 flex justify-between items-center">
            <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">Hash_Signature: 0x{role.toUpperCase()}</span>
            <div className="flex items-center gap-2">
               <span className="text-[9px] neon-green font-black">ENFORCEMENT_NOMINAL</span>
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            </div>
        </div>
      </div>
    </div>
  );
};
