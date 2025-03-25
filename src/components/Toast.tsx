
import React from "react";

interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

// Create the toast container element
let toastContainer: HTMLDivElement | null = null;

// Create and append toast container to the body when needed
const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Function to create and show a toast
const showToast = (message: string, options: ToastOptions = {}) => {
  const { duration = 3000, type = 'info' } = options;
  
  // Get or create the toast container
  const container = getToastContainer();
  
  // Create a new toast element
  const toast = document.createElement('div');
  toast.className = `toast animate-fade-in`;
  
  // Set toast type color
  const bgColor = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
  }[type];
  
  toast.className += ` ${bgColor} border-l-4 pl-4 pr-3 py-3 mb-3 rounded-md shadow-lg`;
  
  // Set the message
  toast.innerHTML = message;
  
  // Append to container
  container.appendChild(toast);
  
  // Add show class after a small delay (for animation)
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove the toast after the duration
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('animate-fade-out');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
      
      // Remove container if empty
      if (container.children.length === 0) {
        document.body.removeChild(container);
        toastContainer = null;
      }
    }, 300);
  }, duration);
  
  return toast;
};

// Toast API
export const toast = {
  success: (message: string, options?: ToastOptions) => 
    showToast(message, { ...options, type: 'success' }),
  error: (message: string, options?: ToastOptions) => 
    showToast(message, { ...options, type: 'error' }),
  warning: (message: string, options?: ToastOptions) => 
    showToast(message, { ...options, type: 'warning' }),
  info: (message: string, options?: ToastOptions) => 
    showToast(message, { ...options, type: 'info' }),
};
