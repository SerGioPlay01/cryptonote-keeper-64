
import React from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesListProps {
  notes: Note[];
  currentNoteId: string | undefined;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  currentNoteId, 
  onSelectNote, 
  onDeleteNote 
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Extract plain text preview from HTML content
  const getContentPreview = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.substring(0, 60) + (textContent.length > 60 ? '...' : '');
  };
  
  return (
    <div className="note-list space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No notes found</p>
          <p className="text-sm mt-2">Create a new note to get started</p>
        </div>
      ) : (
        notes.map(note => (
          <div 
            key={note.id}
            className={`note-item p-3 rounded-md cursor-pointer transition-all ${
              note.id === currentNoteId 
                ? 'bg-primary/10 border-l-4 border-primary' 
                : 'bg-card hover:bg-secondary'
            }`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium truncate">{note.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this note?')) {
                    onDeleteNote(note.id);
                  }
                }}
                className="ml-2 text-muted-foreground hover:text-destructive text-sm"
              >
                <span className="sr-only">Delete</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {getContentPreview(note.content)}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              {formatDate(note.updatedAt)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotesList;
