
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

  // Filter logs: always show WORK, and if a focus is active, only show the focused agent.
  const filteredRoles = AGGREGATION_ORDER.filter(role => {
    if (role === AgentRole.WORK) return true;
    if (focusedAgent) return role === focusedAgent;
    return true;
  });

  return (
    <div className={`w-full max-w-4xl bg-[#111] border rounded-lg overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all ${focusedAgent ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20' : 'border-neutral-800'}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#151515] border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-blue-500" />
          <span className="mono text-xs text-neutral-400 font-bold tracking-wider">{state.id}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${state.type === 'hash' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'} uppercase`}>
            {state.type}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 text-[9px] mono tracking-widest animate-pulse">
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
            <User className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex-grow">
            <div className="mono text-[10px] text-neutral-600 uppercase mb-1 tracking-widest">Input Vector</div>
            <p className="text-neutral-300 font-medium italic leading-relaxed">"{state.content}"</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <div className="mono text-[10px] text-blue-500 uppercase mb-2 tracking-[0.2em] font-bold">Synthesis Matrix (WORK)</div>
          <p className="text-lg leading-relaxed text-neutral-100 font-light">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="space-y-4 border-t border-neutral-800 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="mono text-[10px] text-neutral-500 uppercase tracking-[0.3em]">Agent Cognitive Trace</h4>
              {focusedAgent && (
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                   <span className="text-[9px] mono text-blue-500 uppercase font-bold">Filtered View Active</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoles.filter(r => r !== AgentRole.WORK).map(role => (
                <div key={role} className={`bg-black/40 rounded p-4 border transition-all group ${focusedAgent === role ? 'border-blue-500/50 bg-blue-500/10' : 'border-neutral-900 hover:border-neutral-800'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <button 
                      onClick={() => onAgentNameClick(role)}
                      className="mono text-[10px] font-bold text-neutral-200 hover:text-blue-400 transition-colors uppercase cursor-pointer flex items-center gap-2"
                    >
                      {role}
                      <Focus size={10} className={`${focusedAgent === role ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-blue-400`} />
                    </button>
                    <div className="h-px flex-grow mx-3 bg-neutral-800" />
                  </div>
                  <p className="text-xs text-neutral-400 italic leading-relaxed font-mono">
                    {state.agentOutputs[role] || "NULL"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span className="mono text-[9px] text-neutral-600 uppercase tracking-widest">Convergence</span>
                  <span className={`mono text-[10px] font-bold ${state.isConverged ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {state.isConverged ? 'STABLE' : 'OSCILLATING'}
                  </span>
                </div>
                <div className="w-px h-6 bg-neutral-800" />
                <div className="flex flex-col gap-1">
                  <span className="mono text-[9px] text-neutral-600 uppercase tracking-widest">Timeline</span>
                  <span className="mono text-[10px] text-neutral-400 font-bold">{new Date(state.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                <span className="mono text-[8px] text-neutral-600 uppercase">LCP_SIG: {state.id.slice(-6)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
