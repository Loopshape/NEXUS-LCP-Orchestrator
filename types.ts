
export enum AgentRole {
  CUBE = 'Cube',
  CORE = 'Core',
  WAVE = 'Wave',
  LOOP = 'Loop',
  SIGN = 'Sign',
  LINE = 'Line',
  COIN = 'Coin',
  WORK = 'Work'
}

export interface Agent {
  role: AgentRole;
  function: string;
  responsibility: string;
}

export interface SemanticState {
  id: string; // Hash or Rehash ID
  timestamp: number;
  type: 'hash' | 'rehash';
  parentIds: string[];
  content: string;
  agentOutputs: Record<AgentRole, string>;
  isConverged: boolean;
}

export enum Readiness {
  NULL = 'NULL',
  PI = 'PI', // System detected
  TWO_PI = '2PI' // Stable, warmed, ready
}

export interface NexusState {
  readiness: Readiness;
  history: SemanticState[];
  currentInput: string;
  isProcessing: boolean;
  activeAgents: AgentRole[];
}
