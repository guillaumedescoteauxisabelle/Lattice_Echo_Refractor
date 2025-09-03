import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PersonaType } from '../types';
import { personaVoiceConfig } from '../config/ttsConfig';
import { stripMarkdown } from '../utils/textUtils';


interface PersonaCardProps {
  name: string;
  personaType: PersonaType;
  icon: string;
  text: string;
  isLoading: boolean;
  color: string;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
  </div>
);

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


export const PersonaCard: React.FC<PersonaCardProps> = ({ name, personaType, icon, text, isLoading, color }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    handleVoicesChanged(); // Get voices initially
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Stop speech on component unmount
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      setIsCopied(false);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isLoading]);

  const handleCopy = () => {
    if (text && !isLoading) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (isGeneratingAudio) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (text && !isLoading && voices.length > 0) {
      const cleanText = stripMarkdown(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const config = personaVoiceConfig[personaType];
      
      const selectedVoice = voices.find(voice => voice.name === config.voiceName);

      utterance.voice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
          console.error("Speech synthesis error:", event.error);
        }
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportMarkdown = () => {
    if (!text || isLoading) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s/g, '_')}_rewrite.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAudio = async () => {
    if (!text || isLoading || isSpeaking || isGeneratingAudio || voices.length === 0) return;

    setIsGeneratingAudio(true);

    try {
      // FIX: Use standard constraints for getDisplayMedia to capture tab audio.
      // The non-standard properties `mediaSource` and `suppressLocalAudioPlayback`
      // were causing errors. The user will be prompted to share their tab with audio.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

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
        a.download = `${name.toLowerCase().replace(/\s/g, '_')}_rewrite.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        stream.getTracks().forEach(track => track.stop());
        setIsGeneratingAudio(false);
      };

      const cleanText = stripMarkdown(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const config = personaVoiceConfig[personaType];
      const selectedVoice = voices.find(voice => voice.name === config.voiceName);
      
      utterance.voice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;

      utterance.onend = () => {
        setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 500);
      };

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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className={`flex items-center p-4 border-b border-slate-700 ${color}`}>
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-bold text-white tracking-wide">{name}</h3>
      </div>
      <div className="p-6 text-slate-300 leading-relaxed flex-grow relative prose-content">
        {isLoading ? <SkeletonLoader /> : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text || `Rewrite for ${name} will appear here.`}
            </ReactMarkdown>
        )}
        {!isLoading && text && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={handleSpeak}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50"
              aria-label={isSpeaking ? "Stop speaking" : "Listen to text"}
              disabled={voices.length === 0 || isGeneratingAudio}
            >
              {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-400" /> : <SpeakerWaveIcon className="w-5 h-5 text-slate-400" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-all duration-200"
              aria-label="Copy text"
            >
              {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-400" />}
            </button>
            <button
              onClick={handleExportMarkdown}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export as Markdown"
              title="Export as Markdown"
              disabled={isLoading || !text}
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={handleExportAudio}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export as Audio"
              title="Export as Audio"
              disabled={isLoading || !text || isSpeaking || isGeneratingAudio || voices.length === 0}
            >
               {isGeneratingAudio ? (
                <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <MusicalNoteIcon className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};