import asyncHandler from 'express-async-handler';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  let { image } = req.body;

  if (!req.userId) {
    return res
      .status(401)
      .json({ error: 'Unauthorized users cannot create posts' });
  }

  if (!text && !image) {
    return res
      .status(400)
      .json({ error: 'Post must have either text or image' });
  }

  if (image) {
    const uploadedResponse = await cloudinary.uploader.upload(image);
    image = uploadedResponse.secure_url;
  }

  const newPost = new Post({
    user: req.userId,
    text,
    image,
  });

  await newPost.save();
  res.status(201).json(newPost);
});

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.user.toString() !== req.userId) {
    return res
      .status(401)
      .json({ error: 'You are not authorized to delete this post' });
  }
  if (post.image) {
    const imageId = post.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(imageId);
  }
  await Post.findByIdAndDelete(req.params.id);
  for (let userId of post.likes) {
    await User.findByIdAndUpdate(userId, {
      $pull: { likedPosts: post._id },
    });
  }
  res.status(200).json({ message: 'Post deleted Successfully' });
};

export const commentOnPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text field is required' });
  }
  const postId = req.params.id;
  const comment = { user: req.userId, text };
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  ).populate('comments.user', '-password');
  res.status(200).json(updatedPost.comments);
});

export const likeUnlikePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const user = await User.findById(req.userId);
  const alreadyLiked = post.likes.includes(user._id.toString());

  if (alreadyLiked) {
    // Unlike
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $pull: { likes: user._id } },
      { new: true }
    );

    await User.updateOne(
      { _id: user._id },
      { $pull: { likedPosts: post._id } }
    );

    res.status(200).json(updatedPost.likes);
  } else {
    // Like
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $push: { likes: user._id } },
      { new: true }
    );

    await User.updateOne(
      { _id: user._id },
      { $push: { likedPosts: post._id } }
    );

    const newNotification = new Notification({
      from: req.userId,
      to: post.user,
      type: 'like',
    });

    await newNotification.save();
    res.status(200).json(updatedPost.likes);
  }
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('user', '-password')
    .populate('comments.user', '-password');
  if (posts.length === 0) {
    return res.status(200).json([]);
  }
  res.status(200).json(posts);
});

export const getLikedPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
  }
  const likedPosts = await Post.find({ _id: { $in: user.likedPosts } });

  res.status(200).json(likedPosts);
});

export const getFollowingPosts = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  const followingPosts = await Post.find({
    user: { $in: currentUser.following },
  })
    .populate('user', '-password')
    .populate('comments.user', '-password');
  res.status(200).json(followingPosts);
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const userPosts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate('user', '-password')
    .populate('comments.user', '-password');
  res.json(userPosts);
});
