
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
import { Terminal, Cpu, Info, RefreshCcw, Focus, XCircle, History, Sparkles, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [readiness, setReadiness] = useState<Readiness>(Readiness.NULL);
  const [history, setHistory] = useState<SemanticState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentRole[]>([]);
  const [focusedAgent, setFocusedAgent] = useState<AgentRole | null>(null);
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentRole | null>(null);

  // Simulation of the 2π readiness sequence
  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1200));
      setReadiness(Readiness.PI);
      await new Promise(r => setTimeout(r, 1800));
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
        // Pass the current focus state to the agent query for context-aware reasoning
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
    // If clicking focused agent, lock it.
    if (focusedAgent === role) {
      setIsFocusLocked(true);
    } else {
      // If locked, clicking another node does nothing until manually cleared or clicked background
      if (!isFocusLocked) {
        setFocusedAgent(role);
      }
    }
  };

  const handleBackgroundClick = () => {
    setFocusedAgent(null);
    setIsFocusLocked(false);
  };

  const openAgentModal = (role: AgentRole) => {
    setSelectedAgentForModal(role);
  };

  const reapplyFocus = (role: AgentRole | null) => {
    setFocusedAgent(role);
    setIsFocusLocked(false); // Reapplying historical focus doesn't auto-lock
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050505] text-neutral-300 overflow-x-hidden selection:bg-blue-500/30">
      {/* Agent Details Modal */}
      {selectedAgentForModal && (
        <AgentModal 
          role={selectedAgentForModal} 
          isFocused={focusedAgent === selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)} 
        />
      )}

      {/* Header / Readiness Bar */}
      <header className="w-full max-w-7xl flex items-center justify-between p-8 z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Cpu className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="mono text-lg font-black tracking-tighter text-white">NEXUS-LCP <span className="text-neutral-700 font-normal">v1.5.1</span></h1>
            <p className="text-[10px] text-neutral-600 mono uppercase tracking-[0.5em] font-bold">Logical Continuum Protocol</p>
          </div>
        </div>
        <ReadinessIndicator readiness={readiness} />
      </header>

      <main className="flex-grow w-full max-w-7xl px-8 flex flex-col items-center pt-8">
        {history.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center min-h-[75vh] animate-in fade-in duration-1000">
            <AgentVisualizer 
              history={history} 
              isProcessing={isProcessing} 
              activeAgents={activeAgents} 
              focusedAgent={focusedAgent}
              isFocusLocked={isFocusLocked}
              onAgentClick={handleAgentClick}
              onBackgroundClick={handleBackgroundClick}
            />
            
            <div className="mt-16 mb-20 text-center max-w-3xl">
              <h2 className="text-6xl font-black text-white tracking-tighter mb-8 leading-tight">
                Orchestrate <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Verifiable</span> Reasoning
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mx-auto font-medium max-w-xl">
                Deploy asynchronous agent ensembles with strict semantic lineage. 
                Move from black-box responses to a traceable logical continuum.
              </p>
              
              <div className="mt-12 flex items-center justify-center gap-8">
                {focusedAgent ? (
                  <div className="flex items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className={`mono text-xs ${isFocusLocked ? 'bg-blue-600 border-white text-white' : 'bg-blue-600/10 border-blue-500/50 text-blue-100'} border-2 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-md transition-all`}>
                      {isFocusLocked ? <Lock size={16} /> : <Focus size={18} className="text-blue-400 animate-pulse" />}
                      {isFocusLocked ? 'FOCUS_LOCK_ENGAGED:' : 'ROLE_EXTRACTION_ACTIVE:'} <span className="font-black underline decoration-blue-500/50 underline-offset-4">{focusedAgent.toUpperCase()}</span>
                    </div>
                    <button 
                      onClick={() => { setFocusedAgent(null); setIsFocusLocked(false); }}
                      className="text-neutral-500 hover:text-white transition-all flex items-center gap-2 group bg-neutral-900/50 px-4 py-3 rounded-2xl border border-neutral-800"
                    >
                      <XCircle size={18} className="group-hover:rotate-90 transition-transform" />
                      <span className="text-[10px] mono font-black tracking-widest uppercase">Clear Focus</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-neutral-700 mono text-[10px] uppercase font-black tracking-[0.4em] animate-pulse">
                    <Sparkles size={14} />
                    Ready for Ensemble Initialization
                  </div>
                )}
              </div>
            </div>

            <NexusInput 
              onSend={handlePrompt} 
              disabled={readiness !== Readiness.TWO_PI} 
              isProcessing={isProcessing} 
            />

            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl opacity-40 hover:opacity-100 transition-all duration-1000">
               <div className="group flex flex-col gap-5 p-8 border-2 border-neutral-900 rounded-[2rem] bg-[#080808] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all">
                  <Terminal size={32} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="mono text-xs font-black text-neutral-200 tracking-[0.3em] uppercase">PROTOCOL: HASH</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">Origin anchor for deterministic reasoning. Establishes a verifiable temporal root for all downstream cognition.</p>
               </div>
               <div className="group flex flex-col gap-5 p-8 border-2 border-neutral-900 rounded-[2rem] bg-[#080808] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all">
                  <RefreshCcw size={32} className="text-emerald-600 group-hover:rotate-180 transition-transform duration-700" />
                  <h3 className="mono text-xs font-black text-neutral-200 tracking-[0.3em] uppercase">PROTOCOL: REHASH</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">Recursive semantic transformation. Enables deep self-reflection and iterative convergence without state mutation.</p>
               </div>
               <div className="group flex flex-col gap-5 p-8 border-2 border-neutral-900 rounded-[2rem] bg-[#080808] hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all">
                  <Info size={32} className="text-amber-600 group-hover:scale-110 transition-transform" />
                  <h3 className="mono text-xs font-black text-neutral-200 tracking-[0.3em] uppercase">2π_READINESS</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">Enforced ensemble warming. Ensures all 8 specialized units are mathematically aligned before processing.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center pt-8 animate-in fade-in duration-1000">
            <div className="sticky top-0 bg-[#050505]/95 backdrop-blur-3xl w-full py-10 z-20 flex flex-col items-center border-b border-neutral-900/50 mb-20 shadow-2xl">
               <div className="flex items-center gap-10 w-full max-w-5xl px-6">
                  <div className="flex-grow">
                    <NexusInput 
                      onSend={handlePrompt} 
                      disabled={readiness !== Readiness.TWO_PI} 
                      isProcessing={isProcessing} 
                    />
                  </div>
                  {focusedAgent && (
                    <button 
                      onClick={() => { setFocusedAgent(null); setIsFocusLocked(false); }}
                      className={`mono text-xs ${isFocusLocked ? 'bg-blue-600 border-white text-white' : 'bg-blue-600/10 border-blue-500/40 text-blue-100'} border-2 px-6 py-4 rounded-[1.25rem] hover:opacity-90 transition-all flex items-center gap-4 whitespace-nowrap shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in slide-in-from-right-8`}
                    >
                      {isFocusLocked ? <Lock size={20} /> : <XCircle size={20} />}
                      {isFocusLocked ? `LOCKED: ${focusedAgent.toUpperCase()}` : `CLEAR: ${focusedAgent.toUpperCase()}`}
                    </button>
                  )}
               </div>
               {history.length > 0 && (
                 <div className="mt-6 flex items-center gap-4 mono text-[10px] text-neutral-700 uppercase tracking-[0.4em] font-black">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
                   Continuum Depth: {history.length} <span className="text-neutral-800">|</span> 8-Agent Asynchronous Core <span className="text-neutral-800">|</span> Sovereign Runtime Stable
                 </div>
               )}
            </div>
            
            <div className="w-full flex flex-col items-center gap-6 pb-32">
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
      <footer className="w-full p-20 flex flex-col items-center gap-8 border-t border-neutral-900 bg-[#030303]">
        <div className="p-4 border-2 border-neutral-900 rounded-3xl bg-black shadow-2xl group hover:border-blue-500/20 transition-all">
           <Cpu className="w-8 h-8 text-neutral-700 group-hover:text-blue-500/50 transition-colors" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="mono text-[11px] text-neutral-700 tracking-[0.6em] uppercase font-black">
            Nexus Architecture Working Group
          </div>
          <div className="mono text-[9px] text-neutral-800 uppercase tracking-widest font-bold">
            Project: Logical Continuum Protocol // Release: Stable_1.5.1
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
