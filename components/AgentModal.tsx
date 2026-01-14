import React, { useState } from 'react';
import { AgentRole } from '../types';
import { AGENT_ENsemble, AGENT_SYSTEM_PROMPTS, AGGREGATION_ORDER } from '../constants';
import { X, Shield, Activity, Cpu, Terminal, CheckCircle2, Zap, Share2, Copy, Check, Network, ArrowRight } from 'lucide-react';

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl cursor-pointer transition-all animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`w-full max-w-2xl bg-[#0a0515] border-4 rounded-sm shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh] cursor-default transition-all duration-500 scale-100 ${isFocused ? 'border-blue-500 shadow-blue-500/20' : 'border-[#880000] shadow-red-900/10'}`}
      >
        {/* Modal Header */}
        <div className={`px-5 py-3 flex items-center justify-between border-b-2 ${isFocused ? 'bg-gradient-to-r from-blue-900/80 to-blue-700/80 border-blue-400' : 'bg-gradient-to-r from-[#880000] to-[#440000] border-red-500'}`}>
          <div className="flex items-center gap-4">
            <Cpu size={20} className="text-white" />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">{agent.role} :: PROTOCOL_SPEC_v1.5</h2>
            {isFocused && <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-0.5 rounded-full ml-2 animate-pulse shadow-lg">ISOLATED_FOCUS</span>}
          </div>
          <button onClick={onClose} className="text-white hover:neon-white hover:scale-110 transition-all p-1"><X size={24} /></button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-8 space-y-10">
          {/* Cognitive Pathways Section */}
          <section className="space-y-5">
             <div className="flex items-center gap-3 text-[11px] font-black neon-blue uppercase tracking-[0.6em]">
                <Share2 size={16} /> Cognitive Pathways
             </div>
             <div className="grid grid-cols-3 items-center bg-black/40 p-8 border-2 border-white/5 rounded shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
                
                {/* Input Stream */}
                <div 
                  className="flex flex-col items-center gap-3 group/node cursor-help transition-all hover:scale-110 z-10" 
                  title={`Logical input vector received from upstream ensemble node: ${prevAgent}. Required for domain verification.`}
                >
                    <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/30 group-hover/node:bg-yellow-500/20 transition-all">
                      <Zap size={28} className="neon-yellow" />
                    </div>
                    <span className="text-[10px] font-black neon-white uppercase tracking-widest">{prevAgent}</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em]">Signal_Source</span>
                </div>

                {/* Internal Flow */}
                <div className="flex flex-col items-center justify-center px-4 z-10">
                    <div className="h-[2px] w-full bg-neutral-800 relative">
                      <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-yellow-500 to-blue-500 animate-path-flow" />
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                        <ArrowRight size={14} className="text-neutral-700 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-[7px] font-black text-neutral-700 uppercase mt-4 tracking-[0.3em]">Processing_Domain</span>
                </div>

                {/* Output Stream */}
                <div 
                  className="flex flex-col items-center gap-3 group/node cursor-help transition-all hover:scale-110 z-10" 
                  title={`Semantic emission transmitted to downstream ensemble node: ${nextAgent}. Enforces logic stabilization.`}
                >
                    <div className="p-3 bg-green-500/10 rounded-full border border-green-500/30 group-hover/node:bg-green-500/20 transition-all">
                      <Network size={28} className="neon-green" />
                    </div>
                    <span className="text-[10px] font-black neon-white uppercase tracking-widest">{nextAgent}</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em]">Emission_Target</span>
                </div>
             </div>
          </section>

          {/* Epistemic Grid */}
          <section className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-black neon-red uppercase tracking-[0.5em]"><Shield size={16} /> Epistemic Domain</div>
              <div className="bg-black/40 p-6 border-2 border-red-900/30 rounded shadow-inner min-h-[160px]">
                <p className="text-[13px] font-black neon-white mb-4 uppercase leading-tight tracking-wide">{agent.responsibility}</p>
                <div className="space-y-3 border-t border-red-900/20 pt-4">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-3 text-[10px] text-neutral-400 font-bold uppercase italic leading-tight group">
                      <CheckCircle2 size={14} className="text-emerald-500 group-hover:neon-green transition-all mt-0.5" /> {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-black neon-green uppercase tracking-[0.5em]"><Activity size={16} /> Protocol Context</div>
              <div className="bg-black/40 p-6 border-2 border-green-900/30 rounded shadow-inner min-h-[160px] flex flex-col justify-between">
                <p className="text-[12px] text-neutral-300 leading-relaxed font-medium font-sans">
                  Node {agent.role} enforces sovereign logical integrity within the {agent.role.toLowerCase()} domain. Responsible for mapping invariants and ensuring zero-drift alignment across the continuum.
                </p>
                <div className="mt-4 p-3 bg-green-900/10 border border-green-500/20 text-[9px] text-green-500/70 font-mono tracking-wider rounded-sm">
                   NODE_ID: LCP_AG_{role.toUpperCase()}<br/>
                   DOMAIN: {agent.function.toUpperCase()}<br/>
                   CONF_V: 1.5.0-STABLE
                </div>
              </div>
            </div>
          </section>

          {/* Kernel Instruction Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] font-black neon-yellow uppercase tracking-[0.5em]">
                <Terminal size={16} /> Sovereign Instruction Kernel
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-sm border border-white/10 hover:border-white/30 active:scale-95 shadow-lg group/copy"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover/copy:neon-white" />}
                {copied ? 'Instruction_Captured' : 'Copy System Prompt'}
              </button>
            </div>
            <div className="bg-black/80 p-6 border-2 border-yellow-900/20 rounded shadow-2xl font-mono text-[12px] text-blue-100/90 leading-relaxed relative overflow-hidden group/kernel">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500/30 group-hover/kernel:bg-yellow-500 transition-all duration-700" />
               <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover/kernel:opacity-[0.07] transition-all">
                  <Cpu size={120} />
               </div>
               {AGENT_SYSTEM_PROMPTS[role]}
            </div>
          </section>
        </div>
        
        {/* Modal Footer */}
        <div className="bg-[#050510] px-6 py-3 border-t-2 border-red-900/30 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
            <span className="text-neutral-700">SIG_HASH: 0x{role.toUpperCase()}_774X</span>
            <div className="flex items-center gap-3">
               <span className="neon-green">ENFORCEMENT_NOMINAL</span>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            </div>
        </div>
      </div>
    </div>
  );
};