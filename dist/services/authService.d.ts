import { User } from '../models';
/**
 * Register a new user
 */
export declare const registerUser: (userData: Partial<User>) => Promise<User>;
/**
 * Authenticate user and generate token
 */
export declare const loginUser: (email: string, password: string) => Promise<{
    user: Partial<User>;
    token: string;
}>;
/**
 * Get user profile by ID
 */
export declare const getUserProfile: (userId: string) => Promise<Partial<User>>;
/**
 * Update user profile
 */
export declare const updateUserProfile: (userId: string, userData: Partial<User>) => Promise<Partial<User>>;
/**
 * Change user password
 */
export declare const changeUserPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
/**
 * Reset user password (admin only)
 */
export declare const resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
