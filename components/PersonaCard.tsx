import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PersonaType, ChatMessage } from '../types';
import { personaVoiceConfig } from '../config/ttsConfig';
import { stripMarkdown, createFilename } from '../utils/textUtils';

declare const mermaid: any;

// --- Informational Modal ---
interface AudioExportInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AudioExportInfoModal: React.FC<AudioExportInfoModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenAudioExportInfo', 'true');
    }
    onConfirm();
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animationFillMode: 'forwards' }}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white tracking-wide">Audio Export Instructions</h3>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
        </header>
        <div className="p-6 text-slate-300 space-y-4">
            <p>To export audio, this app records the sound from your browser tab as it's played.</p>
            <p className="font-semibold text-slate-100">Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <li>A browser prompt will ask you to share your screen.</li>
                <li>In the prompt, select the <strong>Tab</strong> option (e.g., "Chrome Tab").</li>
                <li>Choose the current tab ("Persona Rewriter AI").</li>
                <li>
                    <strong>Most Important:</strong> Make sure the 
                    <span className="font-bold text-cyan-400"> "Share tab audio" </span> 
                    checkbox is checked.
                </li>
                <li>Click <strong>Share</strong>. The recording will start automatically.</li>
            </ol>
            <p className="text-sm text-slate-400">This is a browser workaround. We don't see or record your screen, only the audio from this tab.</p>
        </div>
        <footer className="p-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
                <input
                    id="dont-show-again"
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="dont-show-again" className="ml-2 block text-sm text-slate-400">
                    Don't show this again
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">
                    Cancel
                </button>
                <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                    Continue
                </button>
            </div>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation-name: fade-in-scale;
          animation-duration: 0.2s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
};
// --- End of Modal ---

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
                    mermaid.initialize({
                        startOnLoad: false,
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
                    });
                    const diagramId = `mermaid-${personaType}-${messageId}`;
                    const { svg } = await mermaid.render(diagramId, diagram);
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
const MusicalNoteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9c0-1.105 2.239-2 5-2 2.761 0 5 1.105 5 2v4.5M9 9v3.75m-3.75-3.75h10.5a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-2.25-2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V11.25a2.25 2.25 0 0 1 2.25-2.25h1.5" />
    </svg>
);
const ArrowsPointingOutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m3.75 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15m3.75-11.25h4.5m-4.5 0v4.5m0-4.5L15 9" />
    </svg>
);
// --- End of Icons ---

export const PersonaCard: React.FC<PersonaCardProps> = ({ name, personaType, icon, history, isLoading, color, onExpandDiagram, onDiagramError, generationId, originalText }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isAudioInfoModalOpen, setIsAudioInfoModalOpen] = useState(false);
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
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
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
    if (isGeneratingAudio || !lastModelMessage) return;
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
  
  const startAudioExport = async () => {
    if (!lastModelMessage || isSpeaking || isGeneratingAudio || voices.length === 0) return;
    setIsGeneratingAudio(true);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        stream.getTracks().forEach(track => track.stop());
        alert("Audio track not found. Please ensure you share your tab's audio when prompted.");
        setIsGeneratingAudio(false);
        return;
      }
      
      const audioStream = new MediaStream([audioTrack]);
      const recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];
  
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = createFilename(name, originalText, 'webm', generationId);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(track => track.stop());
        setIsGeneratingAudio(false);
      };
  
      const cleanText = stripMarkdown(lastModelMessage.rewrite);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const config = personaVoiceConfig[personaType];
      const selectedVoice = voices.find(voice => voice.name === config.voiceName);
      
      utterance.voice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
  
      utterance.onend = () => setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 500);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error during export:", event.error);
        if (recorder.state === 'recording') recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        setIsGeneratingAudio(false);
      };
  
      recorder.start();
      window.speechSynthesis.speak(utterance);
  
    } catch (err) {
      console.error('Error capturing audio:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert('Permission to capture audio was denied. Please allow sharing to use this feature.');
      } else {
        alert('An error occurred while trying to capture audio.');
      }
      setIsGeneratingAudio(false);
    }
  };

  const handleExportAudioClick = () => {
    if (!lastModelMessage || isSpeaking || isGeneratingAudio || voices.length === 0) return;
    const hasSeenInfo = localStorage.getItem('hasSeenAudioExportInfo');
    if (hasSeenInfo) {
      startAudioExport();
    } else {
      setIsAudioInfoModalOpen(true);
    }
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
                <button onClick={handleSpeak} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={isSpeaking ? "Stop speaking" : "Listen to text"} title={isSpeaking ? "Stop speaking" : "Listen to text"} disabled={voices.length === 0 || isGeneratingAudio}>
                    {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-400" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                </button>
                <button onClick={handleCopy} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200" aria-label="Copy text and diagram" title="Copy text and diagram">
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
                <button onClick={handleExportMarkdown} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Export as Markdown" title="Export as Markdown" disabled={!lastModelMessage}>
                    <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button onClick={handleExportAudioClick} className="p-1.5 rounded-full text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Export as Audio" title="Export as Audio" disabled={!lastModelMessage || isSpeaking || isGeneratingAudio || voices.length === 0}>
                    {isGeneratingAudio ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : ( <MusicalNoteIcon className="w-5 h-5" /> )}
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
                    <div key={messageId} className="self-end max-w-xl w-full flex flex-col items-end">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl rounded-br-none p-4">
                            <p className="font-semibold text-purple-300 mb-2 text-right">You</p>
                            <p className="text-slate-300 whitespace-pre-wrap">{message.rewrite}</p>
                        </div>
                    </div>
                );
            } else { // model
                return (
                    <div key={messageId} className="self-start max-w-xl w-full">
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
                    </div>
                );
            }
        })}
        {isLoading && <SkeletonLoader />}
      </div>
      <AudioExportInfoModal 
        isOpen={isAudioInfoModalOpen} 
        onClose={() => setIsAudioInfoModalOpen(false)} 
        onConfirm={() => {
            setIsAudioInfoModalOpen(false);
            startAudioExport();
        }}
      />
    </div>
  );
};