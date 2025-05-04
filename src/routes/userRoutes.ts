import { ServerRoute } from '@hapi/hapi';
import * as UserController from '../controllers/userController';

const userRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/api/users',
    handler: UserController.createUser,
    options: {
      auth: 'super_admin',
      description: 'Create a new user',
      tags: ['api', 'users'],
    },
  },
  {
    method: 'GET',
    path: '/api/users',
    handler: UserController.getAllUsers,
    options: {
      auth: 'manager_hr',
      description: 'Get all users',
      tags: ['api', 'users'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/{id}',
    handler: UserController.getUserById,
    options: {
      auth: 'manager_hr',
      description: 'Get user by ID',
      tags: ['api', 'users'],
    },
  },
  {
    method: 'PUT',
    path: '/api/users/{id}',
    handler: UserController.updateUser,
    options: {
      auth: 'super_admin',
      description: 'Update user',
      tags: ['api', 'users'],
    },
  },
  {
    method: 'DELETE',
    path: '/api/users/{id}',
    handler: UserController.deleteUser,
    options: {
      auth: 'super_admin',
      description: 'Delete user',
      tags: ['api', 'users'],
    },
  },
  {
    method: 'PUT',
    path: '/api/users/{id}/reset-password',
    handler: UserController.resetUserPassword,
    options: {
      auth: 'super_admin',
      description: 'Reset user password',
      tags: ['api', 'users'],
    },
  },
];

export default userRoutes;