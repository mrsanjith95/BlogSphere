import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
