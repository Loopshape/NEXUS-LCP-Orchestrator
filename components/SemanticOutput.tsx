
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Terminal, ShieldAlert, Crosshair, Database, Target } from 'lucide-react';

interface Props {
  state: SemanticState;
  focusedAgent?: AgentRole | null;
  onAgentNameClick: (role: AgentRole) => void;
  onReapplyFocus?: (role: AgentRole | null) => void;
}

export const SemanticOutput: React.FC<Props> = ({ state, focusedAgent, onAgentNameClick, onReapplyFocus }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Filter: Show only WORK and focusedAgent if focus is active
  const filteredRoles = focusedAgent 
    ? AGGREGATION_ORDER.filter(r => r === AgentRole.WORK || r === focusedAgent)
    : AGGREGATION_ORDER;

  return (
    <div className={`mb-6 border-l-4 bg-[#0a0510] border-2 rounded-sm shadow-xl transition-all duration-500 ${focusedAgent ? 'border-blue-500/80' : 'border-[#880000]'}`}>
      {/* Custom Beveled Title Bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b ${focusedAgent ? 'bg-blue-900/40 border-blue-500/50' : 'bg-gradient-to-r from-[#660000] to-[#220000] border-[#880000]'}`}>
        <div className="flex items-center gap-3">
          <Database size={12} className="neon-white" />
          <span className="text-[10px] font-black neon-white tracking-widest">{state.id}</span>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm ${state.type === 'hash' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            {state.type.toUpperCase()}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-1.5 neon-yellow text-[9px] font-black uppercase bg-yellow-900/40 border border-yellow-500/30 px-2 rounded-full animate-pulse">
              <Target size={10} /> ISOLATION_MODE: {focusedAgent}
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-white hover:neon-white transition-all">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="text-[9px] text-neutral-500 uppercase font-black mb-1.5 tracking-widest">Input Trace Probe</div>
          <div className="text-sm italic text-neutral-300 border-l-2 border-red-900 pl-3 leading-relaxed">"{state.content}"</div>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} className="neon-green" />
            <span className="text-[10px] font-black neon-green uppercase tracking-[0.2em]">Synthesis Engine (WORK)</span>
          </div>
          <p className="text-[13px] leading-relaxed neon-white font-medium bg-black/60 p-3 border border-green-900/30 rounded-sm selection:bg-green-500/30">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="mt-6 pt-4 border-t border-red-900/20 space-y-3">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">Ensemble_Matrix_Log</span>
               {focusedAgent && (
                 <div className="flex items-center gap-2 text-[9px] font-bold neon-yellow italic">
                   <ShieldAlert size={12} /> View filtered by isolation logic
                 </div>
               )}
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {filteredRoles.filter(r => r !== AgentRole.WORK).map(role => {
                const isTarget = focusedAgent === role;
                return (
                  <div key={role} className={`p-3 rounded-sm border-2 transition-all ${isTarget ? 'border-yellow-500 bg-yellow-900/10 shadow-[0_0_15px_rgba(255,255,51,0.1)]' : 'border-[#440000] bg-black/20'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <button onClick={() => onAgentNameClick(role)} className="flex items-center gap-2 group">
                        <div className={`w-2 h-2 rounded-full ${isTarget ? 'bg-yellow-400' : 'bg-neutral-800 group-hover:bg-red-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isTarget ? 'neon-yellow' : 'text-neutral-500 group-hover:neon-red'}`}>{role}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        {isTarget && <Crosshair size={12} className="neon-yellow animate-pulse" />}
                        <button onClick={() => onReapplyFocus?.(isTarget ? null : role)} className="text-neutral-600 hover:neon-blue transition-colors">
                          <Target size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 bg-black/40 p-2 border border-white/5 rounded-sm mono leading-relaxed">
                      {state.agentOutputs[role] || "ERR: NO_SIGNAL"}
                    </p>
                  </div>
                );
              })}
              
              {focusedAgent && (
                <div className="p-3 bg-black/30 border border-red-900/20 rounded-sm text-center">
                  <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">Remaining outputs suppressed for continuum stability</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
