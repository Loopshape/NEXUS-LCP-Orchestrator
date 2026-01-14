
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
import { Cpu, Terminal, History, BarChart2, Activity, Info, XCircle, Lock, Unlock, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [readiness, setReadiness] = useState<Readiness>(Readiness.NULL);
  const [history, setHistory] = useState<SemanticState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentRole[]>([]);
  const [focusedAgent, setFocusedAgent] = useState<AgentRole | null>(null);
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentRole | null>(null);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setReadiness(Readiness.PI);
      await new Promise(r => setTimeout(r, 1500));
      setReadiness(Readiness.TWO_PI);
    };
    sequence();
  }, []);

  const handlePrompt = useCallback(async (input: string) => {
    if (readiness !== Readiness.TWO_PI || isProcessing) return;

    setIsProcessing(true);
    const id = generateHashId();
    const type = input.toLowerCase().includes('rehash') ? 'rehash' : 'hash';
    const parentIds = history.length > 0 ? [history[0].id] : [];
    
    const context = history.slice(0, 2).map(s => s.agentOutputs[AgentRole.WORK]).join('\n\n');
    const agentOutputs: Record<AgentRole, string> = {} as Record<AgentRole, string>;

    try {
      const promises = AGGREGATION_ORDER.map(async (role) => {
        setActiveAgents(prev => [...prev, role]);
        const output = await queryAgent(role, input, context, focusedAgent);
        agentOutputs[role] = output;
        return { role, output };
      });

      await Promise.all(promises);

      const newState: SemanticState = {
        id,
        timestamp: Date.now(),
        type,
        parentIds,
        content: input,
        agentOutputs,
        isConverged: !agentOutputs[AgentRole.LOOP].toLowerCase().includes('drift'),
        focusedAgentAtCreation: focusedAgent
      };

      setHistory(prev => [newState, ...prev]);
    } catch (error) {
      console.error("RUNTIME_FAILURE:", error);
    } finally {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  }, [readiness, isProcessing, history, focusedAgent]);

  const handleAgentClick = (role: AgentRole) => {
    if (focusedAgent === role) {
      // Toggle Focus Lock if already focused
      setIsFocusLocked(prev => !prev);
    } else {
      // Only change focus if not locked
      if (!isFocusLocked) {
        setFocusedAgent(role);
      }
    }
  };

  const handleBackgroundClick = () => {
    setFocusedAgent(null);
    setIsFocusLocked(false);
  };

  const openAgentModal = (role: AgentRole) => setSelectedAgentForModal(role);
  const reapplyFocus = (role: AgentRole | null) => {
    setFocusedAgent(role);
    setIsFocusLocked(false);
  };

  return (
    <div className="dashboard-container">
      {selectedAgentForModal && (
        <AgentModal 
          role={selectedAgentForModal} 
          isFocused={focusedAgent === selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)} 
        />
      )}

      {/* Left Panel: Controls & Metrics */}
      <aside className="window-panel">
        <div className="window-header">
           <span>System_OS :: Stats</span>
           <div className="flex gap-1">
               <div className="w-2 h-2 rounded-full bg-yellow-500" />
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <div className="w-2 h-2 rounded-full bg-blue-500" />
           </div>
        </div>
        <div className="window-content space-y-8">
           <div className="flex flex-col items-center mb-6">
              <Cpu className="w-10 h-10 neon-blue mb-2 pulse-active" />
              <h1 className="text-sm font-black neon-white tracking-widest uppercase">Nexus-LCP v1.5</h1>
              <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.4em]">Sovereign Runtime</span>
           </div>

           <ReadinessIndicator readiness={readiness} />

           <div className="space-y-4 pt-6 border-t border-red-900/30">
              <div className="flex items-center gap-2 text-[10px] font-black neon-green uppercase tracking-widest">
                 <BarChart2 size={12} /> Live Metrics
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-black/40 p-2 border border-green-900/30 rounded">
                    <div className="text-[8px] text-neutral-600 uppercase">Depth</div>
                    <div className="text-xs font-black neon-white">{history.length}</div>
                 </div>
                 <div className="bg-black/40 p-2 border border-green-900/30 rounded">
                    <div className="text-[8px] text-neutral-600 uppercase">Units</div>
                    <div className="text-xs font-black neon-green">{activeAgents.length}/8</div>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-6 border-t border-red-900/30">
              <div className="flex items-center gap-2 text-[10px] font-black neon-red uppercase tracking-widest">
                 <Activity size={12} /> Status Log
              </div>
              <div className="text-[9px] space-y-2 mono text-neutral-500">
                 <div className="flex justify-between"><span>Kernel</span> <span className="neon-green">OK</span></div>
                 <div className="flex justify-between"><span>Ensemble</span> <span className="neon-green">ALIGNED</span></div>
                 <div className="flex justify-between"><span>Entropy</span> <span className="neon-blue">0.002%</span></div>
                 <div className="flex justify-between"><span>Uptime</span> <span className="neon-yellow">10:09:42</span></div>
              </div>
           </div>
        </div>
        <div className="p-2 border-t border-red-900/20 bg-black/40 text-[8px] text-center font-bold text-neutral-700 uppercase tracking-widest">
            Protocol sovereign :: 0x00FF42
        </div>
      </aside>

      {/* Center Panel: Workspace */}
      <main className="window-panel">
        <div className="window-header">
           <span>Workspace :: Trace_Log</span>
           <div className="flex items-center gap-3">
              {focusedAgent && (
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${isFocusLocked ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                    {isFocusLocked ? <Lock size={10} /> : <Unlock size={10} />}
                    {isFocusLocked ? 'Focus Locked' : 'Isolated'}: {focusedAgent}
                    <button onClick={handleBackgroundClick} className="ml-1 hover:text-black"><XCircle size={10} /></button>
                </div>
              )}
              <Sparkles size={12} className="neon-blue" />
           </div>
        </div>
        <div className="window-content flex flex-col items-center">
           {history.length === 0 ? (
             <div className="flex-grow flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                <Terminal size={48} className="text-neutral-500" />
                <h2 className="text-lg font-black neon-white uppercase tracking-widest">Awaiting Pulse Signal</h2>
                <p className="text-[9px] mono uppercase tracking-widest max-w-[200px]">Establish first hash anchor to begin cognitive extraction cycle.</p>
             </div>
           ) : (
             <div className="w-full max-w-3xl">
                {history.map(state => (
                  <SemanticOutput 
                    key={state.id} 
                    state={state} 
                    focusedAgent={focusedAgent} 
                    onAgentNameClick={openAgentModal}
                    onReapplyFocus={reapplyFocus}
                  />
                ))}
             </div>
           )}
        </div>
        <div className="p-4 border-t border-red-900/30 bg-[#050510]">
           <NexusInput onSend={handlePrompt} disabled={readiness !== Readiness.TWO_PI} isProcessing={isProcessing} />
        </div>
      </main>

      {/* Right Panel: Topology */}
      <aside className="window-panel">
        <div className="window-header">
           <span>Network :: Topology</span>
           <Info size={12} />
        </div>
        <div className="window-content p-0">
           <AgentVisualizer 
              isProcessing={isProcessing} 
              activeAgents={activeAgents} 
              focusedAgent={focusedAgent}
              isFocusLocked={isFocusLocked}
              onAgentClick={handleAgentClick}
              onBackgroundClick={handleBackgroundClick}
           />
        </div>
        <div className="p-4 border-t border-red-900/30 bg-black/40">
           <div className="flex items-center gap-2 text-[10px] font-black neon-white uppercase tracking-widest mb-3">
              <History size={12} /> Recent Anchors
           </div>
           <div className="space-y-1.5">
             {history.slice(0, 6).map(h => (
               <div key={h.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-black/40 border border-[#440000] hover:border-blue-500/50 transition-all cursor-pointer group">
                  <span className="text-[9px] font-black text-neutral-500 group-hover:neon-blue">{h.id}</span>
                  <span className="text-[8px] text-neutral-700 font-bold">{h.type.toUpperCase()}</span>
               </div>
             ))}
           </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
