
import React, { useState, useEffect, useRef } from "react";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import ShareModal from "./ShareModal";
import PasswordModal from "./PasswordModal";
import { toast } from "./Toast";
import { initDb, getNotes, saveNote, deleteNote, checkForSharedNote } from "../utils/noteStorage";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // Initialize the database
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDb();
        setDbInitialized(true);
        
        // Check for shared note
        const sharedNote = await checkForSharedNote();
        if (sharedNote) {
          setCurrentNote(sharedNote);
          toast.info("Shared note loaded. Save it to keep it in your notes.");
        } else {
          setShowPasswordModal(true);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast.error("Failed to initialize database. Please try again.");
        setShowPasswordModal(true);
      }
    };
    
    initialize();
  }, []);
  
  // Load notes when master password is set
  useEffect(() => {
    if (dbInitialized && masterPassword) {
      loadNotes();
    }
  }, [dbInitialized, masterPassword]);
  
  const loadNotes = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await getNotes(masterPassword);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error("Failed to load notes. Please check your password.");
    }
    setLoading(false);
  };
  
  const handleSaveNote = async (note: Partial<Note>) => {
    if (!masterPassword) {
      setShowPasswordModal(true);
      return;
    }
    
    try {
      const savedNote = await saveNote({
        id: note.id || crypto.randomUUID(),
        title: note.title || "Untitled",
        content: note.content || "",
        createdAt: note.createdAt || Date.now(),
        updatedAt: Date.now()
      }, masterPassword);
      
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.filter(n => n.id !== savedNote.id);
        return [savedNote, ...updatedNotes].sort((a, b) => b.updatedAt - a.updatedAt);
      });
      
      setCurrentNote(savedNote);
      toast.success("Note saved successfully!");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note. Please try again.");
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId, masterPassword);
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
      }
      
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };
  
  const handleCreateNewNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setCurrentNote(newNote);
  };

  const handleShareNote = () => {
    if (currentNote) {
      setShowShareModal(true);
    } else {
      toast.info("Please select a note to share.");
    }
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter mb-1">CryptoNote</h1>
        <p className="text-muted-foreground">Secure, encrypted notes with HTML editing</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="glass-container p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Notes</h2>
              <button 
                onClick={handleCreateNewNote}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                New Note
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : (
              <NotesList 
                notes={notes} 
                currentNoteId={currentNote?.id} 
                onSelectNote={(note) => setCurrentNote(note)}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Change Password
            </button>
            <button 
              onClick={loadNotes}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Refresh Notes
            </button>
          </div>
        </aside>
        
        <main className="md:col-span-8 lg:col-span-9">
          <div className="glass-container rounded-lg p-4">
            {currentNote ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Edit Note</h2>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleSaveNote(currentNote)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleShareNote}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md text-sm transition-colors"
                    >
                      Share
                    </button>
                  </div>
                </div>
                
                <NoteEditor
                  note={currentNote}
                  onChange={(updatedNote) => setCurrentNote({...currentNote, ...updatedNote})}
                />
              </>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
                <p className="text-muted-foreground mb-6">Select a note from the list or create a new one</p>
                <button 
                  onClick={handleCreateNewNote}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
                >
                  Create New Note
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {showPasswordModal && (
        <PasswordModal 
          initialPassword={masterPassword}
          onConfirm={(password) => {
            setMasterPassword(password);
            setShowPasswordModal(false);
          }}
          onCancel={() => {
            if (masterPassword) {
              setShowPasswordModal(false);
            }
          }}
        />
      )}
      
      {showShareModal && currentNote && (
        <ShareModal
          note={currentNote}
          password={masterPassword}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default NotesApp;

