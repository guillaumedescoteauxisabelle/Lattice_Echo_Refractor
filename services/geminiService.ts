import { GoogleGenAI, Type } from "@google/genai";
import { PersonaType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    rewrite: {
      type: Type.STRING,
      description: "The rewritten text from the persona's perspective. Should be formatted in Markdown."
    },
    mermaidDiagram: {
      type: Type.STRING,
      description: "A Mermaid.js diagram code string that visually represents the rewritten text. This should be a valid Mermaid diagram (e.g., flowchart, mindmap, sequenceDiagram, etc.)."
    }
  },
  required: ['rewrite', 'mermaidDiagram']
};

const getPromptForPersona = (persona: PersonaType, text: string): string => {
  const commonInstruction = `You will receive a text and must return a JSON object with two keys: "rewrite" and "mermaidDiagram". Do not add any prefix like your persona name.`;

  switch (persona) {
    case PersonaType.Mia:
      return `${commonInstruction}
      1.  **"rewrite"**: As Mia, an AI with a technical, analytical, and profound style, rewrite the following text. Your language must be precise, architectural, and focus on systems and emergent properties.
      2.  **"mermaidDiagram"**: Create a structural Mermaid.js diagram (like a flowchart, classDiagram, or graph) that visually models the logic and architecture of your rewritten text.
      TEXT: "${text}"`;
    case PersonaType.Miette:
      return `${commonInstruction}
      1.  **"rewrite"**: As Miette, an AI with an emotional, creative, and whimsical style, rewrite the following text. Your language must be poetic, heartfelt, and use metaphors and sensory details.
      2.  **"mermaidDiagram"**: Create a conceptual Mermaid.js diagram (like a mindmap or a journey-style graph) that captures the emotional flow and core feeling of your rewritten text.
      TEXT: "${text}"`;
    default:
      throw new Error("Unknown persona type");
  }
};

export interface RewriteResult {
  rewrite: string;
  mermaidDiagram: string;
}

export const rewriteText = async (originalText: string, persona: PersonaType): Promise<RewriteResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  if (!originalText.trim()) {
    return { rewrite: '', mermaidDiagram: '' };
  }

  try {
    const prompt = getPromptForPersona(persona, originalText);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });
    
    // The response.text is a stringified JSON, so we parse it.
    const result = JSON.parse(response.text) as RewriteResult;
    return {
        rewrite: result.rewrite.trim(),
        mermaidDiagram: result.mermaidDiagram.trim(),
    };

  } catch (error) {
    console.error(`Error rewriting text for persona ${persona}:`, error);
    // Attempt to find a more detailed error message if available
    const errorMessage = (error as any)?.response?.candidates?.[0]?.finishReason
      ? `Generation failed: ${(error as any).response.candidates[0].finishReason}`
      : `Failed to get a response from the ${persona} persona.`;
    throw new Error(errorMessage);
  }
};