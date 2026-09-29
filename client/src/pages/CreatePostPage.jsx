import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPost } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import { PenSquare, ArrowLeft } from 'lucide-react';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and content for your article.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await createPost({ title, content });
      setSuccessMsg('Article published successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/posts/${res.data._id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to publish post. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Cancel & Return</span>
      </Link>

      <div className="post-detail-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ width: '40px', height: '40px' }}>
            <PenSquare size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create New Article</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Share your insights and knowledge with the BlogSphere community</p>
          </div>
        </div>

        <ErrorMessage message={error} type="error" />
        <ErrorMessage message={successMsg} type="success" />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Article Title
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
              placeholder="Enter a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content
            </label>
            <textarea
              id="content"
              className="form-textarea"
              style={{ minHeight: '280px', fontSize: '1.05rem', lineHeight: 1.7 }}
              placeholder="Write your blog post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/" className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <PenSquare size={16} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
