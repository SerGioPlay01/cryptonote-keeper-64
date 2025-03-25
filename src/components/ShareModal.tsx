
import React, { useState, useEffect } from "react";
import { encryptNote } from "../utils/crypto";
import { toast } from "./Toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface ShareModalProps {
  note: Note;
  password: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ note, password, onClose }) => {
  const [shareUrl, setShareUrl] = useState("");
  const [copying, setCopying] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Show the modal with animation
    const modal = document.getElementById('share-modal-backdrop');
    setTimeout(() => {
      if (modal) modal.classList.add('active');
    }, 10);
    
    // Generate a random password for sharing
    const randomPassword = Array(8)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    setSharePassword(randomPassword);
    
    // Add escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleClose = () => {
    const modal = document.getElementById('share-modal-backdrop');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(onClose, 300);
    } else {
      onClose();
    }
  };
  
  const generateShareLink = async () => {
    try {
      setIsGenerating(true);
      // Use either custom password or the generated one
      const finalPassword = useCustomPassword ? sharePassword : password;
      
      if (!finalPassword) {
        toast.error("No password provided. Cannot generate share link.");
        setIsGenerating(false);
        return;
      }
      
      // Encrypt the note using the selected password
      const encrypted = await encryptNote(note, finalPassword);
      
      // Create a shareable URL with the encrypted data
      const base64Data = btoa(JSON.stringify(encrypted));
      const url = `${window.location.origin}?share=${encodeURIComponent(base64Data)}`;
      
      setShareUrl(url);
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error("Failed to generate share link. Please try again.");
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!shareUrl) {
      toast.error("Generate a link first!");
      return;
    }
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link. Please try manually.");
    } finally {
      setCopying(false);
    }
  };
  
  return (
    <div id="share-modal-backdrop" className="modal-backdrop">
      <div className="modal">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Note</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-1">Sharing: {note.title}</h3>
          <p className="text-muted-foreground text-sm">
            Generate a link to share this note with others.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="use-custom-password"
              checked={useCustomPassword}
              onChange={(e) => setUseCustomPassword(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="use-custom-password">Use custom password for sharing</label>
          </div>
          
          {useCustomPassword && (
            <div>
              <label htmlFor="share-password" className="block text-sm font-medium mb-1">
                Share Password
              </label>
              <input
                id="share-password"
                type="text"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter a password for sharing"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share this password separately with the recipient.
              </p>
            </div>
          )}
          
          <div>
            <button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </button>
          </div>
          
          {shareUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Shareable Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary bg-secondary/20"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                  disabled={copying}
                >
                  {copying ? 'Copying...' : 'Copy'}
                </button>
              </div>
              
              {useCustomPassword && (
                <div className="mt-3 p-3 bg-secondary/30 rounded-md">
                  <p className="text-sm font-medium">Remember to share the password:</p>
                  <code className="block mt-1 p-2 bg-secondary rounded text-sm">
                    {sharePassword}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

