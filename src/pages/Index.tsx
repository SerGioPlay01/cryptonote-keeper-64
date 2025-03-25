
import React, { useState, useEffect } from "react";
import NotesApp from "../components/NotesApp";
import { checkForSharedNote } from "../utils/noteStorage";

const Index = () => {
  const [isCheckingShare, setIsCheckingShare] = useState(true);

  // Check for shared notes when the app loads
  useEffect(() => {
    const checkShare = async () => {
      await checkForSharedNote();
      setIsCheckingShare(false);
    };
    
    checkShare();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {isCheckingShare ? (
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

