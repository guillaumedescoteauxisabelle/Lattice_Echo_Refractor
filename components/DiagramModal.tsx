import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createFilename } from '../utils/textUtils';

// Declare the global mermaid object
declare const mermaid: any;

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: string;
  personaName: string;
  personaIcon: string;
  personaColor: string;
  rewrite: string;
  generationId: string;
  originalText: string;
}

const ArrowDownTrayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ArrowsPointingInIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);


export const DiagramModal: React.FC<DiagramModalProps> = ({ isOpen, onClose, diagram, personaName, personaIcon, personaColor, rewrite, generationId, originalText }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);


  const resetTransform = useCallback(() => {
    const svgEl = diagramRef.current?.querySelector('svg');
    const container = diagramContainerRef.current;
    
    if (svgEl && container) {
        const containerRect = container.getBoundingClientRect();
        if (containerRect.width === 0 || containerRect.height === 0) {
            setTransform({ scale: 1, x: 0, y: 0 });
            return;
        }

        const svgRect = svgEl.getBBox();
        if (svgRect.width === 0 || svgRect.height === 0 || !isFinite(svgRect.width) || !isFinite(svgRect.height)) {
            setTransform({ scale: 1, x: 0, y: 0 });
            return;
        }

        const scaleX = containerRect.width / svgRect.width;
        const scaleY = containerRect.height / svgRect.height;
        let newScale = Math.min(scaleX, scaleY) * 0.95; // 0.95 gives a little padding

        // SANITY CHECK: If getBBox() returns a gigantic value, scale becomes tiny.
        // Default to a visible scale instead of making it disappear.
        if (newScale < 0.01) {
            newScale = 1;
        }
        
        const newX = (containerRect.width - svgRect.width * newScale) / 2 - svgRect.x * newScale;
        const newY = (containerRect.height - svgRect.height * newScale) / 2 - svgRect.y * newScale;
        
        setTransform({ scale: newScale, x: newX, y: newY });
    } else {
        setTransform({ scale: 1, x: 0, y: 0 });
    }
  }, []);


  useEffect(() => {
    const renderMermaid = async () => {
      if (diagram && diagramRef.current && typeof mermaid !== 'undefined') {
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
            setTimeout(resetTransform, 50); // Use timeout to ensure DOM is updated
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
    if (isOpen) {
      renderMermaid();
      setShowHelp(true);
      const timer = setTimeout(() => setShowHelp(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, diagram, personaColor, resetTransform]);

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
    const filename = createFilename(personaName, originalText, 'svg', generationId);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!diagramContainerRef.current) return;

    const rect = diagramContainerRef.current.getBoundingClientRect();
    const scaleFactor = 1.1;
    const newScale = e.deltaY > 0 ? transform.scale / scaleFactor : transform.scale * scaleFactor;
    const clampedScale = Math.max(0.2, Math.min(5, newScale));

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - transform.x) * (clampedScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (clampedScale / transform.scale);

    setTransform({ scale: clampedScale, x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only pan on left-click
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUpOrLeave = () => {
    if (isPanning) {
        setIsPanning(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 lg:p-8"
        onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full h-full flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animationFillMode: 'forwards' }}
      >
        <header className={`flex items-center justify-between p-4 border-b border-slate-700 ${personaColor} rounded-t-xl`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">{personaIcon}</span>
            <h3 className="text-lg font-bold text-white tracking-wide">{personaName}'s Diagram</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
                onClick={resetTransform}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Reset diagram view"
                title="Reset View"
            >
                <ArrowsPointingInIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Reset</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!svgContent}
              className="p-1.5 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download diagram as SVG"
              title="Download SVG"
            >
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors" aria-label="Close diagram view">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>
        <div 
            ref={diagramContainerRef}
            className="p-2 flex-grow overflow-hidden bg-slate-950 flex justify-center items-center relative"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            {showHelp && (
              <div className="absolute bottom-4 left-1/2 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm animate-fade-in-out">
                  Scroll to zoom, drag to pan
              </div>
            )}
            <div 
                ref={diagramRef} 
                style={{ 
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                }}
            >
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
        @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
            20% { opacity: 1; transform: translateY(0) translateX(-50%); }
            80% { opacity: 1; transform: translateY(0) translateX(-50%); }
            100% { opacity: 0; transform: translateY(10px) translateX(-50%); }
        }
        .animate-fade-in-out {
            animation: fade-in-out 3.5s ease-in-out forwards;
            left: 50%; /* Required for translateX(-50%) to work correctly */
        }
      `}</style>
    </div>
  );
};