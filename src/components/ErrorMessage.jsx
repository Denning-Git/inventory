import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorMessage = ({ message, onRetry }) => (
  <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
    <AlertTriangle className="text-danger mb-3" size={48} />
    <h3 className="h5 fw-semibold text-body mb-2">Something went wrong</h3>
    <p className="text-muted mb-4">{message}</p>
    {onRetry && ( 
      <button
        onClick={onRetry}
        className="btn btn-primary d-flex align-items-center"
      >
        <RefreshCw size={16} className="me-2" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage