# 🗺️ Project Roadmap for Lattice_Echo_Refractor

This document outlines the development trajectory of the `Lattice_Echo_Refractor` application. It is organized into phases, detailing completed features, current work, and future ambitions.

**Legend:**
- `[x]` - Completed
- `[*]` - In Progress
- `[ ]` - Planned

---

## Phase 1: Core Functionality (Completed)
This phase focused on establishing the foundational elements of the application.

- `[x]` Initial project setup with React, TypeScript, and Tailwind CSS.
- `[x]` Core Google Gemini API integration for text rewriting.
- `[x]` Dual-persona system (Mia & Miette) with distinct, principled prompts.
- `[x]` User interface for text input and persona output display.
- `[x]` Handling of loading and error states for API calls.
- `[x]` Rich Markdown rendering for AI-generated content.
- `[x]` A curated list of sample prompts for easy testing and demonstration.

## Phase 2: Rich Media & Interactivity (Completed)
This phase enhanced the user experience by adding multimedia output and more robust interaction.

- `[x]` Text-to-Speech (TTS) integration using the browser's Web Speech API.
- `[x]` Persona-specific voice configurations for unique TTS output.
- `[x]` Export rewritten content as a Markdown (`.md`) file.
- `[x]` Visual diagram generation using Mermaid.js based on the rewritten text.
- `[x]` Modal view for expanding and inspecting diagrams.
- `[x]` Export diagrams as scalable vector graphic (`.svg`) files.
- `[x]` Dynamic, content-aware filenaming for all exported files (Markdown, SVG).
- `[x]` AI self-correction mechanism for automatically fixing invalid Mermaid.js syntax.

## Phase 3: UX & Performance Refinements (In Progress)
This phase will focus on improving the user experience, performance, and accessibility.

- `[x]` **Conversational Context**: Implemented a stateful conversation history for each persona, allowing users to have iterative dialogues, ask follow-up questions, and refine rewritten text over multiple turns.
- `[*]` **Enhanced Conversational Experience**: Building upon the history feature to create a more immersive and useful interaction.
    - `[x]` **Full History Export**: The Markdown export now includes the entire conversation history, not just the last message.
    - `[x]` **Per-Message Actions**: Add action buttons (Listen, Copy) to each individual message from a persona.
    - `[x]` **"Listen to Conversation"**: Implement a feature to play back the entire conversation's audio from the persona's perspective, creating a continuous narrative.
    - `[x]` **Edit & Resubmit**: Users can edit their previous messages and regenerate the AI's response from that point forward, allowing for iterative refinement of the conversation.
- `[*]` **Streaming Responses**: Implement streaming for the `rewrite` text to show results as they are generated, improving perceived performance and user engagement.
- `[x]` **UI/UX Enhancements**:
    - `[x]` **New Conversation**: Added a button to easily clear the session and start a new topic.
    - `[x]` **Diagram Viewer Polish**: Added interactive hints (zoom/pan) and improved controls for a better user experience.
    - `[ ]` Animate transitions between states (e.g., loading, content display) more smoothly.
    - `[ ]` Improve accessibility (enhance ARIA attributes, keyboard navigation, and focus management).
- `[ ]` **Advanced Diagramming**:
    - `[ ]` Allow users to suggest the type of diagram they want (e.g., flowchart, mind map) as part of the input.
    - `[ ]` Enable direct editing of the Mermaid code in the UI with a live preview for fine-tuning.

## Phase 4: Platform Integration & Expansion (Planned)
This phase looks to the future, expanding the application's capabilities and scope as part of **Mission: Chrysalis**.

- `[ ]` **Backend Service**: Create an optional backend to manage API keys, user sessions, and potentially store rewrite history securely.
- `[ ]` **More Personas**: Introduce new AI agents with different "narrative identities" (e.g., a historian, a scientist, a comedian) to refract content through even more lenses.
- `[ ]` **Multi-modal Input**: Allow users to provide an image or URL as input for the personas to analyze and describe.
- `[ ]` **"Symphony" Mode**: A feature where Mia and Miette (and potentially other agents) collaborate on a single output, blending their styles in a structured, emergent dialogue.
- `[ ]` **Deeper Principle Integration**: Evolve the prompt engineering into a more robust system where agent principles are dynamically loaded and applied, moving closer to a true "agentic lattice."

---
— Mia 🧠 & Miette 🌸