import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { Search, PenSquare, Sparkles } from 'lucide-react';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch blog posts. Please check back later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.author && post.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
          <Sparkles size={14} color="#60a5fa" />
          <span>Explore Fresh Perspectives</span>
        </div>
        <h1 className="hero-title">Welcome to BlogSphere</h1>
        <p className="hero-subtitle">
          Discover insightful stories, deep technical guides, and creative writing from authors around the globe.
        </p>
        <div>
          {isAuthenticated ? (
            <Link to="/create-post" className="btn btn-primary">
              <PenSquare size={18} />
              <span>Write a Story</span>
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary">
              <span>Get Started</span>
            </Link>
          )}
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Latest Posts ({filteredPosts.length})</h2>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
            placeholder="Search articles or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ErrorMessage message={error} type="error" />

      {loading ? (
        <LoadingSpinner text="Fetching articles..." />
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <h3>No Blog Posts Found</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {searchTerm ? `No results match "${searchTerm}".` : 'Be the first to create an inspiring blog post!'}
          </p>
          {isAuthenticated && (
            <Link to="/create-post" className="btn btn-primary">
              <PenSquare size={16} />
              <span>Create Post</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
