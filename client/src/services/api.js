import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Interceptor to attach JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getMe = () => API.get('/auth/me');

// Post APIs
export const fetchPosts = () => API.get('/posts');
export const fetchPostById = (id) => API.get(`/posts/${id}`);
export const createPost = (postData) => API.post('/posts', postData);
export const updatePost = (id, postData) => API.put(`/posts/${id}`, postData);
export const deletePost = (id) => API.delete(`/posts/${id}`);

// Comment APIs
export const fetchCommentsByPost = (postId) => API.get(`/posts/${postId}/comments`);
export const createComment = (postId, commentData) => API.post(`/posts/${postId}/comments`, commentData);
export const deleteComment = (commentId) => API.delete(`/comments/${commentId}`);

export default API;
