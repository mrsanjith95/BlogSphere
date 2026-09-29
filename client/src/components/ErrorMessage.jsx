import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ErrorMessage = ({ message, type = 'error' }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={isSuccess ? 'success-banner' : 'error-banner'}>
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
