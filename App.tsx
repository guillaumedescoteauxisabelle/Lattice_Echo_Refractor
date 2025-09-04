import React, { useState, useCallback, useEffect } from 'react';
import { PersonaCard } from './components/PersonaCard';
import { rewriteText, correctMermaidDiagram, RewriteResult } from './services/geminiService';
import { PersonaType } from './types';
import { DiagramModal } from './components/DiagramModal';

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
}

const App: React.FC = () => {
  const [originalText, setOriginalText] = useState<string>(INITIAL_TEXT);
  const [miaData, setMiaData] = useState<RewriteResult | null>(null);
  const [mietteData, setMietteData] = useState<RewriteResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [sampleGroups, setSampleGroups] = useState<SampleGroup[]>([]);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [retryCount, setRetryCount] = useState({[PersonaType.Mia]: 0, [PersonaType.Miette]: 0});

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
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!originalText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setMiaData(null);
    setMietteData(null);
    setRetryCount({ [PersonaType.Mia]: 0, [PersonaType.Miette]: 0 });

    try {
      const [miaResult, mietteResult] = await Promise.all([
        rewriteText(originalText, PersonaType.Mia),
        rewriteText(originalText, PersonaType.Miette),
      ]);
      setMiaData(miaResult);
      setMietteData(mietteResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalText, isLoading]);

  const handleDiagramError = useCallback(async (persona: PersonaType, faultyDiagram: string) => {
    if (retryCount[persona] >= 1) {
        console.error(`Max retries reached for ${persona}. Cannot fix diagram.`);
        // Signal a permanent failure to the PersonaCard
        const finalData = persona === PersonaType.Mia ? miaData : mietteData;
        if (finalData) {
            const errorResult = { ...finalData, mermaidDiagram: '/* ERROR */' };
            if (persona === PersonaType.Mia) setMiaData(errorResult);
            else setMietteData(errorResult);
        }
        return;
    }

    console.log(`Attempting to correct diagram for ${persona}...`);

    setRetryCount(prev => ({ ...prev, [persona]: prev[persona] + 1 }));

    try {
        const correctedDiagram = await correctMermaidDiagram(originalText, persona, faultyDiagram);

        if (persona === PersonaType.Mia) {
            setMiaData(prev => prev ? { ...prev, mermaidDiagram: correctedDiagram } : null);
        } else {
            setMietteData(prev => prev ? { ...prev, mermaidDiagram: correctedDiagram } : null);
        }
    } catch (err) {
        console.error(`Failed to correct diagram for ${persona}:`, err);
         // Signal a permanent failure if correction API call fails
         const finalData = persona === PersonaType.Mia ? miaData : mietteData;
         if (finalData) {
             const errorResult = { ...finalData, mermaidDiagram: '/* ERROR */' };
             if (persona === PersonaType.Mia) setMiaData(errorResult);
             else setMietteData(errorResult);
         }
    }
  }, [retryCount, originalText, miaData, mietteData]);


  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedSample(selectedValue);
    if (selectedValue) {
      setOriginalText(selectedValue);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalText(e.target.value);
    setSelectedSample(''); // Reset dropdown when user types
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
              <textarea
                value={originalText}
                onChange={handleTextareaChange}
                placeholder="Enter text to rewrite..."
                className="w-full h-48 p-4 bg-slate-900/70 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-slate-200 resize-none"
              />
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                {error && <p className="text-red-400 text-sm text-center sm:text-left">{error}</p>}
                <button
                  onClick={handleRewrite}
                  disabled={isLoading || !originalText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <MagicWandIcon className="w-5 h-5" />
                      Rewrite
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PersonaCard
                name="Mia"
                personaType={PersonaType.Mia}
                icon="🤖"
                text={miaData?.rewrite ?? ''}
                mermaidDiagram={miaData?.mermaidDiagram}
                isLoading={isLoading}
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                onExpandDiagram={handleExpandDiagram}
                onDiagramError={handleDiagramError}
              />
              <PersonaCard
                name="Miette"
                personaType={PersonaType.Miette}
                icon="🎨"
                text={mietteData?.rewrite ?? ''}
                mermaidDiagram={mietteData?.mermaidDiagram}
                isLoading={isLoading}
                color="bg-gradient-to-r from-pink-500 to-rose-500"
                onExpandDiagram={handleExpandDiagram}
                onDiagramError={handleDiagramError}
              />
            </div>
          </main>
        </div>
      </div>
      <DiagramModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        diagram={modalData?.diagram || ''}
        personaName={modalData?.name || ''}
        personaIcon={modalData?.icon || ''}
        personaColor={modalData?.color || ''}
        rewrite={modalData?.rewrite || ''}
      />
    </>
  );
};

export default App;
