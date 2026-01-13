
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
import { Terminal, Cpu, Info, RefreshCcw, Focus, XCircle } from 'lucide-react';

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
                     !agentOutputs[AgentRole.LOOP].toLowerCase().includes('contradiction')
      };

      setHistory(prev => [newState, ...prev]);
    } catch (error) {
      console.error("LCP Runtime Error:", error);
    } finally {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  }, [readiness, isProcessing, history]);

  const handleAgentClick = (role: AgentRole) => {
    // If clicking an already focused agent, show modal. Otherwise focus.
    if (focusedAgent === role) {
      setSelectedAgentForModal(role);
    } else {
      setFocusedAgent(role);
    }
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
            />
            
            <div className="mt-8 mb-12 text-center">
              <h2 className="text-4xl font-light text-white tracking-tight mb-4">
                Orchestrate <span className="text-blue-500 font-medium">Deterministic</span> Intelligence
              </h2>
              <p className="max-w-xl text-neutral-500 text-sm leading-relaxed mx-auto">
                Implement multi-agent ensembles with semantic lineage tracking. 
                Move beyond stochastic output to verifiable cognitive convergence.
              </p>
              {focusedAgent && (
                <div className="mt-6 flex items-center justify-center gap-4 animate-in fade-in zoom-in-95">
                  <span className="mono text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full flex items-center gap-2">
                    <Focus size={10} />
                    FOCUS: {focusedAgent.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => setFocusedAgent(null)}
                    className="text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              )}
            </div>

            <NexusInput 
              onSend={handlePrompt} 
              disabled={readiness !== Readiness.TWO_PI} 
              isProcessing={isProcessing} 
            />

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl opacity-40 hover:opacity-100 transition-opacity">
               <div className="flex flex-col gap-2 p-4 border border-neutral-900 rounded-lg">
                  <Terminal size={18} className="text-blue-400" />
                  <h3 className="mono text-[10px] font-bold text-neutral-300">PROTOCOL: HASH</h3>
                  <p className="text-[11px] text-neutral-500">Creates a new truth anchor. Anchors the current reasoning path in a verifiable time-indexed origin.</p>
               </div>
               <div className="flex flex-col gap-2 p-4 border border-neutral-900 rounded-lg">
                  <RefreshCcw size={18} className="text-emerald-400" />
                  <h3 className="mono text-[10px] font-bold text-neutral-300">PROTOCOL: REHASH</h3>
                  <p className="text-[11px] text-neutral-500">Semantic transformation of existing lineage. Enables recursive self-reflection without data mutation.</p>
               </div>
               <div className="flex flex-col gap-2 p-4 border border-neutral-900 rounded-lg">
                  <Info size={18} className="text-amber-400" />
                  <h3 className="mono text-[10px] font-bold text-neutral-300">2π READINESS</h3>
                  <p className="text-[11px] text-neutral-500">System enforces full 8-agent warming before accepting cognitive loads to ensure deterministic safety.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center pt-8">
            <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl w-full py-6 z-20 flex flex-col items-center border-b border-neutral-900/50 mb-12">
               <div className="flex items-center gap-6 w-full max-w-3xl mb-4">
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
                      className="mono text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <XCircle size={12} />
                      UNFOCUS {focusedAgent}
                    </button>
                  )}
               </div>
            </div>
            
            <div className="w-full flex flex-col items-center gap-2">
              {history.map((state) => (
                <SemanticOutput 
                  key={state.id} 
                  state={state} 
                  focusedAgent={focusedAgent} 
                  onAgentNameClick={(role) => setSelectedAgentForModal(role)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full p-8 flex justify-center border-t border-neutral-900/30">
        <div className="mono text-[9px] text-neutral-700 tracking-[0.3em] uppercase">
          Nexus Architecture Working Group // 2024 (LCP-1.0)
        </div>
      </footer>
    </div>
  );
};

export default App;
