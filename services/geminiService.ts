
import { GoogleGenAI } from "@google/genai";
import { AgentRole } from "../types";
import { AGENT_SYSTEM_PROMPTS } from "../constants";

// Strictly follow SDK initialization using a named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function queryAgent(
  role: AgentRole, 
  input: string, 
  context: string = '', 
  focusedAgent: AgentRole | null = null
): Promise<string> {
  try {
    let systemInstruction = AGENT_SYSTEM_PROMPTS[role];
    
    // Enhancement: Prepend specific instruction when a focus is active to prioritize cross-agent analysis
    if (focusedAgent && focusedAgent !== role) {
      systemInstruction = `[CRITICAL FOCUS] As ${role}, prioritize analyzing the output from ${focusedAgent} and its specific implications for the current continuum state. Ensure your reasoning aligns with or constructively challenges the ${focusedAgent} perspective.\n\n${systemInstruction}`;
    } else if (focusedAgent === role) {
      systemInstruction = `[ISOLATION MODE] You are currently the focused agent. Provide maximum depth and technical precision in your ${role} domain. The rest of the ensemble is monitoring your trace specifically.\n\n${systemInstruction}`;
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
