import { Request, Response, NextFunction } from 'express';

// Custom error handler middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error details

  // Send a generic error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
  });
};

export default errorHandler;
