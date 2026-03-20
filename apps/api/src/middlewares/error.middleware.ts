import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;
  
  if (!statusCode) {
    statusCode = 500;
  }
  
  if (!message) {
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json(response);
};
