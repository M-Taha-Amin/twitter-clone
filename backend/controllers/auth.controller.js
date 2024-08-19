import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

export const signup = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!fullName) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid Email format' });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(400).json({ error: 'Username is already taken' });
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res
      .status(400)
      .json({ error: 'An account is already registered with this Email' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters long' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    fullName,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();
    res.status(201).json({
      username,
      fullName,
      email,
      followers: newUser.followers,
      following: newUser.following,
      bio: newUser.bio,
      coverImage: newUser.coverImage,
      profileImage: newUser.profileImage,
    });
  } else {
    res.status(400).json({ error: 'Invalid user data' });
  }
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password || '');

  if (!isPasswordCorrect) {
    return res.status(400).json({ error: 'Incorrect Password' });
  }

  generateTokenAndSetCookie(user._id, res);
  res.status(200).json({
    username,
    fullName: user.fullName,
    email: user.email,
    followers: user.followers,
    following: user.following,
    bio: user.bio,
    coverImage: user.coverImage,
    profileImage: user.profileImage,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt_token', '', { maxAge: 0 });
  res.status(200).json({ message: 'logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});
