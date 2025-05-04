import { User, UserRole } from '../models';
/**
 * Create a new user
 */
export declare const createUser: (userData: Partial<User>) => Promise<User>;
/**
 * Get all users with optional filters
 */
export declare const getAllUsers: (filters?: {
    role?: UserRole;
    isActive?: boolean;
}) => Promise<User[]>;
/**
 * Get user by ID
 */
export declare const getUserById: (userId: string) => Promise<Partial<User>>;
/**
 * Update user
 */
export declare const updateUser: (userId: string, userData: Partial<User>) => Promise<Partial<User>>;
/**
 * Delete user
 */
export declare const deleteUser: (userId: string) => Promise<void>;
/**
 * Get users by manager ID
 */
export declare const getUsersByManagerId: (managerId: string) => Promise<User[]>;
