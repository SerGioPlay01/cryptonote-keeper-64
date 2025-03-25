
import React, { useRef, useEffect, useState } from "react";
import MarkdownPreviewModal from "./MarkdownPreviewModal";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NoteEditorProps {
  note: Note;
  onChange: (note: Partial<Note>) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastHtmlContent = useRef<string>(note.content);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Initialize the editor with the note content
  useEffect(() => {
    if (contentRef.current && !isMarkdownMode) {
      contentRef.current.innerHTML = note.content;
    }
    if (textareaRef.current && isMarkdownMode) {
      textareaRef.current.value = note.content;
    }
  }, [note.id, note.content, isMarkdownMode]);
  
  // Save content when it changes in HTML mode
  const handleContentChange = () => {
    if (contentRef.current && !isMarkdownMode) {
      const newContent = contentRef.current.innerHTML;
      if (newContent !== lastHtmlContent.current) {
        lastHtmlContent.current = newContent;
        onChange({ content: newContent });
      }
    }
  };

  // Save content when it changes in Markdown mode
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent !== lastHtmlContent.current) {
      lastHtmlContent.current = newContent;
      onChange({ content: newContent });
    }
  };

  // Execute command on the document (HTML mode)
  const execCommand = (command: string, value: string = '') => {
    if (isMarkdownMode) return; // Don't execute commands in markdown mode
    
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
      handleContentChange();
    }
  };
  
  // Custom commands (HTML mode)
  const commands = {
    heading: (level: number) => {
      if (isMarkdownMode) return; // Don't execute commands in markdown mode
      
      document.execCommand('formatBlock', false, `h${level}`);
      if (contentRef.current) {
        contentRef.current.focus();
        handleContentChange();
      }
    },
    insertLink: () => {
      if (isMarkdownMode) return; // Don't execute commands in markdown mode
      
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
        handleContentChange();
      }
    },
    insertImage: () => {
      if (isMarkdownMode) return; // Don't execute commands in markdown mode
      
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand('insertImage', false, url);
        handleContentChange();
      }
    },
    clearFormatting: () => {
      if (isMarkdownMode) return; // Don't execute commands in markdown mode
      
      document.execCommand('removeFormat', false, '');
      handleContentChange();
    }
  };
  
  // Toggle between HTML and Markdown mode
  const toggleEditorMode = () => {
    setIsMarkdownMode(!isMarkdownMode);
  };
  
  return (
    <div className="flex flex-col rounded-md border">
      <input
        type="text"
        value={note.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Note title"
        className="p-3 text-lg font-medium bg-transparent border-b focus:outline-none"
      />
      
      <div className="editor-toolbar bg-secondary/50">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-wrap gap-1">
            {!isMarkdownMode && (
              <>
                <button onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  </svg>
                </button>
                <button onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="4" x2="10" y2="4"></line>
                    <line x1="14" y1="20" x2="5" y2="20"></line>
                    <line x1="15" y1="4" x2="9" y2="20"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                    <line x1="4" y1="21" x2="20" y2="21"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('strikeThrough')} title="Strike Through">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="12" x2="6" y2="12"></line>
                    <path d="M8 7a4 4 0 0 1 8 0"></path>
                    <path d="M8 17a4 4 0 0 0 8 0"></path>
                  </svg>
                </button>
                <button onClick={() => commands.heading(2)} title="Heading 2">H2</button>
                <button onClick={() => commands.heading(3)} title="Heading 3">H3</button>
                <button onClick={() => execCommand('justifyLeft')} title="Align Left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="17" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="17" y1="18" x2="3" y2="18"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('justifyCenter')} title="Align Center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="10" x2="6" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="18" y1="18" x2="6" y2="18"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('justifyRight')} title="Align Right">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="7" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="7" y2="18"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                <button onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="10" y1="6" x2="21" y2="6"></line>
                    <line x1="10" y1="12" x2="21" y2="12"></line>
                    <line x1="10" y1="18" x2="21" y2="18"></line>
                    <path d="M4 6h1v4"></path>
                    <path d="M4 10h2"></path>
                    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                  </svg>
                </button>
                <button onClick={commands.insertLink} title="Insert Link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
                <button onClick={commands.insertImage} title="Insert Image">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                <button onClick={commands.clearFormatting} title="Clear Formatting">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {isMarkdownMode ? (
        <textarea
          ref={textareaRef}
          className="note-content flex-1 p-4 min-h-[300px] font-mono text-sm bg-background resize-none focus:outline-none"
          defaultValue={note.content}
          onChange={handleMarkdownChange}
          placeholder="Write your markdown here..."
        />
      ) : (
        <div
          ref={contentRef}
          className="note-content flex-1 p-4 min-h-[300px]"
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
        />
      )}
      
      {/* Bottom toolbar with Preview and Markdown toggle buttons */}
      <div className="border-t p-2 bg-secondary/50 flex justify-end items-center gap-2">
        <button 
          onClick={() => setShowPreview(true)}
          className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          title="Preview Markdown"
        >
          Preview
        </button>
        <button 
          onClick={toggleEditorMode}
          className={`px-3 py-1 text-sm ${isMarkdownMode ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'} rounded-md transition-colors`}
          title="Toggle Markdown Mode"
        >
          {isMarkdownMode ? 'HTML' : 'Markdown'}
        </button>
      </div>
      
      {showPreview && (
        <MarkdownPreviewModal 
          markdown={note.content} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};

export default NoteEditor;
