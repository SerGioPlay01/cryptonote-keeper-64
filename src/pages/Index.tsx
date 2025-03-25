
import React, { useState, useEffect } from "react";
import NotesApp from "../components/NotesApp";
import { initDb } from "../utils/noteStorage";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize database when the app loads
  useEffect(() => {
    const initializeDb = async () => {
      try {
        await initDb();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeDb();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {isInitializing ? (
        <div className="flex justify-center items-center h-screen">
          <div className="spinner"></div>
        </div>
      ) : (
        <NotesApp />
      )}
    </div>
  );
};

export default Index;
