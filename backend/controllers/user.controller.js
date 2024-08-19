import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import bcrpyt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import asyncHandler from 'express-async-handler';

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).select('-password');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

export const followUnfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.userId.toString()) {
    return res
      .status(400)
      .json({ error: 'You cannot follow/unfollow yourself' });
  }

  const userToModify = await User.findById(id);
  const currentUser = await User.findById(req.userId);

  if (!userToModify || !currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isFollowing = currentUser.following.includes(userToModify._id);
  if (isFollowing) {
    await User.findByIdAndUpdate(userToModify._id, {
      $pull: { followers: currentUser._id },
    });
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userToModify._id },
    });
    res.status(200).json({ message: 'User unfollowed successfully' });
  } else {
    await User.findByIdAndUpdate(userToModify._id, {
      $push: { followers: currentUser._id },
    });
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: userToModify._id },
    });
    const newNotification = new Notification({
      type: 'follow',
      from: currentUser._id,
      to: userToModify._id,
    });
    await newNotification.save();
    res.status(200).json({ message: 'User followed successfully' });
  }
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.userId).select('following');

  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const suggestedUsers = await User.find({
    _id: { $nin: [...currentUser.following, currentUser._id] },
  })
    .select('username fullName profileImage')
    .limit(4);
  res.status(200).json(suggestedUsers);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, fullName, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImage, coverImage } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
    return res.status(400).json({
      error:
        'Please provide both current password and new password to change the password',
    });
  }
  if (currentPassword) {
    const isCurrentPassCorrect = await bcrpyt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPassCorrect) {
      return res.status(400).json({ error: 'Current Password is incorrect' });
    }

    const hashedhPassword = await bcrpyt.hash(newPassword, 10);
    user.password = hashedhPassword;
  }

  if (newPassword && newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password length must be at least 6 characters long' });
  }

  if (profileImage) {
    // Delete previous image from cloudinary before uploading new one
    if (user.profileImage) {
      await cloudinary.uploader.destroy(
        user.profileImage.split('/').pop().split('.')[0]
      );
    }
    const uploadedResponse = await cloudinary.uploader.upload(profileImage);
    profileImage = uploadedResponse.secure_url;
  }
  if (coverImage) {
    if (user.coverImage) {
      await cloudinary.uploader.destroy(
        user.coverImage.split('/').pop().split('.')[0]
      );
    }
    const uploadedResponse = await cloudinary.uploader.upload(coverImage);
    coverImage = uploadedResponse.secure_url;
  }

  user.username = username || user.username;
  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  user.profileImage = profileImage || user.profileImage;
  user.coverImage = coverImage || user.coverImage;
  await user.save();
  user.password = null;
  res.status(200).json(user);
});
