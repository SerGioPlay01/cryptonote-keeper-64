
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

// Convert string to ArrayBuffer
const str2ab = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

// Convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(buf));
};

// Convert ArrayBuffer to base64 string
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 string to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derive encryption key from password
const getKeyFromPassword = async (password: string): Promise<CryptoKey> => {
  const passwordBuffer = str2ab(password);
  
  // First, create a key from the password
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Use a fixed salt for simplicity (in production, you would use a unique salt per user)
  const salt = str2ab('CryptoNoteSalt');
  
  // Derive the actual encryption key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt a note using the provided password
export const encryptNote = async (note: Note, password: string): Promise<EncryptedNote> => {
  try {
    // Get encryption key from password
    const key = await getKeyFromPassword(password);
    
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Convert note to JSON string and then to ArrayBuffer
    const noteData = JSON.stringify({
      title: note.title,
      content: note.content,
      createdAt: note.createdAt
    });
    const noteBuffer = str2ab(noteData);
    
    // Encrypt the note data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      noteBuffer
    );
    
    // Return the encrypted note with the IV
    return {
      id: note.id,
      data: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      updatedAt: note.updatedAt
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt note');
  }
};

// Decrypt a note using the provided password
export const decryptNote = async (encryptedNote: EncryptedNote, password: string): Promise<Note> => {
  try {
    // Get encryption key from password
    const key = await getKeyFromPassword(password);
    
    // Convert base64 strings back to buffers
    const encryptedData = base64ToBuffer(encryptedNote.data);
    const iv = base64ToBuffer(encryptedNote.iv);
    
    // Decrypt the note data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      encryptedData
    );
    
    // Convert decrypted buffer to string and parse JSON
    const decryptedString = ab2str(decryptedBuffer);
    const noteData = JSON.parse(decryptedString);
    
    // Return the decrypted note
    return {
      id: encryptedNote.id,
      title: noteData.title,
      content: noteData.content,
      createdAt: noteData.createdAt,
      updatedAt: encryptedNote.updatedAt
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt note. Incorrect password?');
  }
};
