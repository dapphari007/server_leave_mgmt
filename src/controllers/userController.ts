import { Request, ResponseToolkit } from '@hapi/hapi';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserLevel } from '../models';
import { hashPassword, validateEmail, validatePassword } from '../utils/auth';
import logger from '../utils/logger';

export const createUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address, role, level, gender, managerId } = request.payload as any;
    
    // Validate input
    if (!firstName || !lastName || !email || !password || !role) {
      return h.response({ message: 'First name, last name, email, password, and role are required' }).code(400);
    }
    
    if (!validateEmail(email)) {
      return h.response({ message: 'Invalid email format' }).code(400);
    }
    
    if (!validatePassword(password)) {
      return h.response({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' }).code(400);
    }
    
    // Check if user already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    
    if (existingUser) {
      return h.response({ message: 'User with this email already exists' }).code(409);
    }
    
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return h.response({ message: 'Invalid role' }).code(400);
    }
    
    // Validate level if provided
    if (level && !Object.values(UserLevel).includes(level)) {
      return h.response({ message: 'Invalid level' }).code(400);
    }
    
    // Validate manager if provided
    if (managerId) {
      const manager = await userRepository.findOne({ where: { id: managerId } });
      if (!manager) {
        return h.response({ message: 'Manager not found' }).code(404);
      }
      
      // Check if manager has appropriate role
      if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.SUPER_ADMIN) {
        return h.response({ message: 'Invalid manager role' }).code(400);
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = hashedPassword;
    user.phoneNumber = phoneNumber || null;
    user.address = address || null;
    user.role = role;
    user.level = level || UserLevel.LEVEL_1;
    user.gender = gender || null;
    user.managerId = managerId || null;
    
    // Save user to database
    const savedUser = await userRepository.save(user);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return h.response({
      message: 'User created successfully',
      user: userWithoutPassword,
    }).code(201);
  } catch (error) {
    logger.error(`Error in createUser: ${error}`);
    return h.response({ message: 'An error occurred while creating the user' }).code(500);
  }
};

export const getAllUsers = async (request: Request, h: ResponseToolkit) => {
  try {
    const { role, isActive } = request.query as any;
    
    // Build query
    const userRepository = AppDataSource.getRepository(User);
    let query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Get users
    const users = await userRepository.find({
      where: query,
      order: {
        createdAt: 'DESC',
      },
    });
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return h.response({
      users: usersWithoutPasswords,
      count: usersWithoutPasswords.length,
    }).code(200);
  } catch (error) {
    logger.error(`Error in getAllUsers: ${error}`);
    return h.response({ message: 'An error occurred while fetching users' }).code(500);
  }
};

export const getUserById = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params;
    
    // Get user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return h.response({
      user: userWithoutPassword,
    }).code(200);
  } catch (error) {
    logger.error(`Error in getUserById: ${error}`);
    return h.response({ message: 'An error occurred while fetching the user' }).code(500);
  }
};

export const updateUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params;
    const { firstName, lastName, phoneNumber, address, role, level, isActive, managerId } = request.payload as any;
    
    // Get user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    
    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return h.response({ message: 'Invalid role' }).code(400);
    }
    
    // Validate level if provided
    if (level && !Object.values(UserLevel).includes(level)) {
      return h.response({ message: 'Invalid level' }).code(400);
    }
    
    // Validate manager if provided
    if (managerId) {
      const manager = await userRepository.findOne({ where: { id: managerId } });
      if (!manager) {
        return h.response({ message: 'Manager not found' }).code(404);
      }
      
      // Check if manager has appropriate role
      if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.SUPER_ADMIN) {
        return h.response({ message: 'Invalid manager role' }).code(400);
      }
      
      // Prevent circular management relationships
      if (managerId === id) {
        return h.response({ message: 'A user cannot be their own manager' }).code(400);
      }
    }
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (role) user.role = role;
    if (level) user.level = level;
    if (isActive !== undefined) user.isActive = isActive;
    if (managerId !== undefined) user.managerId = managerId;
    
    // Save updated user
    const updatedUser = await userRepository.save(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    return h.response({
      message: 'User updated successfully',
      user: userWithoutPassword,
    }).code(200);
  } catch (error) {
    logger.error(`Error in updateUser: ${error}`);
    return h.response({ message: 'An error occurred while updating the user' }).code(500);
  }
};

export const deleteUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params;
    
    // Get user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    
    // Check if user is a manager
    const managedUsers = await userRepository.find({ where: { managerId: id } });
    if (managedUsers.length > 0) {
      return h.response({ message: 'Cannot delete a user who is a manager. Please reassign their team members first.' }).code(400);
    }
    
    // Delete user
    await userRepository.remove(user);
    
    return h.response({
      message: 'User deleted successfully',
    }).code(200);
  } catch (error) {
    logger.error(`Error in deleteUser: ${error}`);
    return h.response({ message: 'An error occurred while deleting the user' }).code(500);
  }
};

export const resetUserPassword = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params;
    const { newPassword } = request.payload as any;
    
    // Validate input
    if (!newPassword) {
      return h.response({ message: 'New password is required' }).code(400);
    }
    
    if (!validatePassword(newPassword)) {
      return h.response({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' }).code(400);
    }
    
    // Get user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    user.password = hashedPassword;
    await userRepository.save(user);
    
    return h.response({
      message: 'Password reset successfully',
    }).code(200);
  } catch (error) {
    logger.error(`Error in resetUserPassword: ${error}`);
    return h.response({ message: 'An error occurred while resetting the password' }).code(500);
  }
};