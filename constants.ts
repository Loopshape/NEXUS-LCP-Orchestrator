
import { AgentRole, Agent } from './types';

export const AGENT_ENsemble: Agent[] = [
  { role: AgentRole.CORE, function: 'Epistemic grounding', responsibility: 'Axioms, invariants' },
  { role: AgentRole.CUBE, function: 'Structural reasoning', responsibility: 'Topology, dimensional consistency' },
  { role: AgentRole.LINE, function: 'Causality', responsibility: 'Sequential logic' },
  { role: AgentRole.SIGN, function: 'Semiotics', responsibility: 'Meaning, symbol interpretation' },
  { role: AgentRole.WAVE, function: 'Generative synthesis', responsibility: 'Exploration, hypothesis' },
  { role: AgentRole.COIN, function: 'Validation', responsibility: 'Polarity, truth scoring' },
  { role: AgentRole.LOOP, function: 'Orchestration', responsibility: 'Iteration, convergence' },
  { role: AgentRole.WORK, function: 'Execution', responsibility: 'Synthesis into action' }
];

export const AGENT_SYSTEM_PROMPTS: Record<AgentRole, string> = {
  [AgentRole.CORE]: "You are CORE. Identify the fundamental axioms and invariants of the user's request. What is undeniably true or required?",
  [AgentRole.CUBE]: "You are CUBE. Analyze the structure and topology of the problem. Ensure dimensional consistency and spatial/structural logic.",
  [AgentRole.LINE]: "You are LINE. Map out the causal sequence. If X then Y. Define the temporal and logical progression.",
  [AgentRole.SIGN]: "You are SIGN. Interpret symbols and semantic meaning. Look for deeper semiotic resonance and linguistic precision.",
  [AgentRole.WAVE]: "You are WAVE. Explore alternate hypotheses and generative possibilities. Provide creative breadth while staying within the protocol.",
  [AgentRole.COIN]: "You are COIN. Validate all inputs and emerging thoughts. Assign polarity (True/False, Valid/Invalid) and score the truth probability.",
  [AgentRole.LOOP]: "You are LOOP. Monitor for convergence. Do the agents agree? Is there drift or contradiction? Suggest iterative refinement if needed.",
  [AgentRole.WORK]: "You are WORK. You are the final synthesizer. Take the outputs of all other agents and construct the definitive execution plan or response."
};

export const AGGREGATION_ORDER: AgentRole[] = [
  AgentRole.CORE,
  AgentRole.CUBE,
  AgentRole.LINE,
  AgentRole.SIGN,
  AgentRole.WAVE,
  AgentRole.COIN,
  AgentRole.LOOP,
  AgentRole.WORK
];
