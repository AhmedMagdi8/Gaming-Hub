import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  isAuth?: boolean;
  userId?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Accessing the Authorization header correctly
  const authHeader: any = req.headers['authorization'] || req.headers['Authorization'];

  
  
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];
  let decodedToken: any;

  try {
    // Verify the token
    decodedToken = jwt.verify(token, process.env.SECRET);
    
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  
  // Set userId from the decoded token
  req.userId = decodedToken.userId;
  req.isAuth = true;
  console.log("fffffffffffffffffffffffffffffffff");  
  next();
};

export default authMiddleware;
