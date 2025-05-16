import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        user_metadata?: {
          name?: string;
          full_name?: string;
          avatar_url?: string;
        };
        created_at?: string;
        last_sign_in_at?: string;
        [key: string]: any;
      };
    }
  }
} 