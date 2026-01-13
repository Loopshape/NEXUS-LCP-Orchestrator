
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Database, Focus, Filter, User, Info, Target, Eye, Crosshair } from 'lucide-react';

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

  const hasOriginalFocus = state.focusedAgentAtCreation && focusedAgent !== state.focusedAgentAtCreation;

  return (
    <div 
      className={`w-full max-w-4xl bg-[#0d0d0d] border rounded-2xl overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-all ${focusedAgent ? 'border-blue-500/60 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/10 scale-[1.01]' : 'border-neutral-800 hover:border-neutral-700 shadow-2xl'}`}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-neutral-800/50">
        <div className="flex items-center gap-5">
          <Database className="w-4 h-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="mono text-[10px] text-neutral-500 font-bold tracking-widest">{state.id}</span>
            <span className="text-[8px] text-neutral-600 mono">{new Date(state.timestamp).toLocaleTimeString()}</span>
          </div>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-md border font-black tracking-widest ${state.type === 'hash' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'} uppercase`}>
            {state.type}
          </span>
          {focusedAgent && (
            <div className="flex items-center gap-2 bg-blue-600/20 text-blue-100 px-4 py-1 rounded-full border border-blue-500/40 text-[9px] mono font-black tracking-widest animate-pulse shadow-lg">
              <Filter size={10} className="text-blue-300" />
              FOCUS_ISOLATION: {focusedAgent.toUpperCase()}
            </div>
          )}
          {hasOriginalFocus && (
            <button 
              onClick={() => onReapplyFocus?.(state.focusedAgentAtCreation!)}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-blue-400 transition-colors text-[9px] mono italic group"
            >
              <Target size={10} className="group-hover:scale-110" />
              Re-apply Creation Focus: {state.focusedAgentAtCreation}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all p-2 rounded-xl"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-start gap-6 mb-10 bg-black/40 p-5 rounded-2xl border border-neutral-800/30">
          <div className="mt-1 p-3 bg-neutral-900 rounded-xl border border-neutral-800 shadow-inner">
            <User className="w-6 h-6 text-neutral-500" />
          </div>
          <div className="flex-grow">
            <div className="mono text-[10px] text-neutral-600 uppercase mb-2 tracking-[0.3em] font-black">Continuum Input Probe</div>
            <p className="text-neutral-300 font-medium italic text-xl leading-relaxed">"{state.content}"</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="mono text-[10px] text-blue-500 uppercase tracking-[0.5em] font-black">Synthesis Matrix (WORK)</div>
              <div className="h-px w-24 bg-blue-900/40" />
            </div>
            {focusedAgent && (
              <div className="text-[9px] mono text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">
                TRACED AGAINST: {focusedAgent.toUpperCase()}
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r from-blue-900/10 to-transparent p-1 rounded-r-lg">
            <p className="text-xl leading-relaxed text-white font-light tracking-tight selection:bg-blue-500/40">
              {state.agentOutputs[AgentRole.WORK]}
            </p>
          </div>
        </div>

        {expanded && (
          <div className="space-y-8 border-t border-neutral-800 pt-10 mt-10 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="mono text-[10px] text-neutral-500 uppercase tracking-[0.5em] font-black">Cognitive Trace Analytics</h4>
                <div className="h-0.5 w-12 bg-blue-500/50" />
              </div>
              {focusedAgent && (
                <button 
                   onClick={() => onReapplyFocus?.(null)}
                   className="text-[9px] mono text-blue-400 uppercase bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Eye size={12} />
                  Restore Ensemble View
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoles.filter(r => r !== AgentRole.WORK).map(role => (
                <div 
                  key={role} 
                  className={`bg-[#080808] rounded-2xl p-6 border-2 transition-all group relative overflow-hidden ${focusedAgent === role ? 'border-blue-500/80 bg-blue-600/5 shadow-[0_0_25px_rgba(59,130,246,0.1)]' : 'border-neutral-900 hover:border-neutral-800'}`}
                >
                  <div className="flex justify-between items-center mb-5 relative z-10">
                    <button 
                      onClick={() => onAgentNameClick(role)}
                      className="flex items-center gap-3 group/btn"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${focusedAgent === role ? 'bg-blue-400' : 'bg-neutral-800 group-hover/btn:bg-neutral-600'}`} />
                      <span className="mono text-xs font-black text-neutral-200 uppercase tracking-widest">{role}</span>
                      {focusedAgent === role && (
                        <Crosshair size={12} className="text-blue-400 animate-pulse" />
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAgentNameClick(role)}
                        className="p-2 text-neutral-600 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                        title="View Protocol Specs"
                      >
                        <Info size={16} />
                      </button>
                      <button 
                        onClick={() => onReapplyFocus?.(focusedAgent === role ? null : role)}
                        className={`p-2 rounded-lg transition-all ${focusedAgent === role ? 'text-blue-400 bg-blue-400/20' : 'text-neutral-600 hover:text-blue-400 hover:bg-blue-400/10'}`}
                        title="Toggle Focus Isolation"
                      >
                        <Focus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="relative z-10 p-4 bg-black/40 rounded-xl border border-neutral-800/50">
                    <p className="text-[13px] text-neutral-400 italic leading-relaxed font-mono">
                      {state.agentOutputs[role] || "SIGNAL_LOST"}
                    </p>
                  </div>
                  {focusedAgent === role && (
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-8 bg-[#050505] border border-neutral-900 rounded-2xl flex flex-wrap items-center justify-between gap-8">
              <div className="flex items-center gap-12">
                <div className="flex flex-col gap-2">
                  <span className="mono text-[10px] text-neutral-600 uppercase tracking-[0.3em] font-black">Stability Index</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${state.isConverged ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={`mono text-xs font-black tracking-widest ${state.isConverged ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {state.isConverged ? 'STABLE_CONTINUUM' : 'REHASH_REQUIRED'}
                    </span>
                  </div>
                </div>
                <div className="w-px h-12 bg-neutral-800/60 hidden lg:block" />
                <div className="flex flex-col gap-2">
                  <span className="mono text-[10px] text-neutral-600 uppercase tracking-[0.3em] font-black">Temporal Hash</span>
                  <span className="mono text-xs text-neutral-400 font-black">{new Date(state.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-2 bg-neutral-900/80 rounded-xl border border-neutral-800/50 shadow-inner">
                 <span className="mono text-[9px] text-neutral-700 uppercase tracking-widest font-black">SIGNATURE</span>
                 <span className="mono text-xs text-blue-500/80 font-black">{state.id}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
