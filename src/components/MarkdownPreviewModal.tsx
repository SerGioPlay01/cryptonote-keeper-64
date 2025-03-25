
import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, X, ChevronRight } from "lucide-react";

interface MarkdownPreviewModalProps {
  markdown: string;
  onClose: () => void;
}

const MarkdownPreviewModal: React.FC<MarkdownPreviewModalProps> = ({ markdown, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [fontSize, setFontSize] = useState(16);
  
  useEffect(() => {
    // Show the modal with animation
    const showModal = () => {
      if (backdropRef.current) {
        backdropRef.current.classList.add("active");
      }
    };
    
    showModal();
    
    // Handle ESC key to close the modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24)); // Max font size: 24px
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12)); // Min font size: 12px
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Convert markdown to HTML
  const html = marked(markdown, { 
    breaks: true,
    gfm: true,
  });
  
  return (
    <div 
      ref={backdropRef}
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef} 
        className={`modal ${isMobile ? 'w-[95%]' : 'w-full max-w-3xl'} h-[90vh] md:h-[80vh] flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Markdown Preview</h2>
          <div className="flex items-center gap-2">
            {/* Font size controls */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              <button
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">{fontSize}px</span>
              <button
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                onClick={increaseFontSize}
                aria-label="Increase font size"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Mobile controls - simplified */}
            <div className="flex md:hidden items-center gap-1">
              <button
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                onClick={decreaseFontSize}
                aria-label="Smaller text"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                onClick={increaseFontSize}
                aria-label="Larger text"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Close button */}
            <button
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto border rounded-md p-4 bg-card dark:bg-background"
        >
          <div 
            className="markdown-preview prose dark:prose-invert max-w-none"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        
        {/* Bottom toolbar for mobile */}
        {isMobile && (
          <div className="flex justify-between items-center mt-3">
            <button
              className="p-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-sm"
              onClick={scrollToTop}
            >
              Back to top
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownPreviewModal;
