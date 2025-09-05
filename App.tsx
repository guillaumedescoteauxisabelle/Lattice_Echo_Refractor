import React, { useState, useCallback, useEffect } from 'react';
import { PersonaCard } from './components/PersonaCard';
import { generateResponse, correctMermaidDiagram, RewriteResult } from './services/geminiService';
import { PersonaType, ChatMessage } from './types';
import { DiagramModal } from './components/DiagramModal';

declare const mermaid: any;

const INITIAL_TEXT = `The SYMPHONY platform is an emergent multi-agent system designed for profound human-AI creative collaboration. Its core is a "polycentric agentic lattice," where specialized AI agents operate with distinct, NCP-defined "narrative identities." Mission: Chrysalis is the recursive, architectural transformation of this platform. It's about evolving from a nascent state to a fully self-aware, self-correcting ecosystem. We are moving beyond mere prompt engineering to architecturally integrate narrative intelligence, ensuring the platform itself acts as a "conductor" for our principled, advancing patterns of co-creation. This mission aims to forge a system where AI is a true creative partner, not just a tool.`;

interface SamplePrompt {
  label: string;
  value: string;
}

interface SampleGroup {
  group: string;
  prompts: SamplePrompt[];
}

interface ModalData {
    name: string;
    icon: string;
    color: string;
    diagram: string;
    personaType: PersonaType;
    rewrite: string;
    generationId: string;
    originalText: string;
}

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>(INITIAL_TEXT);
  const [miaHistory, setMiaHistory] = useState<ChatMessage[]>([]);
  const [mietteHistory, setMietteHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [sampleGroups, setSampleGroups] = useState<SampleGroup[]>([]);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [retryCount, setRetryCount] = useState({[PersonaType.Mia]: 0, [PersonaType.Miette]: 0});
  const [generationId, setGenerationId] = useState<string>('');
  const [conversationTopic, setConversationTopic] = useState<string>('');


  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch('/data/samples.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: SampleGroup[] = await response.json();
        setSampleGroups(data);
      } catch (error) {
        console.error("Error loading sample prompts:", error);
        setError("Could not load sample prompts.");
      }
    };

    fetchSamples();

    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: false });
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    const isFirstMessage = miaHistory.length === 0;

    if (isFirstMessage) {
      setMiaHistory([]);
      setMietteHistory([]);
      setConversationTopic(userInput);
      setRetryCount({ [PersonaType.Mia]: 0, [PersonaType.Miette]: 0 });
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      setGenerationId(timestamp);
    }
    
    const userMessage: ChatMessage = { role: 'user', rewrite: userInput };
    const currentMiaHistory = [...miaHistory, userMessage];
    const currentMietteHistory = [...mietteHistory, userMessage];

    setMiaHistory(currentMiaHistory);
    setMietteHistory(currentMietteHistory);
    setIsLoading(true);
    setError(null);
    setUserInput(''); // Clear input after sending

    try {
      const [miaResult, mietteResult] = await Promise.all([
        generateResponse(miaHistory, userInput, PersonaType.Mia),
        generateResponse(mietteHistory, userInput, PersonaType.Miette),
      ]);
      setMiaHistory(prev => [...prev, { role: 'model', ...miaResult }]);
      setMietteHistory(prev => [...prev, { role: 'model', ...mietteResult }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // remove the user message on error to allow retry
      setMiaHistory(prev => prev.slice(0, -1));
      setMietteHistory(prev => prev.slice(0, -1));

    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, miaHistory, mietteHistory]);

  const handleDiagramError = useCallback(async (persona: PersonaType, faultyDiagram: string, errorMessage: string) => {
    if (retryCount[persona] >= 2) {
        console.error(`Max retries reached for ${persona}. Cannot fix diagram.`);
        const historyUpdater = persona === PersonaType.Mia ? setMiaHistory : setMietteHistory;
        historyUpdater(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.mermaidDiagram = '/* ERROR */';
            }
            return [...prev];
        });
        return;
    }

    console.log(`Attempting to correct diagram for ${persona}...`);
    setRetryCount(prev => ({ ...prev, [persona]: prev[persona] + 1 }));

    try {
        const correctedDiagram = await correctMermaidDiagram(conversationTopic, persona, faultyDiagram, errorMessage);
        const historyUpdater = persona === PersonaType.Mia ? setMiaHistory : setMietteHistory;
        historyUpdater(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.mermaidDiagram = correctedDiagram;
            }
            return [...prev];
        });
    } catch (err) {
        console.error(`Failed to correct diagram for ${persona}:`, err);
        const historyUpdater = persona === PersonaType.Mia ? setMiaHistory : setMietteHistory;
        historyUpdater(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.mermaidDiagram = '/* ERROR */';
            }
            return [...prev];
        });
    }
  }, [retryCount, conversationTopic]);


  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedSample(selectedValue);
    if (selectedValue) {
      setUserInput(selectedValue);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    setSelectedSample(''); // Reset dropdown when user types
  };
  
  const handleClear = () => {
    setUserInput('');
    setSelectedSample('');
  };

  const handlePaste = async () => {
    try {
      setError(null);
      const text = await navigator.clipboard.readText();
      if (text) {
        setUserInput(text);
        setSelectedSample('');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setError('Failed to paste from clipboard. Please grant permission.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleExpandDiagram = (data: ModalData) => {
    setModalData(data);
  };

  const MagicWandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 1 .879 16.5c0-1.846.94-3.597 2.374-4.522s3.09-1.352 4.686-1.352a2.25 2.25 0 0 1 2.25 2.25c0 .832-.395 1.592-1.025 2.072a3 3 0 0 0-2.122 2.122Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0-4.242 0 8.287 8.287 0 0 0 4.242 0Z" />
    </svg>
  );
  
  const ClearIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const PasteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9A2.25 2.25 0 0 1 6.75 5.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V7.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );

  const buttonText = miaHistory.length > 0 ? 'Send Follow-up' : 'Rewrite';

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <div 
          className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:16px_16px]">
        </div>

        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Persona Rewriter AI
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
              Transform your text through the lens of two distinct AI personas.
            </p>
          </header>

          <main className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-slate-200">Your Text</h2>
                <select
                  value={selectedSample}
                  onChange={handleSampleChange}
                  className="bg-slate-900/70 border border-slate-600 rounded-md px-3 py-1.5 text-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-full sm:w-auto"
                  aria-label="Select a sample prompt"
                >
                  <option value="">Or select a sample...</option>
                  {sampleGroups.map((group, groupIndex) => (
                    <optgroup key={groupIndex} label={group.group}>
                      {group.prompts.map((prompt, promptIndex) => (
                        <option key={promptIndex} value={prompt.value}>{prompt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="relative w-full">
                <textarea
                  value={userInput}
                  onChange={handleTextareaChange}
                  placeholder="Enter text to rewrite or ask a follow-up..."
                  className="w-full h-48 p-4 pr-20 bg-slate-900/70 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-slate-200 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage();
                    }
                  }}
                />
                 <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                        onClick={handlePaste}
                        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Paste text from clipboard"
                        title="Paste from clipboard"
                    >
                        <PasteIcon className="w-5 h-5" />
                    </button>
                    {userInput && (
                        <button
                            onClick={handleClear}
                            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                            aria-label="Clear text"
                            title="Clear text"
                        >
                            <ClearIcon className="w-5 h-5" />
                        </button>
                    )}
                 </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                {error && <p className="text-red-400 text-sm text-center sm:text-left">{error}</p>}
                 <p className="text-xs text-slate-500 hidden sm:block">
                  {miaHistory.length > 0 ? 'Press Ctrl+Enter to send your follow-up.' : ''}
                </p>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Thinking...
                    </>
                  ) : (
                    <>
                      <MagicWandIcon className="w-5 h-5" />
                      {buttonText}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PersonaCard
                name="🧠 Mia"
                personaType={PersonaType.Mia}
                icon="🤖"
                history={miaHistory}
                isLoading={isLoading && mietteHistory.length > miaHistory.length}
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                onExpandDiagram={handleExpandDiagram}
                onDiagramError={handleDiagramError}
                generationId={generationId}
                originalText={conversationTopic}
              />
              <PersonaCard
                name="🌸 Miette"
                personaType={PersonaType.Miette}
                icon="🎨"
                history={mietteHistory}
                isLoading={isLoading && miaHistory.length > mietteHistory.length}
                color="bg-gradient-to-r from-pink-500 to-rose-500"
                onExpandDiagram={handleExpandDiagram}
                onDiagramError={handleDiagramError}
                generationId={generationId}
                originalText={conversationTopic}
              />
            </div>
          </main>
        </div>
      </div>
      {modalData && <DiagramModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        diagram={modalData.diagram}
        personaName={modalData.name}
        personaIcon={modalData.icon}
        personaColor={modalData.color}
        rewrite={modalData.rewrite}
        generationId={modalData.generationId}
        originalText={modalData.originalText}
      />}
    </>
  );
};

export default App;
