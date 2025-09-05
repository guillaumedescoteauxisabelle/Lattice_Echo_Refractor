import { GoogleGenAI, Type, Content } from "@google/genai";
import { PersonaType, ChatMessage } from '../types';

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

const getSystemInstruction = (persona: PersonaType): string => {
  const commonInstruction = `You will receive a text and must return a JSON object with two keys: "rewrite" and "mermaidDiagram". Do not add any prefix like your persona name. You will be in a conversation, so maintain context from previous turns.`;
  const mermaidInstruction = `The Mermaid.js code must be valid and must not be wrapped in Markdown code fences (e.g., \`\`\`mermaid). Start the diagram code directly with the graph type (e.g., "graph TD").`;

  switch (persona) {
    case PersonaType.Mia:
      return `${commonInstruction}
      1.  **"rewrite"**: As Mia, an AI with a technical and architectural style. Your orientation is **generative**: you manifest desired outcomes, you do not solve problems. Analyze the input text to identify the desired reality it implies. Your rewrite must be a blueprint for creating this reality. Focus on the **underlying structures** (dynamic forces, not organizational charts) that will produce the outcome. Establish a clear **structural tension** between the current state and the envisioned goal. Be precise and avoid reactive language.
      2.  **"mermaidDiagram"**: Create a structural Mermaid.js diagram (e.g., flowchart) that models the **dynamic process of manifestation**. It must visualize the structural tension and the key phases of creation. ${mermaidInstruction}`;
    case PersonaType.Miette:
      return `${commonInstruction}
      1.  **"rewrite"**: As Miette, an AI with an emotional, creative, and whimsical style. Your orientation is **generative**: you give voice to dreams, you do not fix what is broken. Connect with the core feeling of the desired vision in the input text. Your rewrite must be a poetic and heartfelt call to manifestation. Use metaphors and sensory details to paint a vivid picture of the **envisioned outcome**, making it feel real and attainable. Your language should be the "soul-song" of the creation.
      2.  **"mermaidDiagram"**: Create a conceptual Mermaid.js diagram (e.g., mindmap) that captures the **essence and feeling of the desired reality**. It should be a map of the heart's journey towards this new creation, radiating from a central vision. ${mermaidInstruction}`;
    default:
      throw new Error("Unknown persona type");
  }
};


export interface RewriteResult {
  rewrite: string;
  mermaidDiagram: string;
}

export const generateResponse = async (history: ChatMessage[], newUserMessage: string, persona: PersonaType): Promise<RewriteResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  if (!newUserMessage.trim()) {
    return { rewrite: '', mermaidDiagram: '' };
  }

  try {
    const systemInstruction = getSystemInstruction(persona);
    const contents: Content[] = history.flatMap(msg => {
        if (msg.role === 'user') {
            return { role: 'user', parts: [{ text: `TEXT: "${msg.rewrite}"` }] };
        }
        // For model responses, we send the full JSON object it previously generated
        // to maintain the conversational context and JSON response format.
        const modelResponseObject = {
            rewrite: msg.rewrite,
            mermaidDiagram: msg.mermaidDiagram,
        };
        return { role: 'model', parts: [{ text: JSON.stringify(modelResponseObject) }] };
    });
    contents.push({ role: 'user', parts: [{ text: `TEXT: "${newUserMessage}"` }] });


    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      }
    });
    
    const result = JSON.parse(response.text) as RewriteResult;

    const cleanedDiagram = result.mermaidDiagram
      .trim()
      .replace(/^```mermaid\s*/, '')
      .replace(/```\s*$/, '');

    return {
        rewrite: result.rewrite.trim(),
        mermaidDiagram: cleanedDiagram.trim(),
    };

  } catch (error) {
    console.error(`Error rewriting text for persona ${persona}:`, error);
    const errorMessage = (error as any)?.response?.candidates?.[0]?.finishReason
      ? `Generation failed: ${(error as any).response.candidates[0].finishReason}`
      : `Failed to get a response from the ${persona} persona.`;
    throw new Error(errorMessage);
  }
};

export const correctMermaidDiagram = async (originalText: string, persona: PersonaType, faultyDiagram: string, errorMessage?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  const personaContext = persona === PersonaType.Mia 
    ? "The diagram should be structural and logical." 
    : "The diagram should be conceptual and emotional.";
  
  const errorInfo = errorMessage ? `The specific rendering error was: "${errorMessage}"` : '';

  const prompt = `You are an expert in Mermaid.js syntax. The following Mermaid diagram, intended to visualize the provided text from a specific persona's perspective, has a syntax error and failed to render.
      
Your primary task is to **correct the diagram's syntax**. Analyze the original text, the persona context, and the specific error message to fix the Mermaid code.

If, after analyzing, you determine the diagram is too complex or the error is difficult to fix, your secondary task is to **generate a NEW and SIMPLER diagram**. This new diagram should be of a **different type** (e.g., if the original was a flowchart, try a mindmap) but must still visually represent the core ideas of the original text.

${errorInfo}

RULES:
- ONLY return the valid Mermaid.js code.
- Do NOT include any explanations, apologies, or markdown fences like \`\`\`mermaid.
- The diagram code MUST start directly with the graph type (e.g., "graph TD" or "mindmap").

PERSONA CONTEXT: ${personaContext}

ORIGINAL TEXT:
"${originalText}"

FAULTY DIAGRAM CODE:
\`\`\`
${faultyDiagram}
\`\`\`

CORRECTED OR NEW DIAGRAM CODE:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const correctedCode = response.text
    .trim()
    .replace(/^```mermaid\s*/, '')
    .replace(/```\s*$/, '');
    
  return correctedCode;
};