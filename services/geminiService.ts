
import { GoogleGenAI } from "@google/genai";
import { AgentRole } from "../types";
import { AGENT_SYSTEM_PROMPTS } from "../constants";

// Fix: Strictly follow SDK initialization using a named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function queryAgent(role: AgentRole, input: string, context: string = ''): Promise<string> {
  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning tasks and direct generateContent call
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: ${context}\n\nInput: ${input}`,
      config: {
        systemInstruction: AGENT_SYSTEM_PROMPTS[role],
        // Fix: Setting thinkingBudget within thinkingConfig as per Gemini 3 guidelines
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0, // Enforce deterministic feel as much as possible
        topP: 1,
        topK: 1
      }
    });
    
    // Fix: Accessing .text as a property, not a method, as per guidelines
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
