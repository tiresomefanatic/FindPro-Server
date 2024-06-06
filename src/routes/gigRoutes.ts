import express, { Request, Response } from 'express';
import {
  createGig,
  getGigById,
  updateGig,
  deleteGig,
  getGigs,
  getGigsByOwner,
  createMockGigs,
  getGigsByCategory,
  bookmarkGig,
  getBookmarkedGigs,
  makeGigLive,
  makeGigDraft
} from '../controllers/gigController';
import { authMiddleware } from '../auth/protected';

//TODO: Apply authMiddleware to appropriate routes

const router = express.Router();

// GET routes
router.get('/', getGigs);
router.get('/gigs-by-category', getGigsByCategory);
router.get('/userGigs/:ownerId', getGigsByOwner);
router.get('/getGigById/:id', getGigById);
router.get('/getBookmarkedGigs', getBookmarkedGigs);

// POST routes
router.post('/createGig', authMiddleware, createGig);
router.post('/create-mock-gigs', createMockGigs);
router.post('/bookmarkGig/:gigId', authMiddleware, bookmarkGig);

// PUT routes
router.put('/:id', authMiddleware, updateGig);
router.put('/make-gig-live/:id', authMiddleware, makeGigLive);
router.put('/make-gig-draft/:id', authMiddleware, makeGigDraft);

// DELETE routes
router.delete('/:id', deleteGig);

export default router;