import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, MessageSquare } from 'lucide-react';

const CommentList = ({ comments, onDeleteComment }) => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
        <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
        <p>No comments yet. Be the first to start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map((comment) => {
        const isAuthor =
          user &&
          comment.author &&
          (user._id === comment.author._id || user._id === comment.author);

        const authorName = comment.author ? comment.author.name : 'Anonymous';
        const initial = authorName.charAt(0).toUpperCase();

        return (
          <div key={comment._id} className="comment-card">
            <div className="comment-header">
              <div className="author-info">
                <div className="author-avatar" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                  {initial}
                </div>
                <div>
                  <span className="author-name">{authorName}</span>
                  <span className="post-date" style={{ marginLeft: '0.5rem' }}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>

              {isAuthor && (
                <button
                  onClick={() => onDeleteComment(comment._id)}
                  className="btn btn-outline-danger btn-sm"
                  title="Delete Comment"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <p className="comment-content">{comment.content}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
