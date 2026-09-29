import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, LogIn, UserPlus, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <BookOpen size={18} />
          </div>
          <span>BlogSphere</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/create-post" className="btn btn-primary btn-sm">
                <PenSquare size={16} />
                <span>Create Post</span>
              </Link>
              
              <div className="user-badge" title={user?.email}>
                <div className="avatar-circle">
                  {getInitial(user?.name)}
                </div>
                <span>{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
