import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/v1';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();

// parse json request body with increased limit for Base64 OCR uploads
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// enable cookies
app.use(cookieParser());

// enable cors for cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' });
});

// global error handler
app.use(errorHandler);

export default app;
