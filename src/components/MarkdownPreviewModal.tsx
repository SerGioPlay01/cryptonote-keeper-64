
import React, { useEffect, useRef } from "react";
import { marked } from "marked";
import { useIsMobile } from "@/hooks/use-mobile";

interface MarkdownPreviewModalProps {
  markdown: string;
  onClose: () => void;
}

const MarkdownPreviewModal: React.FC<MarkdownPreviewModalProps> = ({ markdown, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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
          <button
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto border rounded-md p-4 bg-card dark:bg-background">
          <div 
            className="markdown-preview prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewModal;
