
import React, { useState, useEffect, useRef } from "react";

interface PasswordModalProps {
  initialPassword: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ 
  initialPassword, 
  onConfirm, 
  onCancel 
}) => {
  const [password, setPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialPassword);
  const [error, setError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
    
    // Show the modal with animation
    const modal = document.getElementById('password-modal-backdrop');
    setTimeout(() => {
      if (modal) modal.classList.add('active');
    }, 10);
    
    // Add escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    onConfirm(password);
  };
  
  const handleCancel = () => {
    const modal = document.getElementById('password-modal-backdrop');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(onCancel, 300);
    } else {
      onCancel();
    }
  };
  
  return (
    <div id="password-modal-backdrop" className="modal-backdrop">
      <div className="modal">
        <h2 className="text-xl font-semibold mb-4">
          {initialPassword ? "Change Master Password" : "Set Master Password"}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {initialPassword 
            ? "Enter a new master password for encrypting your notes."
            : "Your notes will be encrypted with this password. Make sure to remember it, as it cannot be recovered!"}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                ref={passwordRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your master password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm your password"
              />
            </div>
            
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              {initialPassword && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {initialPassword ? "Update Password" : "Set Password"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
