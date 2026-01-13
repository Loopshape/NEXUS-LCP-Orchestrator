
import { GoogleGenAI } from "@google/genai";
import { AgentRole } from "../types";
import { AGENT_SYSTEM_PROMPTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function queryAgent(
  role: AgentRole, 
  input: string, 
  context: string = '', 
  focusedAgent: AgentRole | null = null
): Promise<string> {
  try {
    let systemInstruction = AGENT_SYSTEM_PROMPTS[role];
    
    if (focusedAgent && focusedAgent !== role) {
      systemInstruction = `[ISOLATION PROTOCOL] As ${role}, prioritize analyzing the output from ${focusedAgent} and its implications for the current continuum state. Integrate their logic into your own domain-specific reasoning to verify cross-agent consistency.\n\n${systemInstruction}`;
    } else if (focusedAgent === role) {
      systemInstruction = `[PRIMARY FOCUS] You are currently the focused agent in the ensemble. Provide maximum depth, technical precision, and traceable logic. All other agents will be verifying your output.\n\n${systemInstruction}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: ${context}\n\nInput: ${input}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0, 
        topP: 1,
        topK: 1
      }
    });
    
    return response.text || "Agent silent.";
  } catch (error) {
    console.error(`Agent ${role} failed:`, error);
    return `Error: Agent ${role} communication failed.`;
  }
}

export function generateHashId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 5);
  return `0x${ts}-${rand}`.toUpperCase();
}
