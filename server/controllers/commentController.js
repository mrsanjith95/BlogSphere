import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { memoryStore, generateId } from '../config/inMemoryStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get comments for a specific post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(404).json({ message: 'Post not found - Invalid ID' });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const comments = await Comment.find({ post: postId })
        .populate('author', 'name email')
        .sort({ createdAt: -1 });
      return res.json(comments);
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === postId.toString());
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const comments = memoryStore.comments
        .filter((c) => c.post.toString() === postId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(comments);
    }
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// @desc    Create a comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(404).json({ message: 'Post not found - Invalid ID' });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = await Comment.create({
        content: content.trim(),
        author: req.user._id,
        post: postId,
      });

      const populatedComment = await Comment.findById(comment._id).populate(
        'author',
        'name email'
      );
      return res.status(201).json(populatedComment);
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === postId.toString());
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const newComment = {
        _id: generateId(),
        content: content.trim(),
        author: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        post: postId,
        createdAt: new Date().toISOString(),
      };
      memoryStore.comments.push(newComment);
      return res.status(201).json(newComment);
    }
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ message: 'Server error while adding comment' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author only)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Comment not found - Invalid ID' });
      }
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this comment' });
      }
      await Comment.findByIdAndDelete(id);
      return res.json({ message: 'Comment deleted successfully' });
    } else {
      const index = memoryStore.comments.findIndex((c) => c._id.toString() === id.toString());
      if (index === -1) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      const comment = memoryStore.comments[index];
      const authorId = comment.author._id || comment.author;
      if (authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this comment' });
      }
      memoryStore.comments.splice(index, 1);
      return res.json({ message: 'Comment deleted successfully' });
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: 'Server error while deleting comment' });
  }
};
