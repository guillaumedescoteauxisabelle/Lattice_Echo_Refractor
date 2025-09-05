import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PersonaType, ChatMessage } from '../types';
import { personaVoiceConfig } from '../config/ttsConfig';
import { stripMarkdown, createFilename } from '../utils/textUtils';

declare const mermaid: any;

// --- Mermaid Renderer Component ---
interface MermaidRendererProps {
    diagram: string;
    personaType: PersonaType;
    messageId: string;
    onDiagramError: (personaType: PersonaType, faultyDiagram: string, errorMessage: string) => void;
    onExpandDiagram: () => void;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ diagram, personaType, messageId, onDiagramError, onExpandDiagram }) => {
    const [svg, setSvg] = useState('');

    useEffect(() => {
        const render = async () => {
            if (diagram === '/* ERROR */') {
                setSvg(`<p class="text-red-400 text-center p-4">Error: Could not render diagram.</p>`);
                return;
            }
            if (diagram && typeof mermaid !== 'undefined') {
                try {
                    const themeConfig = {
                        theme: 'dark',
                        fontFamily: 'Inter, sans-serif',
                        themeVariables: {
                            background: '#0f172a',
                            primaryColor: '#1e293b',
                            primaryTextColor: '#f1f5f9',
                            lineColor: '#64748b',
                            textColor: '#cbd5e1',
                            nodeBorder: personaType === PersonaType.Mia ? '#38bdf8' : '#f472b6',
                        }
                    };
                    const diagramWithConfig = `%%{init: ${JSON.stringify(themeConfig)}}%%\n${diagram}`;
                    
                    const diagramId = `mermaid-${personaType}-${messageId}`;
                    const { svg } = await mermaid.render(diagramId, diagramWithConfig);
                    setSvg(svg);
                } catch (error) {
                    console.error(`Mermaid rendering failed for ${personaType}:`, error);
                    onDiagramError(personaType, diagram, (error as Error).message);
                }
            } else {
                setSvg('');
            }
        };
        render();
    }, [diagram, personaType, messageId, onDiagramError]);

    if (!diagram) return null;

    return (
        <div className="relative group mt-6">
            <div 
                className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex justify-center items-center overflow-x-auto" 
                dangerouslySetInnerHTML={{ __html: svg }} 
            />
            <button
                onClick={onExpandDiagram}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-slate-700 hover:text-white transition-all duration-200"
                aria-label="Expand diagram"
                title="Expand diagram"
                disabled={diagram === '/* ERROR */'}
            >
                <ArrowsPointingOutIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};
// --- End of Mermaid Renderer ---

interface PersonaCardProps {
  name: string;
  personaType: PersonaType;
  icon: string;
  history: ChatMessage[];
  isLoading: boolean;
  color: string;
  generationId: string;
  originalText: string;
  onExpandDiagram: (data: { name: string, icon: string, color: string, diagram: string, personaType: PersonaType, rewrite: string, generationId: string, originalText: string }) => void;
  onDiagramError: (personaType: PersonaType, faultyDiagram: string, errorMessage: string) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="self-start max-w-xl w-full">
        <div className="bg-slate-800 rounded-xl rounded-bl-none p-4 prose-content">
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);

// --- Icon Components ---
const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);
const SpeakerWaveIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);
const StopCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563C9.252 14.437 9 14.185 9 13.874V9.563Z" />
    </svg>
);
const ArrowDownTrayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const ArrowsPointingOutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m3.75 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15m3.75-11.25h4.5m-4.5 0v4.5m0-4.5L15 9" />
    </svg>
);
// --- End of Icons ---


// --- User Per-Message Action Component ---
interface UserMessageActionsProps {
  message: ChatMessage;
  voices: SpeechSynthesisVoice[];
  generationId: string;
  originalText: string;
  messageIndex: number;
}

