import { Request, Response } from 'express';
import User, { IUser } from '../models/usersModel';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName } = req.body;

   

    // Check if the user already exists
    // const existingUser = await User.findOne({ phoneNumber });
    // if (existingUser) {
    //   return res.status(409).json({ message: 'User already exists' });
    // }

    // Create a new user
    const newUser: IUser = new User({
      firstName,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
     (newUser)
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

