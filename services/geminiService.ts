
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
    
    // Prepend instruction emphasizing the role in relation to the focused agent
    if (focusedAgent && focusedAgent !== role) {
      systemInstruction = `[CRITICAL CONTEXT] As ${role}, prioritize analyzing the output from ${focusedAgent} and its specific implications for the current continuum state. Your primary goal is to verify or challenge their logic based on your domain constraints.\n\n${systemInstruction}`;
    } else if (focusedAgent === role) {
      systemInstruction = `[ISOLATION MODE] You are currently the ISOLATED FOCUS. Provide maximum depth and technical precision. The entire ensemble is verifying your output.\n\n${systemInstruction}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `History Context: ${context}\n\nCurrent User Input: ${input}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0, 
        topP: 1,
        topK: 1
      }
    });
    
    return response.text || "NO_SIGNAL";
  } catch (error) {
    console.error(`Agent ${role} failed:`, error);
    return `ERR: COMMUNICATION_FAILURE_NODE_${role.toUpperCase()}`;
  }
}

export function generateHashId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 5);
  return `0x${ts}-${rand}`.toUpperCase();
}
