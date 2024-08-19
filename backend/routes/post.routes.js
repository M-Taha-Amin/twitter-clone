import { Router } from 'express';
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from '../controllers/post.controller.js';
import { jwtVerify } from '../middlewares/jwtVerify.js';

const router = Router();

router.get('/all', jwtVerify, getAllPosts);
router.get('/following', jwtVerify, getFollowingPosts);
router.get('/likes/:userId', jwtVerify, getLikedPosts);
router.get('/user/:username', jwtVerify, getUserPosts);
router.post('/create', jwtVerify, createPost);
router.post('/comment/:id', jwtVerify, commentOnPost);
router.post('/like/:id', jwtVerify, likeUnlikePost);
router.delete('/delete/:id', jwtVerify, deletePost);

export default router;
