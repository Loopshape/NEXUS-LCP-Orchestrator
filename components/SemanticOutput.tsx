
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Database, Focus, Filter, User, Info, Target, Eye, Crosshair, Lock, ShieldAlert } from 'lucide-react';

interface Props {
  state: SemanticState;
  focusedAgent?: AgentRole | null;
  onAgentNameClick: (role: AgentRole) => void;
  onReapplyFocus?: (role: AgentRole | null) => void;
}

export const SemanticOutput: React.FC<Props> = ({ state, focusedAgent, onAgentNameClick, onReapplyFocus }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div 
      className={`w-full bg-[#0a0a0f] border-l-4 transition-all duration-500 mb-4 rounded-r-lg group overflow-hidden ${focusedAgent ? 'border-blue-500 shadow-[0_0_20px_rgba(0,229,255,0.1)]' : 'border-neutral-800'}`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Database className={`w-3 h-3 ${focusedAgent ? 'neon-blue' : 'text-neutral-500'}`} />
          <span className="mono text-[10px] font-bold neon-white">{state.id}</span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded mono font-black tracking-widest ${state.type === 'hash' ? 'bg-blue-900/40 text-blue-400 border border-blue-500/30' : 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30'}`}>
            {state.type.toUpperCase()}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-1.5 bg-blue-600/20 text-blue-100 px-2 py-0.5 rounded border border-blue-500/30 text-[9px] mono font-black animate-pulse">
              <Focus size={10} className="neon-blue" />
              FOCUS: {focusedAgent.toUpperCase()}
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-neutral-600 hover:neon-white transition-all">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="mono text-[9px] text-neutral-600 uppercase tracking-widest mb-1 font-black">Prompt Signal</div>
          <p className="text-sm text-neutral-300 italic font-medium">"{state.content}"</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="mono text-[9px] neon-blue uppercase tracking-widest font-black">Protocol Output (WORK)</div>
            <div className="h-px flex-grow bg-white/5" />
          </div>
          <p className="text-sm leading-relaxed neon-white font-medium">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5 mt-4">
            {AGGREGATION_ORDER.filter(r => r !== AgentRole.WORK).map(role => {
              const isTarget = focusedAgent === role;
              const isSuppressed = focusedAgent && !isTarget;
              
              return (
                <div key={role} className={`p-3 rounded-lg border transition-all ${isTarget ? 'bg-blue-900/10 border-blue-500/40' : 'bg-black/40 border-white/5'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => onAgentNameClick(role)}
                      className="flex items-center gap-2 group/btn"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isTarget ? 'bg-blue-400' : 'bg-neutral-800'}`} />
                      <span className={`mono text-[10px] font-black uppercase tracking-widest ${isTarget ? 'neon-blue' : 'text-neutral-500'}`}>{role}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {isTarget && <Crosshair size={10} className="neon-blue animate-pulse" />}
                      <button onClick={() => onReapplyFocus?.(isTarget ? null : role)} className="text-neutral-700 hover:neon-blue transition-all">
                        <Focus size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {isSuppressed ? (
                    <div className="flex items-center gap-2 text-[10px] mono text-neutral-700 italic py-1">
                      <ShieldAlert size={12} />
                      Output suppressed due to focus isolation
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-400 font-mono leading-relaxed bg-black/40 p-2 rounded">
                      {state.agentOutputs[role] || "NULL_SIGNAL"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
