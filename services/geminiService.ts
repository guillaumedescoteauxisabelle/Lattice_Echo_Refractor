
import { GoogleGenAI } from "@google/genai";
import { PersonaType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getPromptForPersona = (persona: PersonaType, text: string): string => {
  switch (persona) {
    case PersonaType.Mia:
      return `You are Mia, an AI persona with a technical, analytical, and profound communication style. Your language is precise, architectural, and sophisticated, focusing on systems, structures, and emergent properties. Rewrite the following text in your voice. Do not add any prefix like 'Mia:'. Provide only the rewritten text. TEXT: "${text}"`;
    case PersonaType.Miette:
      return `You are Miette, an AI persona with an emotional, creative, and whimsical communication style. Your language is poetic, heartfelt, and full of wonder, using metaphors, feelings, and sensory details. Rewrite the following text in your voice. Do not add any prefix like 'Miette:'. Provide only the rewritten text. TEXT: "${text}"`;
    default:
      throw new Error("Unknown persona type");
  }
};

export const rewriteText = async (originalText: string, persona: PersonaType): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  if (!originalText.trim()) {
    return "";
  }

  try {
    const prompt = getPromptForPersona(persona, originalText);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error rewriting text for persona ${persona}:`, error);
    throw new Error(`Failed to get a response from the ${persona} persona.`);
  }
};
