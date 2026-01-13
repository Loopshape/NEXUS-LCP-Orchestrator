
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
import { Terminal, Cpu, Info, RefreshCcw, Focus, XCircle, History } from 'lucide-react';

const App: React.FC = () => {
  const [readiness, setReadiness] = useState<Readiness>(Readiness.NULL);
  const [history, setHistory] = useState<SemanticState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentRole[]>([]);
  const [focusedAgent, setFocusedAgent] = useState<AgentRole | null>(null);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentRole | null>(null);

  // Simulation of the 2π readiness sequence
  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1500));
      setReadiness(Readiness.PI);
      await new Promise(r => setTimeout(r, 2000));
      setReadiness(Readiness.TWO_PI);
    };
    sequence();
  }, []);

  const handlePrompt = useCallback(async (input: string) => {
    if (readiness !== Readiness.TWO_PI || isProcessing) return;

    setIsProcessing(true);
    const id = generateHashId();
    const type = input.toLowerCase().includes('rehash') ? 'rehash' : 'hash';
    const parentIds = history.length > 0 ? [history[history.length - 1].id] : [];
    
    const context = history.slice(-2).map(s => s.agentOutputs[AgentRole.WORK]).join('\n\n');
    const agentOutputs: Record<AgentRole, string> = {} as Record<AgentRole, string>;

    try {
      const promises = AGGREGATION_ORDER.map(async (role) => {
        setActiveAgents(prev => [...prev, role]);
        const output = await queryAgent(role, input, context);
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
        isConverged: !agentOutputs[AgentRole.LOOP].toLowerCase().includes('drift') && 
                     !agentOutputs[AgentRole.LOOP].toLowerCase().includes('contradiction'),
        focusedAgentAtCreation: focusedAgent
      };

      setHistory(prev => [newState, ...prev]);
    } catch (error) {
      console.error("LCP Runtime Error:", error);
    } finally {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  }, [readiness, isProcessing, history, focusedAgent]);

  const handleAgentClick = (role: AgentRole) => {
    // Toggle focus: if already focused, clear it. Otherwise, set it.
    setFocusedAgent(prev => prev === role ? null : role);
  };

  const handleBackgroundClick = () => {
    setFocusedAgent(null);
  };

  const openAgentModal = (role: AgentRole) => {
    setSelectedAgentForModal(role);
  };

  const reapplyFocus = (role: AgentRole | null) => {
    setFocusedAgent(role);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0a0a0a] overflow-x-hidden selection:bg-blue-500/30">
      {/* Agent Details Modal */}
      {selectedAgentForModal && (
        <AgentModal 
          role={selectedAgentForModal} 
          onClose={() => setSelectedAgentForModal(null)} 
        />
      )}

      {/* Header / Readiness Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
            <Cpu className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="mono text-sm font-black tracking-tighter text-white">NEXUS-LCP <span className="text-neutral-600 font-normal">v1.0</span></h1>
            <p className="text-[10px] text-neutral-500 mono uppercase tracking-widest">Logical Continuum Protocol</p>
          </div>
        </div>
        <ReadinessIndicator readiness={readiness} />
      </header>

      <main className="flex-grow w-full max-w-6xl px-6 flex flex-col items-center pt-12">
        {history.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-1000">
            <AgentVisualizer 
              history={history} 
              isProcessing={isProcessing} 
              activeAgents={activeAgents} 
              focusedAgent={focusedAgent}
              onAgentClick={handleAgentClick}
              onBackgroundClick={handleBackgroundClick}
            />
            
            <div className="mt-12 mb-16 text-center max-w-2xl">
              <h2 className="text-5xl font-light text-white tracking-tighter mb-6">
                Orchestrate <span className="text-blue-500 font-black">Deterministic</span> Intelligence
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed mx-auto font-medium">
                Implement multi-agent ensembles with semantic lineage tracking. 
                Move beyond stochastic output to verifiable cognitive convergence through LCP-1.0 standards.
              </p>
              {focusedAgent && (
                <div className="mt-8 flex items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="mono text-[11px] bg-blue-500/10 border-2 border-blue-500/40 text-blue-400 px-5 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Focus size={14} className="animate-pulse" />
                    ISOLATION_FILTER_ACTIVE: <span className="font-black underline">{focusedAgent.toUpperCase()}</span>
                  </div>
                  <button 
                    onClick={() => setFocusedAgent(null)}
                    className="text-neutral-600 hover:text-red-400 transition-all flex items-center gap-2 group bg-neutral-900/40 px-3 py-2 rounded-full border border-neutral-800"
                  >
                    <XCircle size={14} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] mono font-bold">CLEAR_FOCUS</span>
                  </button>
                </div>
              )}
            </div>

            <NexusInput 
              onSend={handlePrompt} 
              disabled={readiness !== Readiness.TWO_PI} 
              isProcessing={isProcessing} 
            />

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl opacity-30 hover:opacity-100 transition-all duration-700">
               <div className="flex flex-col gap-3 p-6 border-2 border-neutral-900 rounded-2xl bg-[#0d0d0d] hover:border-blue-500/20 transition-all">
                  <Terminal size={24} className="text-blue-500" />
                  <h3 className="mono text-[11px] font-black text-neutral-300 tracking-widest uppercase">PROTOCOL: HASH</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">Creates a new truth anchor. Anchors the current reasoning path in a verifiable time-indexed origin for lineage auditing.</p>
               </div>
               <div className="flex flex-col gap-3 p-6 border-2 border-neutral-900 rounded-2xl bg-[#0d0d0d] hover:border-emerald-500/20 transition-all">
                  <RefreshCcw size={24} className="text-emerald-500" />
                  <h3 className="mono text-[11px] font-black text-neutral-300 tracking-widest uppercase">PROTOCOL: REHASH</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">Semantic transformation of existing lineage. Enables recursive self-reflection without data mutation or history loss.</p>
               </div>
               <div className="flex flex-col gap-3 p-6 border-2 border-neutral-900 rounded-2xl bg-[#0d0d0d] hover:border-amber-500/20 transition-all">
                  <Info size={24} className="text-amber-500" />
                  <h3 className="mono text-[11px] font-black text-neutral-300 tracking-widest uppercase">2π_READINESS</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">System enforces full 8-agent warming sequence before accepting cognitive loads to ensure deterministic stability.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center pt-8 animate-in fade-in duration-1000">
            <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-2xl w-full py-8 z-20 flex flex-col items-center border-b border-neutral-800/50 mb-16">
               <div className="flex items-center gap-8 w-full max-w-4xl px-4">
                  <div className="flex-grow">
                    <NexusInput 
                      onSend={handlePrompt} 
                      disabled={readiness !== Readiness.TWO_PI} 
                      isProcessing={isProcessing} 
                    />
                  </div>
                  {focusedAgent && (
                    <button 
                      onClick={() => setFocusedAgent(null)}
                      className="mono text-[10px] bg-blue-600/10 border-2 border-blue-500/40 text-blue-400 px-5 py-3 rounded-xl hover:bg-blue-600/20 transition-all flex items-center gap-3 whitespace-nowrap shadow-lg animate-in slide-in-from-right-4"
                    >
                      <XCircle size={16} />
                      CLEAR_FOCUS: {focusedAgent.toUpperCase()}
                    </button>
                  )}
               </div>
               {history.length > 0 && (
                 <div className="mt-4 flex items-center gap-2 mono text-[9px] text-neutral-600 uppercase tracking-widest">
                   <History size={10} />
                   Continuum Depth: {history.length} states // Active Ensemble: 8-Agent Core
                 </div>
               )}
            </div>
            
            <div className="w-full flex flex-col items-center gap-4 pb-20">
              {history.map((state) => (
                <SemanticOutput 
                  key={state.id} 
                  state={state} 
                  focusedAgent={focusedAgent} 
                  onAgentNameClick={openAgentModal}
                  onReapplyFocus={reapplyFocus}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full p-12 flex flex-col items-center gap-4 border-t border-neutral-900/50 bg-[#0a0a0a]">
        <div className="p-3 border border-neutral-800 rounded-xl bg-black/40">
           <Cpu className="w-6 h-6 text-neutral-700" />
        </div>
        <div className="mono text-[10px] text-neutral-700 tracking-[0.4em] uppercase font-black">
          Nexus Architecture Working Group // 2024_LCP_STABLE_1.0
        </div>
      </footer>
    </div>
  );
};

export default App;
