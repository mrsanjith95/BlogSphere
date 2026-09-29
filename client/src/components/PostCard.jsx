import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const authorName = post.author ? post.author.name : 'Unknown Author';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <article className="post-card">
      <div>
        <div className="post-card-header">
          <div className="author-info">
            <div className="author-avatar">{authorInitial}</div>
            <span className="author-name">{authorName}</span>
          </div>
          <div className="post-date" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <Link to={`/posts/${post._id}`} className="post-card-title">
          {post.title}
        </Link>

        <p className="post-card-excerpt">{post.content}</p>
      </div>

      <div className="post-card-footer">
        <Link to={`/posts/${post._id}`} className="btn btn-outline-primary btn-sm">
          <span>Read More</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
