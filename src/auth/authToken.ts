import express, { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'YOUR_JWT_SECRET_KEY';

export const authenticateToken = (req: Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid access token' });
    }
    req.user = user;
    next();
  });
};