import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/usersModel';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
require("dotenv").config('../.env');

//console.log("jwt from env", process.env.Google);

export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRY = process.env.JWT_EXPIRY!;

export const createToken = (payload: any) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return token;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw error;
  }
};

export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user as IUser;
    next();
  } catch (error) {
    console.error('Error accessing protected route:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const mockLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create a mock user object
    const mockUser: IUser = {
      _id: '65efa449e361348ac66842d0',
      // Add other necessary user properties
    } as unknown as IUser;

    // Generate a JWT token
    const token = createToken({ userId: mockUser._id });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in mock login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};