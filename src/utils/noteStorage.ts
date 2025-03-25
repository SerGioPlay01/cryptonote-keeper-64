
import { encryptNote, decryptNote } from "./crypto";

const DB_NAME = "cryptonotes";
const DB_VERSION = 1;
const NOTES_STORE = "notes";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface EncryptedNote {
  id: string;
  data: string; // encrypted note data
  iv: string;   // initialization vector
  updatedAt: number;
}

// Initialize the IndexedDB database
export const initDb = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the notes object store with id as key path
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const store = db.createObjectStore(NOTES_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
  });
};

// Save a note to IndexedDB
export const saveNote = async (note: Note, password: string): Promise<Note> => {
  try {
    const db = await initDb();
    const encryptedNote = await encryptNote(note, password);
    
    return new Promise<Note>((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE, "readwrite");
      const store = transaction.objectStore(NOTES_STORE);
      
      const request = store.put(encryptedNote);
      
      request.onerror = () => {
        reject(new Error("Failed to save note"));
      };
      
      request.onsuccess = () => {
        resolve(note);
        db.close();
      };
    });
  } catch (error) {
    console.error("Error saving note:", error);
    throw error;
  }
};

// Retrieve all notes from IndexedDB
export const getNotes = async (password: string): Promise<Note[]> => {
  try {
    const db = await initDb();
    
    return new Promise<Note[]>((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE, "readonly");
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index("updatedAt");
      
      const request = index.openCursor(null, "prev");
      const notes: Note[] = [];
      
      request.onerror = () => {
        reject(new Error("Failed to retrieve notes"));
      };
      
      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          try {
            const encryptedNote = cursor.value as EncryptedNote;
            const decryptedNote = await decryptNote(encryptedNote, password);
            notes.push(decryptedNote);
            cursor.continue();
          } catch (error) {
            console.error("Failed to decrypt note:", error);
            cursor.continue();
          }
        } else {
          resolve(notes);
          db.close();
        }
      };
    });
  } catch (error) {
    console.error("Error retrieving notes:", error);
    throw error;
  }
};

// Delete a note from IndexedDB
export const deleteNote = async (id: string, password: string): Promise<void> => {
  try {
    const db = await initDb();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE, "readwrite");
      const store = transaction.objectStore(NOTES_STORE);
      
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error("Failed to delete note"));
      };
      
      request.onsuccess = () => {
        resolve();
        db.close();
      };
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// Helper function to handle the shared note URL query parameter
export const checkForSharedNote = async (): Promise<Note | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  if (!shareParam) {
    return null;
  }
  
  try {
    // Decode and parse the shared note data
    const sharedData = JSON.parse(atob(decodeURIComponent(shareParam)));
    
    // Prompt for password to decrypt the shared note
    const password = prompt('Enter the password to decrypt this shared note:');
    
    if (!password) {
      return null;
    }
    
    // Decrypt the shared note
    const decryptedNote = await decryptNote(sharedData, password);
    
    // Generate a new ID for the imported note
    return {
      ...decryptedNote,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    };
  } catch (error) {
    console.error('Failed to process shared note:', error);
    alert('Failed to decrypt the shared note. The link might be invalid or the password is incorrect.');
    return null;
  }
};
