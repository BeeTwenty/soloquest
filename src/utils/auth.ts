
import { User, UserRole } from "../types";
import { toast } from "sonner";

// JWT configuration
const JWT_CONFIG = {
  secret: import.meta.env.VITE_JWT_SECRET || "default_secret_for_development_only",
  expiresIn: import.meta.env.VITE_JWT_EXPIRY || "7d"
};

// Store user in localStorage
const USER_STORAGE_KEY = "soloquest_user";
const TOKEN_STORAGE_KEY = "soloquest_token";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export const authUtils = {
  // Generate JWT token
  generateToken: (payload: JWTPayload): string => {
    try {
      // In a real application, you would use a library like jsonwebtoken
      // For demonstration purposes, we'll create a simple encoded token
      const header = { alg: "HS256", typ: "JWT" };
      const now = Math.floor(Date.now() / 1000);
      const exp = now + (typeof JWT_CONFIG.expiresIn === 'string' 
        ? (JWT_CONFIG.expiresIn.endsWith('d') 
          ? parseInt(JWT_CONFIG.expiresIn.slice(0, -1)) * 24 * 60 * 60 
          : 7 * 24 * 60 * 60) 
        : JWT_CONFIG.expiresIn);
      
      const tokenPayload = {
        ...payload,
        iat: now,
        exp
      };
      
      const base64Header = btoa(JSON.stringify(header));
      const base64Payload = btoa(JSON.stringify(tokenPayload));
      
      // In a real app, you would sign this with a proper algorithm
      // This is a simplified version for demonstration
      const signature = btoa(
        JSON.stringify({
          data: `${base64Header}.${base64Payload}`,
          secret: JWT_CONFIG.secret
        })
      );
      
      return `${base64Header}.${base64Payload}.${signature}`;
    } catch (error) {
      console.error("Error generating token:", error);
      return "";
    }
  },
  
  // Verify and decode JWT token
  verifyToken: (token: string): JWTPayload | null => {
    try {
      // In a real application, you would use a library to verify the signature
      // This is a simplified version for demonstration
      const [base64Header, base64Payload, signature] = token.split(".");
      
      // Check if the signature is valid (simplified)
      const expectedSignature = btoa(
        JSON.stringify({
          data: `${base64Header}.${base64Payload}`,
          secret: JWT_CONFIG.secret
        })
      );
      
      if (signature !== expectedSignature) {
        console.error("Invalid token signature");
        return null;
      }
      
      const payload = JSON.parse(atob(base64Payload)) as JWTPayload;
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.error("Token expired");
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  },
  
  // Save auth data to localStorage
  saveAuth: (authResponse: AuthResponse): void => {
    try {
      const { user, token } = authResponse;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: (): Omit<User, 'password'> | null => {
    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return null;
      
      // Get the token and verify it
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
      
      // Verify token validity
      const payload = authUtils.verifyToken(token);
      if (!payload) {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
      }
      
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
  
  // Logout user
  logout: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = "/";
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return false;
    
    // Verify token
    const payload = authUtils.verifyToken(token);
    return payload !== null;
  },
  
  // Get user role
  getUserRole: (): UserRole | null => {
    const user = authUtils.getCurrentUser();
    return user ? user.role : null;
  }
};

// Create a hook for accessing auth utils
export function useAuth() {
  return {
    ...authUtils,
    // Additional auth-related functionality could be added here
  };
}
