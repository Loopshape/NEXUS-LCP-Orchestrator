
import React, { useState, useEffect, useCallback } from 'react';
import { Readiness, SemanticState, AgentRole } from './types';
import { ReadinessIndicator } from './components/ReadinessIndicator';
import { NexusInput } from './components/NexusInput';
import { AgentVisualizer } from './components/AgentVisualizer';
import { SemanticOutput } from './components/SemanticOutput';
import { AgentModal } from './components/AgentModal';
import { AGGREGATION_ORDER } from './constants';
import { queryAgent, generateHashId } from './services/geminiService';
// Added Share2 to the imports from lucide-react
import { Terminal, Cpu, Info, RefreshCcw, Focus, XCircle, History, Sparkles, Lock, Settings, BarChart3, Activity, Share2 } from 'lucide-react';

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
      console.error("LCP Runtime Error:", error);
    } finally {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  }, [readiness, isProcessing, history, focusedAgent]);

  const handleAgentClick = (role: AgentRole) => {
    if (!isFocusLocked) {
      setFocusedAgent(role === focusedAgent ? null : role);
    }
  };

  const handleAgentDblClick = (role: AgentRole) => {
    setFocusedAgent(role);
    setIsFocusLocked(true);
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

      {/* Left Panel: Stats & Controls */}
      <aside className="panel">
        <div className="p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 neon-blue glow-active" />
            <div className="flex flex-col">
              <h1 className="mono text-xs font-black neon-white tracking-widest uppercase">Nexus-LCP</h1>
              <span className="text-[8px] neon-blue font-bold tracking-[0.5em] uppercase">Sovereign_OS</span>
            </div>
          </div>
          <ReadinessIndicator readiness={readiness} />
        </div>

        <div className="p-6 flex-grow flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-neutral-600 uppercase mono text-[9px] font-black tracking-widest">
              <div className="flex items-center gap-2"><BarChart3 size={12} /> Live Metrics</div>
              <span className="neon-green">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] mono text-neutral-600">Continuum Depth</span>
                <span className="text-sm mono neon-white font-black">{history.length}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] mono text-neutral-600">Active Units</span>
                <span className="text-sm mono neon-green font-black">{activeAgents.length}/8</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-600 uppercase mono text-[9px] font-black tracking-widest">
              <Activity size={12} /> System Status
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] mono">
                <span className="text-neutral-500">Latency</span>
                <span className="neon-green">4ms</span>
              </div>
              <div className="flex justify-between items-center text-[10px] mono">
                <span className="text-neutral-500">Stability</span>
                <span className="neon-blue">Stable</span>
              </div>
              <div className="flex justify-between items-center text-[10px] mono">
                <span className="text-neutral-500">Isolation</span>
                <span className={focusedAgent ? 'neon-yellow' : 'neon-green'}>{focusedAgent ? 'Active' : 'Nominal'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40">
          <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mono text-[9px] font-black text-neutral-700">
              <Settings size={12} /> Kernel_v1.5.2
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Panel: Trace Analytics & Workspace */}
      <main className="panel relative">
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#050510]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-sm font-black neon-white tracking-widest uppercase mono">Cognitive Trace Analytics</h2>
              <p className="text-[9px] text-neutral-600 uppercase mono tracking-[0.3em]">Runtime Lineage Log</p>
            </div>
            {focusedAgent && (
              <div className={`px-4 py-1.5 rounded-lg border-2 flex items-center gap-2 transition-all ${isFocusLocked ? 'bg-yellow-900/20 border-yellow-500 text-yellow-100' : 'bg-blue-900/20 border-blue-500 text-blue-100'}`}>
                {isFocusLocked ? <Lock size={12} className="neon-yellow" /> : <Focus size={12} className="neon-blue" />}
                <span className="mono text-[10px] font-black uppercase tracking-widest">
                  {isFocusLocked ? 'Focus Locked:' : 'Isolated:'} {focusedAgent}
                </span>
                <button onClick={() => {setFocusedAgent(null); setIsFocusLocked(false);}} className="ml-2 hover:text-white transition-colors">
                  <XCircle size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
             <span className="mono text-[9px] text-neutral-700 font-black">SOVEREIGN_RUN_STABLE</span>
             <Sparkles size={12} className="neon-blue" />
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8 flex flex-col items-center">
          {history.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center max-w-lg opacity-40">
              <Cpu size={48} className="text-neutral-700 mb-6" />
              <h3 className="text-2xl font-light text-white tracking-tighter mb-4">Initialize Continuum</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mono">Awaiting first prompt signal to establish hash anchor...</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-4">
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

        <footer className="p-8 border-t border-white/5 bg-[#050510]/80 backdrop-blur-xl z-20">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <NexusInput onSend={handlePrompt} disabled={readiness !== Readiness.TWO_PI} isProcessing={isProcessing} />
          </div>
        </footer>
      </main>

      {/* Right Panel: Network Topology */}
      <aside className="panel border-l border-white/5">
        <header className="p-6 border-b border-white/5 flex items-center gap-3">
          <Share2 className="w-4 h-4 neon-blue" />
          <h2 className="mono text-[10px] font-black neon-white uppercase tracking-widest">Network Topology</h2>
        </header>
        <div className="flex-grow p-4">
           <AgentVisualizer 
             history={history} 
             isProcessing={isProcessing} 
             activeAgents={activeAgents} 
             focusedAgent={focusedAgent}
             isFocusLocked={isFocusLocked}
             onAgentClick={handleAgentClick}
             onAgentDblClick={handleAgentDblClick}
             onBackgroundClick={handleBackgroundClick}
           />
        </div>
        <div className="p-6 bg-black/40 border-t border-white/5">
           <div className="flex items-center gap-3 mb-4">
              <History size={14} className="text-neutral-500" />
              <span className="mono text-[9px] font-black text-neutral-500 uppercase tracking-widest">Quick Anchors</span>
           </div>
           <div className="space-y-2">
             {history.slice(0, 5).map(h => (
               <div key={h.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                 <span className="mono text-[9px] text-neutral-500 group-hover:neon-white">{h.id}</span>
                 <span className="mono text-[8px] text-neutral-700">{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               </div>
             ))}
           </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
