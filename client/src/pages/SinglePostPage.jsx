import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchPostById,
  deletePost,
  fetchCommentsByPost,
  createComment,
  deleteComment,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import {
  Calendar,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

const SinglePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load post details
  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchPostById(id);
      setPost(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to load post. It may have been deleted.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load comments
  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetchCommentsByPost(id);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  // Handle post deletion
  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await deletePost(id);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle adding comment
  const handleAddComment = async (content) => {
    setCommentSubmitting(true);
    try {
      const res = await createComment(id, { content });
      setComments([res.data, ...comments]);
      setCommentSubmitting(false);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to post comment.');
      setCommentSubmitting(false);
      return false;
    }
  };

  // Handle deleting comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner text="Loading article..." />;

  if (error || !post) {
    return (
      <div className="post-detail-container" style={{ paddingTop: '2rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <ErrorMessage message={error || 'Post not found'} type="error" />
      </div>
    );
  }

  const isAuthor =
    user &&
    post.author &&
    (user._id === post.author._id || user._id === post.author);

  return (
    <div className="post-detail-container">
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Articles</span>
      </Link>

      <article className="post-detail-card">
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <div className="author-info">
              <div className="author-avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                {post.author ? post.author.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="author-name" style={{ fontSize: '1rem' }}>
                  {post.author ? post.author.name : 'Unknown Author'}
                </div>
                <div className="post-date" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} />
                  <span>Published on {formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {isAuthor && (
              <div className="post-detail-actions">
                <Link to={`/edit-post/${post._id}`} className="btn btn-secondary btn-sm">
                  <Edit size={15} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-outline-danger btn-sm"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-detail-content">{post.content}</div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Delete Post
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this blog post? This action will permanently delete the post and all its comments.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary btn-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="btn btn-danger btn-sm"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <section className="comments-section">
        <h3 className="comments-title">
          <MessageSquare size={20} />
          <span>Comments ({comments.length})</span>
        </h3>

        {isAuthenticated ? (
          <CommentForm onAddComment={handleAddComment} isSubmitting={commentSubmitting} />
        ) : (
          <div className="error-banner" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-border)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            <span>Want to join the conversation? <Link to="/login" style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Log in</Link> or <Link to="/register" style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Register</Link> to leave a comment.</span>
          </div>
        )}

        {commentsLoading ? (
          <LoadingSpinner text="Loading comments..." />
        ) : (
          <CommentList comments={comments} onDeleteComment={handleDeleteComment} />
        )}
      </section>
    </div>
  );
};

export default SinglePostPage;
