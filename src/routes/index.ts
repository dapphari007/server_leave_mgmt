import { Server } from '@hapi/hapi';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import leaveTypeRoutes from './leaveTypeRoutes';
import leaveBalanceRoutes from './leaveBalanceRoutes';
import leaveRequestRoutes from './leaveRequestRoutes';
import holidayRoutes from './holidayRoutes';
import approvalWorkflowRoutes from './approvalWorkflowRoutes';
import dashboardRoutes from './dashboardRoutes';

export const registerRoutes = (server: Server): void => {
  server.route([
    ...authRoutes,
    ...userRoutes,
    ...leaveTypeRoutes,
    ...leaveBalanceRoutes,
    ...leaveRequestRoutes,
    ...holidayRoutes,
    ...approvalWorkflowRoutes,
    ...dashboardRoutes,
    // Health check route
    {
      method: 'GET',
      path: '/api/health',
      handler: () => ({ status: 'ok', timestamp: new Date().toISOString() }),
      options: {
        auth: false,
        description: 'Health check endpoint',
        tags: ['api', 'health'],
      },
    },
  ]);
};