import express from 'express';
import { createOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { protectedRoute } from '../lib/securityHelpers';
import { IUser } from '../models/usersModel';



const router = express.Router();

router.post('/create-new-order', createOrder);


router.put('/updateOrder/:id', protectedRoute, updateOrder);

router.delete('/deleteOrder/:id', protectedRoute, deleteOrder);



export default router;