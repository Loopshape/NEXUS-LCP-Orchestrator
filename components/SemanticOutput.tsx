
import React from 'react';
import { SemanticState, AgentRole } from '../types';
import { AGGREGATION_ORDER } from '../constants';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

interface Props {
  state: SemanticState;
}

export const SemanticOutput: React.FC<Props> = ({ state }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="w-full max-w-4xl bg-[#111] border border-neutral-800 rounded-lg overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-4 py-3 bg-[#151515] border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-blue-500" />
          <span className="mono text-xs text-neutral-400 font-bold tracking-wider">{state.id}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${state.type === 'hash' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'} uppercase`}>
            {state.type}
          </span>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-500 hover:text-white transition-colors p-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="p-6">
        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-lg leading-relaxed text-neutral-200">
            {state.agentOutputs[AgentRole.WORK]}
          </p>
        </div>

        {expanded && (
          <div className="space-y-4 border-t border-neutral-800 pt-6 mt-6">
            <h4 className="mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Agent Trace Logs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGGREGATION_ORDER.filter(r => r !== AgentRole.WORK).map(role => (
                <div key={role} className="bg-black/40 rounded p-3 border border-neutral-900">
                  <div className="flex justify-between items-center mb-2">
                    <span className="mono text-[10px] font-bold text-neutral-300">{role.toUpperCase()}</span>
                    <div className="h-px flex-grow mx-3 bg-neutral-800" />
                  </div>
                  <p className="text-xs text-neutral-400 italic line-clamp-3 hover:line-clamp-none transition-all">
                    {state.agentOutputs[role] || "NULL"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded flex items-center justify-between">
              <span className="mono text-[10px] text-blue-400">CONVERGENCE_STATUS</span>
              <span className={`mono text-[10px] font-bold ${state.isConverged ? 'text-emerald-400' : 'text-amber-400'}`}>
                {state.isConverged ? 'STABLE' : 'OSCILLATING'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
