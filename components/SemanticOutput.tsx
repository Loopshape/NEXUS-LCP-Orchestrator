
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Terminal, ShieldAlert, Crosshair, Database } from 'lucide-react';

interface Props {
  state: SemanticState;
  focusedAgent?: AgentRole | null;
  onAgentNameClick: (role: AgentRole) => void;
  onReapplyFocus?: (role: AgentRole | null) => void;
}

export const SemanticOutput: React.FC<Props> = ({ state, focusedAgent, onAgentNameClick, onReapplyFocus }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={`mb-4 border border-[#880000] bg-[#1a0505] rounded shadow-lg overflow-hidden transition-all duration-300 ${focusedAgent ? 'ring-1 ring-yellow-400/30' : ''}`}>
      <div className="bg-gradient-to-r from-[#660000] to-[#220000] px-3 py-1 flex items-center justify-between border-b border-[#880000]">
        <div className="flex items-center gap-3">
          <Database size={12} className="neon-white" />
          <span className="text-[10px] font-bold neon-white">{state.id}</span>
          <span className={`text-[8px] font-black px-1 rounded ${state.type === 'hash' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            {state.type.toUpperCase()}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-1 neon-yellow text-[9px] font-bold border border-yellow-500/50 px-1.5 rounded animate-pulse">
              <Crosshair size={10} /> FOCUS_TARGET: {focusedAgent}
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-white/70 hover:text-white">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="p-3">
        <div className="mb-3">
          <div className="text-[8px] text-neutral-500 uppercase font-black mb-1">Signal Probe Input</div>
          <div className="text-xs italic text-neutral-300 border-l-2 border-red-900 pl-2">"{state.content}"</div>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Terminal size={10} className="neon-green" />
            <span className="text-[9px] font-black neon-green uppercase">Execution Matrix (WORK)</span>
          </div>
          <p className="text-xs leading-relaxed text-white font-medium bg-black/40 p-2 border border-green-900/30 rounded">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="mt-4 pt-3 border-t border-[#440000] grid grid-cols-1 gap-2">
            {AGGREGATION_ORDER.filter(r => r !== AgentRole.WORK).map(role => {
              const isTarget = focusedAgent === role;
              const isSuppressed = focusedAgent && !isTarget;

              return (
                <div key={role} className={`p-2 rounded border transition-all ${isTarget ? 'border-yellow-500 bg-yellow-900/10' : 'border-[#220000] bg-black/20'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <button onClick={() => onAgentNameClick(role)} className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${isTarget ? 'bg-yellow-400' : 'bg-neutral-800'}`} />
                      <span className={`text-[9px] font-black uppercase ${isTarget ? 'neon-yellow' : 'text-neutral-500'}`}>{role}</span>
                    </button>
                    {isTarget && <span className="text-[8px] neon-yellow font-bold uppercase">Probe Isolated</span>}
                  </div>
                  
                  {isSuppressed ? (
                    <div className="flex items-center gap-2 text-[9px] text-neutral-600 italic py-1 px-2">
                      <ShieldAlert size={10} /> Output suppressed due to focus isolation
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-400 bg-black/40 p-1.5 rounded-sm mono leading-relaxed">
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
