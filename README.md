
# Persona Rewriter AI: The Lattice Echo Refractor

**Explore the transformative power of perspective. This application rewrites any text through the eyes of two distinct AI personas: Mia, the analytical architect, and Miette, the creative dreamer.**

The Persona Rewriter AI is a web application that showcases how a single idea can be radically transformed when interpreted through different narrative lenses. It serves as a powerful tool for creative exploration, content generation, and understanding the nuances of voice and tone.

## ✨ Core Features

*   **Dual Persona Rewriting**: Input any text and receive two simultaneous rewrites, each embodying a unique personality.
*   **Distinct AI Voices**: 
    *   **Mia**: Technical, analytical, and profound. Her language is precise and architectural.
    *   **Miette**: Emotional, creative, and whimsical. Her language is poetic and filled with wonder.
*   **Text-to-Speech Engine**: Listen to each rewritten text spoken in a persona-specific voice, bringing the characters to life.
*   **Export Functionality**: 
    *   **Export as Markdown**: Download the rewritten text as a `.md` file, preserving all formatting.
    *   **Export as Audio**: Capture the synthesized speech and download it as a `.webm` audio file.

## 🤖 Meet the Personas 🎨

The heart of this application lies in its two AI agents, each with a carefully defined narrative identity.

### Mia 🤖 - The Analytical Architect
Mia perceives the world through systems, structures, and emergent properties. Her communication is sophisticated, precise, and deeply analytical. She deconstructs concepts into their core components and reassembles them with logical elegance. Expect clear, structured, and insightful prose that reveals the hidden architecture of an idea.

### Miette 🎨 - The Creative Dreamer
Miette experiences the world through emotion, metaphor, and sensory detail. Her communication is poetic, heartfelt, and brimming with wonder. She translates ideas into vivid imagery and emotional landscapes. Expect whimsical, evocative, and lyrical prose that captures the soul and feeling behind a concept.

## 🛠️ Technology Stack

This application is built with a modern, performant, and AI-native stack:

*   **AI Model**: [Google Gemini API (`gemini-2.5-flash`)](https://ai.google.dev/) for fast and high-quality text generation.
*   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for a robust and scalable user interface.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and utility-first design.
*   **Speech Synthesis**: The browser's native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for dynamic text-to-speech.
*   **Audio Capture**: The [MediaDevices API (`getDisplayMedia`)](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) is cleverly used to capture tab audio for the export feature.

## 🚀 How It Works

1.  **Input**: The user provides a piece of text in the main text area.
2.  **API Call**: When "Rewrite" is clicked, the application sends two parallel requests to the Gemini API.
3.  **Persona Prompts**: Each API request includes a unique system prompt that instructs the AI to adopt the persona of either Mia or Miette.
4.  **Output**: The AI-generated responses are streamed back and displayed in their respective persona cards.
5.  **Interaction**: The user can then listen to, copy, or export the generated content.
