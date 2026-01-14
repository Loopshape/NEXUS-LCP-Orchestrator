
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
import { Cpu, Terminal, History, BarChart2, Activity, Info, XCircle, Lock, Unlock, Sparkles, Target } from 'lucide-react';

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
      console.error("LCP_RUNTIME_FAILURE:", error);
    } finally {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  }, [readiness, isProcessing, history, focusedAgent]);

  const handleAgentClick = (role: AgentRole) => {
    if (focusedAgent === role) {
      // Toggle Focus Lock on re-click
      setIsFocusLocked(prev => !prev);
    } else {
      // Change focus only if not locked
      if (!isFocusLocked) {
        setFocusedAgent(role);
      }
    }
  };

  const handleBackgroundClick = () => {
    if (!isFocusLocked || true) { // Always allow unlock via background click as safety
        setFocusedAgent(null);
        setIsFocusLocked(false);
    }
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

      {/* Panel: Stats & Controls */}
      <aside className="window-panel">
        <div className="window-header">
           <span>System_OS :: Extraction</span>
           <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(255,255,0,0.5)]" />
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(0,255,0,0.5)]" />
               <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(0,0,255,0.5)]" />
           </div>
        </div>
        <div className="window-content space-y-10">
           <div className="flex flex-col items-center py-6 border-b border-red-900/20">
              <Cpu className="w-12 h-12 neon-blue mb-4 pulse-active" />
              <h1 className="text-md font-black neon-white tracking-[0.3em] uppercase text-center">Nexus-LCP v1.5</h1>
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.5em] mt-2">Sovereign Protocol Hub</span>
           </div>

           <ReadinessIndicator readiness={readiness} />

           <div className="space-y-6 pt-6 border-t border-red-900/30">
              <div className="flex items-center gap-2 text-[10px] font-black neon-green uppercase tracking-[0.4em]">
                 <BarChart2 size={14} /> Extraction Metrics
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/60 p-3 border-2 border-green-900/30 rounded-sm">
                    <div className="text-[8px] text-neutral-600 font-bold uppercase mb-1">Depth</div>
                    <div className="text-sm font-black neon-white">{history.length}</div>
                 </div>
                 <div className="bg-black/60 p-3 border-2 border-green-900/30 rounded-sm">
                    <div className="text-[8px] text-neutral-600 font-bold uppercase mb-1">Ensemble</div>
                    <div className="text-sm font-black neon-green">{activeAgents.length}/8</div>
                 </div>
              </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-red-900/30">
              <div className="flex items-center gap-2 text-[10px] font-black neon-red uppercase tracking-[0.4em]">
                 <Activity size={14} /> OS_Status Log
              </div>
              <div className="text-[9px] space-y-3 font-bold text-neutral-500 uppercase">
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Kernel</span> <span className="neon-green">SAFE</span></div>
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Alignment</span> <span className="neon-green">NOMINAL</span></div>
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Continuum</span> <span className="neon-blue">STABLE</span></div>
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Runtime</span> <span className="neon-yellow">v1.5.0-LCP</span></div>
              </div>
           </div>
        </div>
        <div className="p-3 border-t-2 border-red-900/40 bg-[#050510] text-[9px] text-center font-black text-neutral-700 uppercase tracking-[0.4em]">
            Protocol Sovereign :: 0xVJ_BLACK
        </div>
      </aside>

      {/* Panel: Continuum Workspace */}
      <main className="window-panel">
        <div className="window-header">
           <div className="flex items-center gap-2">
              <Terminal size={12} className="neon-white" />
              <span>Workspace :: Trace_Extraction</span>
           </div>
           <div className="flex items-center gap-4">
              {focusedAgent && (
                <div className={`flex items-center gap-2 px-3 py-0.5 rounded-sm text-[10px] font-black uppercase transition-all shadow-lg ${isFocusLocked ? 'bg-yellow-500 text-black border-2 border-white' : 'bg-blue-600 text-white border border-blue-400'}`}>
                    <Target size={12} />
                    {isFocusLocked ? 'FOCUS_LOCKED' : 'ISOLATED'}: {focusedAgent}
                    <button onClick={handleBackgroundClick} className="ml-2 hover:opacity-70 transition-opacity"><XCircle size={12} /></button>
                </div>
              )}
              <Sparkles size={14} className="neon-blue" />
           </div>
        </div>
        <div className="window-content flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
           {history.length === 0 ? (
             <div className="flex-grow flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                <Terminal size={64} className="text-neutral-500" />
                <h2 className="text-xl font-black neon-white uppercase tracking-[0.5em]">Initialize Signal Hub</h2>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] max-w-[300px]">Provide logical probe input to activate multi-agent extraction cycle.</p>
             </div>
           ) : (
             <div className="w-full max-w-3xl py-4">
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
        <div className="p-6 border-t-2 border-red-900/40 bg-[#020205] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <NexusInput onSend={handlePrompt} disabled={readiness !== Readiness.TWO_PI} isProcessing={isProcessing} />
        </div>
      </main>

      {/* Panel: Network Topology */}
      <aside className="window-panel">
        <div className="window-header">
           <div className="flex items-center gap-2">
              <Activity size={12} className="neon-white" />
              <span>Network :: Topology</span>
           </div>
           <Info size={14} className="neon-blue" />
        </div>
        <div className="window-content p-0 border-b border-red-900/30">
           <AgentVisualizer 
              isProcessing={isProcessing} 
              activeAgents={activeAgents} 
              focusedAgent={focusedAgent}
              isFocusLocked={isFocusLocked}
              onAgentClick={handleAgentClick}
              onBackgroundClick={handleBackgroundClick}
           />
        </div>
        <div className="p-5 bg-black/40 h-[30%] flex flex-col">
           <div className="flex items-center gap-3 mb-4">
              <History size={14} className="neon-white" />
              <span className="text-[10px] font-black neon-white uppercase tracking-[0.3em]">Lineage_Anchors</span>
           </div>
           <div className="flex-grow overflow-y-auto space-y-2">
             {history.slice(0, 8).map(h => (
               <div key={h.id} className="flex items-center justify-between p-2.5 rounded-sm bg-black/40 border border-[#440000] hover:border-blue-500/50 transition-all cursor-pointer group">
                  <span className="text-[10px] font-black text-neutral-600 group-hover:neon-blue tracking-widest">{h.id}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-[8px] text-neutral-700 font-bold uppercase italic">{h.type}</span>
                    <div className={`w-1 h-1 rounded-full ${h.type === 'hash' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  </div>
               </div>
             ))}
           </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
