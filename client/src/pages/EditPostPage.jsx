import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPostById, updatePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Edit, ArrowLeft } from 'lucide-react';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await fetchPostById(id);
        const post = res.data;

        // Check author permission
        if (
          user &&
          post.author &&
          user._id !== (post.author._id || post.author)
        ) {
          setError('You are not authorized to edit this article.');
          setLoading(false);
          return;
        }

        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        console.error(err);
        setError('Failed to load article details.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await updatePost(id, { title, content });
      setSuccessMsg('Article updated successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to update post. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading article for editing..." />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to={`/posts/${id}`} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Cancel</span>
      </Link>

      <div className="post-detail-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ width: '40px', height: '40px' }}>
            <Edit size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Edit Article</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your article content or title</p>
          </div>
        </div>

        <ErrorMessage message={error} type="error" />
        <ErrorMessage message={successMsg} type="success" />

        {!error || title ? (
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
                placeholder="Article title..."
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
                placeholder="Write your article content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to={`/posts/${id}`} className="btn btn-secondary" disabled={isSubmitting}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <Edit size={16} />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default EditPostPage;
