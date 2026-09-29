import React, { useState } from 'react';
import { Send } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

const CommentForm = ({ onAddComment, isSubmitting }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write a comment before submitting.');
      return;
    }
    setError('');
    const success = await onAddComment(content);
    if (success) {
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <ErrorMessage message={error} type="error" />
      <div className="form-group">
        <label htmlFor="commentText" className="form-label">
          Leave a Comment
        </label>
        <textarea
          id="commentText"
          className="form-textarea"
          style={{ minHeight: '100px' }}
          placeholder="Share your thoughts on this post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        ></textarea>
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={isSubmitting}
      >
        <Send size={15} />
        <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
      </button>
    </form>
  );
};

export default CommentForm;
