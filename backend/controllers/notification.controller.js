import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.model.js';

export const getAllNotifications = asyncHandler(async (req, res) => {
  await Notification.updateMany({ to: req.userId }, { read: true });
  const notifications = await Notification.find({ to: req.userId }).populate(
    'from',
    'username profileImage'
  );
  res.status(200).json(notifications);
});

export const getNotificationsCount = asyncHandler(async (req, res) => {
  const count = await Notification.find({
    read: false,
    to: req.userId,
  }).countDocuments();
  res.status(200).json(count);
});

export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ to: req.userId, read: true });
  res.status(200).json({ message: 'All notifications cleared' });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  if (notification.to.toString() !== req.userId.toString()) {
    return res
      .status(403)
      .json({ error: 'You are not allowed to delete this notification' });
  }
  await Notification.deleteOne({ _id: notificationId });
  res.status(200).json({ message: 'Notification cleared successfully' });
});
