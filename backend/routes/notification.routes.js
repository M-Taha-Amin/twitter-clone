import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtVerify.js';
import {
  deleteAllNotifications,
  deleteNotification,
  getAllNotifications,
  getNotificationsCount,
} from '../controllers/notification.controller.js';
const router = Router();

router.get('/', jwtVerify, getAllNotifications);
router.get('/count', jwtVerify, getNotificationsCount);
router.delete('/', jwtVerify, deleteAllNotifications);
router.delete('/delete/:notificationId', jwtVerify, deleteNotification);

export default router;
