import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token is present on startup
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          // Token invalid or expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Handle Login
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      const data = res.data;
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt,
      });
      return { success: true };
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to log in. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Handle Register
  const register = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      const data = res.data;
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt,
      });
      return { success: true };
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
