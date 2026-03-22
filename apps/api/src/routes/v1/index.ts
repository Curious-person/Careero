import express from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import profileRoute from './profile.route';
import accumulationRoute from './accumulation.route';
import roleRoute from './role.route';

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
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