const UserMessageActions: React.FC<UserMessageActionsProps> = ({ message, voices, generationId, originalText, messageIndex }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Cleanup function to stop speaking if the component unmounts
        return () => {
            if (utteranceRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.rewrite);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSpeak = () => {
        const synth = window.speechSynthesis;
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            utteranceRef.current = null;
            return;
        }

        if (voices.length > 0) {
            synth.cancel(); // Stop any other speech
            const cleanText = stripMarkdown(message.rewrite);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utteranceRef.current = utterance;
            
            // Use a default, neutral voice for the user's text
            utterance.voice = voices.find(voice => voice.name === 'Google US English') || voices.find(voice => voice.lang.startsWith('en')) || null;
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            utterance.onerror = (event) => {
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.error("Speech synthesis error:", event.error);
                }
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            synth.speak(utterance);
        }
    };
    
    const handleDownload = () => {
        const blob = new Blob([message.rewrite], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = createFilename("You", originalText, 'txt', generationId, messageIndex);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/30 p-1 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
            <button onClick={handleSpeak} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all" title={isSpeaking ? "Stop" : "Listen"}>
                {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-400" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleCopy} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all" title="Copy">
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleDownload} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all" title="Download Text">
                <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
        </div>
    );
};
// --- End of User Message Actions ---


// --- Per-Message Action Component ---
interface MessageActionsProps {
  message: ChatMessage;
  personaType: PersonaType;
  voices: SpeechSynthesisVoice[];
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, personaType, voices }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Cleanup function to stop speaking if the component unmounts
        return () => {
            if (utteranceRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = () => {
        let fullContent = message.rewrite;
        if (message.mermaidDiagram && message.mermaidDiagram !== '/* ERROR */') {
            fullContent += `\n\n## Visual Representation\n\n\`\`\`mermaid\n${message.mermaidDiagram}\n\`\`\`\n`;
        }
        navigator.clipboard.writeText(fullContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSpeak = () => {
        const synth = window.speechSynthesis;
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            utteranceRef.current = null;
            return;
        }

        if (voices.length > 0) {
            synth.cancel(); // Stop any other speech from playing
            const cleanText = stripMarkdown(message.rewrite);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utteranceRef.current = utterance;
            const config = personaVoiceConfig[personaType];
            const selectedVoice = voices.find(voice => voice.name === config.voiceName);

            utterance.voice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || null;
            utterance.rate = config.rate;
            utterance.pitch = config.pitch;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            utterance.onerror = (event) => {
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.error("Speech synthesis error:", event.error);
                }
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            synth.speak(utterance);
        }
    };

    return (
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/30 p-1 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
            <button onClick={handleSpeak} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all" title={isSpeaking ? "Stop" : "Listen"}>
                {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-400" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleCopy} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all" title="Copy">
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};
// --- End of Message Actions ---

export const PersonaCard: React.FC<PersonaCardProps> = ({ name, personaType, icon, history, isLoading, color, onExpandDiagram, onDiagramError, generationId, originalText }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastModelMessage = history.slice().reverse().find(msg => msg.role === 'model');

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);


  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    handleVoicesChanged();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  useEffect(() => {
      setIsCopied(false);
      // Let individual messages handle their own speech cancellation.
      // Global cancellation here might interfere with playing older messages.
  }, [history]);

  const handleCopy = () => {
    if (lastModelMessage) {
        let fullContent = lastModelMessage.rewrite;
        if (lastModelMessage.mermaidDiagram && lastModelMessage.mermaidDiagram !== '/* ERROR */') {
            fullContent += `\n\n## Visual Representation\n\n\`\`\`mermaid\n${lastModelMessage.mermaidDiagram}\n\`\`\``;
        }
        navigator.clipboard.writeText(fullContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!lastModelMessage) return;
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    if (voices.length > 0) {
      synth.cancel();
      const cleanText = stripMarkdown(lastModelMessage.rewrite);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const config = personaVoiceConfig[personaType];
      const selectedVoice = voices.find(voice => voice.name === config.voiceName);
      
      utterance.voice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error("Speech synthesis error:", event.error);
        }
        setIsSpeaking(false);
      };
      synth.speak(utterance);
    }
  };

  const handleExportMarkdown = () => {
    if (!lastModelMessage) return;
  
    let fullContent = `# Conversation with ${name}\n\n`;
    fullContent += `**Topic:** ${originalText}\n\n---\n\n`;
  
    history.forEach(message => {
      if (message.role === 'user') {
        fullContent += `## You\n\n> ${message.rewrite.replace(/\n/g, '\n> ')}\n\n`;
      } else { // model
        fullContent += `## ${icon} ${name.split(' ').pop()}\n\n${message.rewrite}\n\n`;
        if (message.mermaidDiagram && message.mermaidDiagram !== '/* ERROR */') {
          fullContent += `**Visual Representation:**\n\n\`\`\`mermaid\n${message.mermaidDiagram}\n\`\`\`\n\n`;
        }
      }
      fullContent += '---\n\n';
    });
  
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createFilename(name, originalText, 'md', generationId);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className={`flex items-center justify-between p-4 border-b border-slate-700 ${color}`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="text-lg font-bold text-white tracking-wide">{name}</h3>
        </div>
        {lastModelMessage && (
            <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-full">
                <button onClick={handleSpeak} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={isSpeaking ? "Stop speaking" : "Listen to text"} title={isSpeaking ? "Stop speaking" : "Listen to text"} disabled={voices.length === 0}>
                    {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-400" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                </button>
                <button onClick={handleCopy} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200" aria-label="Copy text and diagram" title="Copy text and diagram">
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
                <button onClick={handleExportMarkdown} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Export as Markdown" title="Export as Markdown" disabled={!lastModelMessage}>
                    <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>
      <div ref={scrollRef} className="p-6 text-slate-300 leading-relaxed flex-grow relative overflow-y-auto flex flex-col space-y-6">
        {history.length === 0 && !isLoading && (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-slate-500">Conversation with {name} will appear here.</p>
            </div>
        )}
        {history.map((message, index) => {
            const messageId = `${personaType}-${index}`;
            if (message.role === 'user') {
                return (
                    <div key={messageId} className="self-end max-w-xl w-full flex flex-col items-end relative group">
                        <div className="bg-slate-900 border border-purple-800/60 rounded-xl rounded-br-none p-4">
                            <p className="font-semibold text-purple-300 mb-2 text-right">You</p>
                            <div className="prose-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.rewrite}</ReactMarkdown>
                            </div>
                        </div>
                        <UserMessageActions
                            message={message}
                            voices={voices}
                            generationId={generationId}
                            originalText={originalText}
                            messageIndex={index}
                        />
                    </div>
                );
            } else { // model
                return (
                    <div key={messageId} className="self-start max-w-xl w-full relative group">
                         <div className="bg-slate-800 rounded-xl rounded-bl-none p-4 prose-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.rewrite}</ReactMarkdown>
                            {message.mermaidDiagram && (
                                <MermaidRenderer 
                                    diagram={message.mermaidDiagram}
                                    personaType={personaType}
                                    messageId={messageId}
                                    onDiagramError={onDiagramError}
                                    onExpandDiagram={() => onExpandDiagram({ 
                                        name, icon, color, 
                                        diagram: message.mermaidDiagram || '', 
                                        personaType, 
                                        rewrite: message.rewrite, 
                                        generationId, originalText 
                                    })}
                                />
                            )}
                        </div>
                        <MessageActions message={message} personaType={personaType} voices={voices} />
                    </div>
                );
            }
        })}
        {isLoading && <SkeletonLoader />}
      </div>
    </div>
  );
};