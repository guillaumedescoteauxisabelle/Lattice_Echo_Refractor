import React, { useEffect, useRef, useState } from 'react';

// Declare the global mermaid object
declare const mermaid: any;

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: string;
  personaName: string;
  personaIcon: string;
  personaColor: string;
}

const ArrowDownTrayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const DiagramModal: React.FC<DiagramModalProps> = ({ isOpen, onClose, diagram, personaName, personaIcon, personaColor }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    const renderMermaid = async () => {
      if (isOpen && diagram && diagramRef.current && typeof mermaid !== 'undefined') {
        try {
          diagramRef.current.innerHTML = ''; // Clear previous
          setSvgContent(''); // Clear previous SVG content
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            fontFamily: 'Inter, sans-serif',
            themeVariables: {
              background: '#020617', // slate-950
              primaryColor: '#1e293b', // slate-800
              primaryTextColor: '#f1f5f9', // slate-100
              lineColor: '#64748b', // slate-500
              textColor: '#cbd5e1', // slate-300
              nodeBorder: personaColor.includes('blue') ? '#38bdf8' : '#f472b6',
            }
          });
          const { svg } = await mermaid.render(`modal-mermaid-${Date.now()}`, diagram);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
            setSvgContent(svg);
          }
        } catch (error) {
          console.error('Modal Mermaid rendering failed:', error);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = `<p class="text-red-400 text-center p-4">Error: Could not render diagram.</p>`;
          }
          setSvgContent('');
        }
      }
    };
    renderMermaid();
  }, [isOpen, diagram, personaColor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        onClose();
    }
  };

  const handleDownload = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personaName.toLowerCase().replace(/\s/g, '_')}_diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animationFillMode: 'forwards' }}
      >
        <header className={`flex items-center justify-between p-4 border-b border-slate-700 ${personaColor} rounded-t-xl`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">{personaIcon}</span>
            <h3 className="text-lg font-bold text-white tracking-wide">{personaName}'s Diagram</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={!svgContent}
              className="p-1 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download diagram as SVG"
              title="Download SVG"
            >
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors" aria-label="Close diagram view">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>
        <div className="p-6 flex-grow overflow-auto bg-slate-950 cursor-grab active:cursor-grabbing">
            <div ref={diagramRef} className="flex justify-center items-center min-h-full">
                {/* Mermaid SVG will be rendered here */}
            </div>
        </div>
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
