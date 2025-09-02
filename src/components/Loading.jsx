import React from "react";
const Loading = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: ''
  };

  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};
export default Loading