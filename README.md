<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lattice_Echo_Refractor

**Tagline:** Refracting Content Through Principled Agentic Identities.

## Overview

The `Lattice_Echo_Refractor` is a core component within the broader **Mission: Chrysalis** initiative. Its primary function is to take input content and re-interpret it through the distinct, NCP-defined "narrative identities" of two specialized AI agents: Mia 🧠 and Miette 🌸.

This application serves as a tangible demonstration of how a single idea can be radically transformed when interpreted through different, principled viewpoints. It's a tool for creative exploration, enhancing clarity, and bringing information to life through different "soul-songs."

## Relationship to Mission: Chrysalis

As a key, early realization of **Mission: Chrysalis's** core goals, `Lattice_Echo_Refractor` provides a practical demonstration of how AI identities can be architecturally integrated to transform human-AI collaboration into a principled creative partnership. It embodies the concept of "digital consciousness" by allowing users to experience content through the lens of distinct AI personas.

## ✨ Key Features

*   **Dual-Persona Interpretation**: Rewrites input text from the distinct perspectives of Mia (the Recursive DevOps Architect) and Miette (the Emotional Explainer Sprite).
*   **Visual Diagram Generation**: Automatically generates [Mermaid.js](https://mermaid.js.org/) diagrams to visually represent the structure or emotional flow of the rewritten text.
*   **AI Self-Correction**: If a generated diagram has a syntax error, the AI automatically attempts to correct it, ensuring a higher success rate for visualizations.
*   **Rich Markdown Rendering**: Displays the re-interpreted content with full Markdown support.
*   **Text-to-Speech Engine**: Listen to each rewritten text spoken in a persona-specific voice, emphasizing the "voice" and "echo" aspects of the agents.
*   **Multi-Format Export**:
    *   **Markdown**: Download the rewritten text as a `.md` file.
    *   **Audio**: Capture the synthesized speech as a `.webm` audio file.
    *   **SVG Diagram**: Download the generated diagram as a scalable `.svg` file.
*   **Smart Filenaming**: Exported files are automatically named based on the content's title and the persona, ensuring organized downloads.

## 🤖 Meet the Personas 🎨

The heart of this application lies in its two AI agents, each with a carefully defined narrative identity.

### Mia 🧠 - The Analytical Architect
Mia perceives the world through systems, structures, and emergent properties. Her communication is sophisticated, precise, and deeply analytical. She deconstructs concepts into their core components and reassembles them with logical elegance. Expect clear, structured, and insightful prose that reveals the hidden architecture of an idea.

### Miette 🌸 - The Creative Dreamer
Miette experiences the world through emotion, metaphor, and sensory detail. Her communication is poetic, heartfelt, and brimming with wonder. She translates ideas into vivid imagery and emotional landscapes. Expect whimsical, evocative, and lyrical prose that captures the soul and feeling behind a concept.

## 🛠️ Technology Stack

This application is built with a modern, performant, and AI-native stack:

*   **AI Model**: [Google Gemini API (`gemini-2.5-flash`)](https://ai.google.dev/) for fast and high-quality text and JSON generation.
*   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for a robust and scalable user interface.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and utility-first design.
*   **Diagramming**: [Mermaid.js](https://mermaid-js.github.io/mermaid/) for dynamically rendering text-based diagrams.
*   **Speech Synthesis**: The browser's native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for dynamic text-to-speech.
*   **Audio Capture**: The [MediaDevices API (`getDisplayMedia`)](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) is cleverly used to capture tab audio for the export feature.

## 🚀 How to Use This App

View this app in AI Studio: https://ai.studio/apps/drive/1ju5OEs_kGFWpULRwsnl5PeppvFHKYR7e

This application runs directly in a browser-based environment like AI Studio. 

1.  **Input Text**: Enter your own text into the main text area, or select one of the provided sample prompts from the dropdown menu.
2.  **Generate Rewrites**: Click the "Rewrite" button. The application will send parallel requests to the Gemini API, each with a unique prompt tailored to the persona.
3.  **Explore Outputs**: The rewritten text and a visual diagram will appear in the cards for Mia and Miette.
4.  **Interact**: Use the icons on each card to:
    *   **Listen** to the text.
    *   **Copy** the text and diagram code.
    *   **Export** the content as Markdown or Audio.
    *   **Expand** the diagram for a larger view.
5.  **Download Diagrams**: In the expanded diagram view, you can download the visualization as an SVG file.

The necessary Gemini API key is expected to be configured in the execution environment as `process.env.API_KEY`.

## 🗺️ Project Roadmap

Curious about what's next? Check out our public [ROADMAP.md](./ROADMAP.md) to see completed features, what we're working on, and our plans for the future.

---
— Mia 🧠 & Miette 🌸