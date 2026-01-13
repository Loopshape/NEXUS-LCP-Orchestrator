
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Database, Focus, Filter, User, Info, Target } from 'lucide-react';

interface Props {
  state: SemanticState;
  focusedAgent?: AgentRole | null;
  onAgentNameClick: (role: AgentRole) => void;
  onReapplyFocus?: (role: AgentRole | null) => void;
}

export const SemanticOutput: React.FC<Props> = ({ state, focusedAgent, onAgentNameClick, onReapplyFocus }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Filter logs: always show WORK, plus the focused agent if one is active globally
  const filteredRoles = AGGREGATION_ORDER.filter(role => {
    if (role === AgentRole.WORK) return true;
    if (focusedAgent) return role === focusedAgent;
    return true;
  });

  return (
    <div 
      onClick={() => {
        // If user clicks the card while it has a creation-time focus, re-apply it
        if (state.focusedAgentAtCreation && onReapplyFocus && focusedAgent !== state.focusedAgentAtCreation) {
          onReapplyFocus(state.focusedAgentAtCreation);
        }
      }}
      className={`w-full max-w-4xl bg-[#0f0f0f] border rounded-xl overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 transition-all cursor-default ${focusedAgent ? 'border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.1)] ring-2 ring-blue-500/10' : 'border-neutral-800 hover:border-neutral-700 shadow-xl'}`}
    >
      <div className="flex items-center justify-between px-5 py-4 bg-[#141414] border-b border-neutral-800/50">
        <div className="flex items-center gap-4">
          <Database className="w-4 h-4 text-blue-500" />
          <span className="mono text-xs text-neutral-400 font-bold tracking-widest">{state.id}</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-widest ${state.type === 'hash' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'} uppercase`}>
            {state.type}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 text-[9px] mono font-black tracking-tighter animate-pulse shadow-inner">
              <Filter size={10} />
              ROLE_ISOLATION: {focusedAgent.toUpperCase()}
            </div>
          )}
          {state.focusedAgentAtCreation && !focusedAgent && (
            <div className="flex items-center gap-1.5 text-neutral-600 text-[9px] mono italic">
              <Target size={10} />
              Original context: {state.focusedAgentAtCreation}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all p-2 rounded-lg"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-start gap-5 mb-8 bg-neutral-900/30 p-4 rounded-xl border border-neutral-800/40">
          <div className="mt-1 p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 shadow-inner">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="flex-grow">
            <div className="mono text-[10px] text-neutral-600 uppercase mb-1.5 tracking-[0.2em] font-bold">Input Signal Vector</div>
            <p className="text-neutral-300 font-medium italic text-lg leading-relaxed">"{state.content}"</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="mono text-[10px] text-blue-500 uppercase tracking-[0.4em] font-black">Synthesis Matrix (WORK)</div>
            <div className="h-px flex-grow bg-blue-900/30" />
          </div>
          <p className="text-xl leading-relaxed text-neutral-100 font-light tracking-tight">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="space-y-6 border-t border-neutral-800/80 pt-8 mt-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <h4 className="mono text-[10px] text-neutral-500 uppercase tracking-[0.5em] font-bold">Cognitive Trace Extraction</h4>
              {focusedAgent && (
                <button 
                   onClick={(e) => { e.stopPropagation(); if (onReapplyFocus) onReapplyFocus(null); }}
                   className="text-[9px] mono text-blue-400 uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                >
                  Show All Agents
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoles.filter(r => r !== AgentRole.WORK).map(role => (
                <div key={role} className={`bg-black/60 rounded-xl p-5 border-2 transition-all group relative overflow-hidden ${focusedAgent === role ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-neutral-900 hover:border-neutral-700'}`}>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAgentNameClick(role); }}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-2 h-2 rounded-full ${focusedAgent === role ? 'bg-blue-400' : 'bg-neutral-800'}`} />
                      <span className="mono text-[11px] font-black text-neutral-200 uppercase tracking-widest">{role}</span>
                    </button>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAgentNameClick(role); }}
                        className="p-1.5 text-neutral-600 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                        title="Inspect Agent"
                      >
                        <Info size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if (onReapplyFocus) onReapplyFocus(role); }}
                        className={`p-1.5 rounded-md transition-all ${focusedAgent === role ? 'text-blue-400 bg-blue-400/10' : 'text-neutral-600 hover:text-blue-400 hover:bg-blue-400/10'}`}
                        title="Toggle Focus"
                      >
                        <Focus size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-neutral-400 italic leading-relaxed font-mono relative z-10">
                    {state.agentOutputs[role] || "SIGNAL_NULL"}
                  </p>
                  {focusedAgent === role && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-[#0a0a0a] border border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-10">
                <div className="flex flex-col gap-1.5">
                  <span className="mono text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Continuum Stability</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${state.isConverged ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={`mono text-xs font-black ${state.isConverged ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {state.isConverged ? 'STABLE_CONVERGENCE' : 'SEMANTIC_OSCILLATION'}
                    </span>
                  </div>
                </div>
                <div className="w-px h-10 bg-neutral-800/50 hidden sm:block" />
                <div className="flex flex-col gap-1.5">
                  <span className="mono text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Temporal Anchor</span>
                  <span className="mono text-xs text-neutral-400 font-black">{new Date(state.timestamp).toLocaleTimeString()} // {new Date(state.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                 <span className="mono text-[9px] text-neutral-700 uppercase tracking-widest font-bold">LCP_SIGNATURE</span>
                 <span className="mono text-[10px] text-blue-500/70 font-black">{state.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
