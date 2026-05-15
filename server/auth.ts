import type { NextFunction, Request, Response } from 'express';
import { env } from './env';
import { createAuthClient } from '@neondatabase/auth';

export interface AuthedRequest extends Request {
  userId?: string;
}

const neonUrl = String(env.neonAuthUrl || '').trim();

if (!neonUrl) {
  console.error('CRITICAL ERROR: VITE_NEON_AUTH_URL is missing or empty in .env');
}

const auth = createAuthClient(neonUrl);
console.log('Auth Client initialized with URL:', neonUrl);

export async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  // 1. Check for real Neon Auth session first
  try {
    // Debug: Log headers to see if cookies are present
    console.log('--- Auth Check ---');
    console.log('Path:', req.path);
    console.log('Has Cookie Header:', !!req.headers.cookie);
    if (req.headers.cookie) {
      console.log('Cookies found:', req.headers.cookie.split(';').map(c => c.split('=')[0].trim()));
    }

    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : undefined;

    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : req.headers,
      },
    });

    if (session?.user) {
      req.userId = session.user.id;
      next();
      return;
    } else {
      console.log('No session found for request to:', req.path);
      if (!req.headers.cookie) {
        console.log('Warning: No cookies found in request headers. This usually means the browser is blocking third-party cookies.');
      }
    }
  } catch (error) {
    console.error('Session verification error:', error);
  }

  // 2. Fallback to Dev User only in development
  const isProd = process.env.NODE_ENV === 'production';
  if (env.devAdminUserId && !isProd) {
    req.userId = env.devAdminUserId;
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized. Please sign in.' });
}

export async function getSession(req: Request, res: Response) {
  // 1. Check for real Neon Auth session
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : undefined;

    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : req.headers,
      },
    });

    if (session?.user) {
      return res.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          display_name: session.user.name || 'User',
        },
      });
    }
  } catch (error) {
    console.error('Session retrieval error:', error);
  }

  // 2. Fallback to Dev User (LOCAL ONLY)
  const isProd = process.env.NODE_ENV === 'production';
  if (env.devAdminUserId && !isProd) {
    return res.json({
      user: {
        id: env.devAdminUserId,
        email: null,
        display_name: 'Development Admin',
      },
    });
  }

  res.json({ user: null });
}

export function login(_req: Request, res: Response) {
  if (!env.devAdminUserId) {
    res.status(501).json({
      error:
        'Use Neon Auth for sign-in. For local migration only, set DEV_ADMIN_USER_ID in .env to bypass login while wiring the database.',
    });
    return;
  }

  res.json({
    user: {
      id: env.devAdminUserId,
      email: null,
      display_name: 'Development Admin',
    },
  });
}
