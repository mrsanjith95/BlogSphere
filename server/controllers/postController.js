import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { memoryStore, generateId } from '../config/inMemoryStore.js';

// Helper to check DB connectivity
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    if (isDbConnected()) {
      const posts = await Post.find({})
        .populate('author', 'name email')
        .sort({ createdAt: -1 });
      return res.json(posts);
    } else {
      const sorted = [...memoryStore.posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return res.json(sorted);
    }
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Post not found - Invalid ID' });
      }
      const post = await Post.findById(id).populate('author', 'name email');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.json(post);
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === id.toString());
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.json(post);
    }
  } catch (error) {
    console.error('Get post by id error:', error);
    return res.status(500).json({ message: 'Server error while fetching post' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (isDbConnected()) {
      const post = await Post.create({
        title: title.trim(),
        content: content.trim(),
        author: req.user._id,
      });
      const populatedPost = await Post.findById(post._id).populate('author', 'name email');
      return res.status(201).json(populatedPost);
    } else {
      const newPost = {
        _id: generateId(),
        title: title.trim(),
        content: content.trim(),
        author: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryStore.posts.push(newPost);
      return res.status(201).json(newPost);
    }
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Server error while creating post' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Post not found - Invalid ID' });
      }
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this post' });
      }
      if (title && title.trim()) post.title = title.trim();
      if (content && content.trim()) post.content = content.trim();

      const updatedPost = await post.save();
      const populatedPost = await Post.findById(updatedPost._id).populate('author', 'name email');
      return res.json(populatedPost);
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === id.toString());
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const authorId = post.author._id || post.author;
      if (authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this post' });
      }
      if (title && title.trim()) post.title = title.trim();
      if (content && content.trim()) post.content = content.trim();
      post.updatedAt = new Date().toISOString();
      return res.json(post);
    }
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ message: 'Server error while updating post' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Post not found - Invalid ID' });
      }
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this post' });
      }
      await Comment.deleteMany({ post: post._id });
      await Post.findByIdAndDelete(post._id);
      return res.json({ message: 'Post and associated comments removed successfully' });
    } else {
      const index = memoryStore.posts.findIndex((p) => p._id.toString() === id.toString());
      if (index === -1) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const post = memoryStore.posts[index];
      const authorId = post.author._id || post.author;
      if (authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this post' });
      }
      // Delete comments associated with this post
      memoryStore.comments = memoryStore.comments.filter((c) => c.post.toString() !== id.toString());
      memoryStore.posts.splice(index, 1);
      return res.json({ message: 'Post and associated comments removed successfully' });
    }
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Server error while deleting post' });
  }
};
