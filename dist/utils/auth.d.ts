import { User, UserRole, UserLevel } from "../models";
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export interface TokenUser {
    id: string;
    email: string;
    role: UserRole;
    level: UserLevel;
}
export declare const generateToken: (user: TokenUser) => string;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => boolean;
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: string) => Promise<User | null>;
