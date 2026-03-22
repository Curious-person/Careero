import express from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import profileRoute from './profile.route';
import accumulationRoute from './accumulation.route';
import roleRoute from './role.route';
import companyProfileRoute from './companyProfile.route';
import interviewRoute from './interview.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/health',
    route: healthRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/profile',
    route: profileRoute,
  },
  {
    path: '/accumulations',
    route: accumulationRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/company',
    route: companyProfileRoute,
  },
  {
    path: '/interviews',
    route: interviewRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
