import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="me-2 text-success" />;
      case 'error': return <XCircle className="me-2 text-danger" />;
      case 'warning': return <AlertCircle className="me-2 text-warning" />;
      default: return <Info className="me-2 text-info" />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-dark';
      default: return 'bg-info text-white';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast show mb-2 ${getToastClass(toast.type)}`}
          role="alert"
        >
          <div className="toast-header">
            {getIcon(toast.type)}
            <strong className="me-auto">
              {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
            </strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};