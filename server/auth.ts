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

    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: req.headers, 
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

  // 2. Fallback to Dev User only if provided (Migration only)
  const devUserId = env.devAdminUserId;
  if (devUserId) {
    req.userId = devUserId;
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized. Please sign in.' });
}

export async function getSession(req: Request, res: Response) {
  // 1. Check for real Neon Auth session
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: req.headers,
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

  // 2. Fallback to Dev User
  if (env.devAdminUserId) {
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
