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
    getBookmarkedGigs
} from '../controllers/gigController';
import { authMiddleware, AuthenticatedRequest } from '../auth/protected';

const router = express.Router();

router.get('/:id', getGigById);
router.get('/getBookmarkedGigs/:userId', getBookmarkedGigs);
router.post('/bookmarkGig/:gigId', bookmarkGig);

router.put('/:id', updateGig);
router.delete('/:id', deleteGig);

router.get('/userGigs/:ownerId', getGigsByOwner);
router.get('/gigs-by-category', getGigsByCategory);

router.post('/createGig', createGig);


router.post('/create-mock-gigs', createMockGigs);

  router.get('/', getGigs);

  





export default router;