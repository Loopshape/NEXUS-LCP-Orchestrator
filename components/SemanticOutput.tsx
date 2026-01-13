
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Database, Focus, Filter, User } from 'lucide-react';

interface Props {
  state: SemanticState;
  focusedAgent?: AgentRole | null;
  onAgentNameClick: (role: AgentRole) => void;
}

export const SemanticOutput: React.FC<Props> = ({ state, focusedAgent, onAgentNameClick }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Filter logs: always show WORK, and if focused, show the focused agent only.
  const filteredRoles = AGGREGATION_ORDER.filter(role => {
    if (role === AgentRole.WORK) return true;
    if (focusedAgent) return role === focusedAgent;
    return true;
  });

  return (
    <div className={`w-full max-w-4xl bg-[#111] border rounded-lg overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all ${focusedAgent ? 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'border-neutral-800'}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#151515] border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-blue-500" />
          <span className="mono text-xs text-neutral-400 font-bold tracking-wider">{state.id}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${state.type === 'hash' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'} uppercase`}>
            {state.type}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 text-[10px] mono animate-pulse">
              <Filter size={10} />
              ROLE_ISOLATION: {focusedAgent.toUpperCase()}
            </div>
          )}
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-500 hover:text-white transition-colors p-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="flex-grow">
            <div className="mono text-[10px] text-neutral-600 uppercase mb-1">Input Signal</div>
            <p className="text-neutral-400 font-medium italic">"{state.content}"</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <div className="mono text-[10px] text-blue-500 uppercase mb-2 tracking-widest">Synthesis Output (WORK)</div>
          <p className="text-lg leading-relaxed text-neutral-200">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="space-y-4 border-t border-neutral-800 pt-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="mono text-[10px] text-neutral-500 uppercase tracking-widest">Agent Trace Logs</h4>
              {focusedAgent && (
                <span className="text-[9px] mono text-neutral-600 uppercase">Filtered View Active</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoles.filter(r => r !== AgentRole.WORK).map(role => (
                <div key={role} className={`bg-black/40 rounded p-3 border transition-all group ${focusedAgent === role ? 'border-blue-500/50 bg-blue-500/5' : 'border-neutral-900'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => onAgentNameClick(role)}
                      className="mono text-[10px] font-bold text-neutral-300 hover:text-blue-400 transition-colors uppercase cursor-pointer flex items-center gap-2"
                    >
                      {role}
                      <Focus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="h-px flex-grow mx-3 bg-neutral-800" />
                  </div>
                  <p className="text-xs text-neutral-400 italic leading-relaxed">
                    {state.agentOutputs[role] || "NULL"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-neutral-900/50 border border-neutral-800 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="mono text-[10px] text-neutral-500">CONVERGENCE</span>
                <span className={`mono text-[10px] font-bold ${state.isConverged ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {state.isConverged ? 'STABLE' : 'OSCILLATING'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="mono text-[10px] text-neutral-500">TIMESTAMP</span>
                 <span className="mono text-[10px] text-neutral-400">{new Date(state.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
