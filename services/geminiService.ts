
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
    
    // Prepend focus-aware instruction as per protocol requirements
    if (focusedAgent && focusedAgent !== role) {
      systemInstruction = `[CRITICAL_ANALYSIS_TASK] As ${role}, prioritize analyzing the output from ${focusedAgent} and its specific implications for the current continuum state. Your specialized domain reasoning should account for and strictly verify the logic presented by the focused node ${focusedAgent}.\n\n${systemInstruction}`;
    } else if (focusedAgent === role) {
      systemInstruction = `[PRIMARY_ISOLATION_FOCUS] You are currently the ISOLATED FOCUS node. Provide maximum depth, technical precision, and traceable logic. The entire ensemble is monitoring and verifying your specific output.\n\n${systemInstruction}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Runtime Context: ${context}\n\nSignal Input: ${input}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0, 
        topP: 1,
        topK: 1
      }
    });
    
    return response.text || "NO_SIGNAL_RECORDED";
  } catch (error) {
    console.error(`Agent ${role} failed:`, error);
    return `ERROR_CODE: LCP_SIGNAL_LOSS_${role.toUpperCase()}`;
  }
}

export function generateHashId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 5);
  return `0x${ts}-${rand}`.toUpperCase();
}
