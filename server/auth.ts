import type { NextFunction, Request, Response } from 'express';
import { env } from './env.js';
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

export function rewriteRequestCookieHeader(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return cookieHeader;
  return cookieHeader
    .split(';')
    .map(part => {
      const trimmed = part.trim();
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return trimmed;
      
      let key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      
      if ((key.startsWith('neon-auth.') || key.startsWith('better-auth.')) && !key.startsWith('__Secure-')) {
        key = `__Secure-${key}`;
      }
      
      return `${key}=${value}`;
    })
    .join('; ');
}

export function rewriteResponseCookie(cookie: string, isSecure: boolean): string {
  const parts = cookie.split(';');
  const firstPart = parts[0].trim();
  const eqIdx = firstPart.indexOf('=');
  
  let key = firstPart;
  let value = '';
  if (eqIdx !== -1) {
    key = firstPart.substring(0, eqIdx).trim();
    value = firstPart.substring(eqIdx + 1).trim();
  }
  
  // If not secure (HTTP), strip the __Secure- prefix from the cookie name
  if (!isSecure && key.startsWith('__Secure-')) {
    key = key.substring(9);
  }
  
  const rewrittenParts = [`${key}=${value}`];
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const partLower = part.toLowerCase();
    
    // Skip Domain
    if (partLower.startsWith('domain=')) {
      continue;
    }
    // Skip SameSite (we will append our own)
    if (partLower.startsWith('samesite=')) {
      continue;
    }
    // Skip Secure attribute (we will append based on isSecure)
    if (partLower === 'secure') {
      continue;
    }
    
    if (part) {
      rewrittenParts.push(part);
    }
  }
  
  if (isSecure) {
    rewrittenParts.push('Secure');
    rewrittenParts.push('SameSite=Lax');
  } else {
    rewrittenParts.push('SameSite=Lax');
  }
  
  return rewrittenParts.join('; ');
}

function getAuthHeaders(req: Request) {
  const headers: Record<string, string> = {};
  if (req.headers.cookie) {
    headers['cookie'] = rewriteRequestCookieHeader(req.headers.cookie) || '';
  }
  if (req.headers.authorization) {
    headers['authorization'] = req.headers.authorization;
  }
  if (req.headers['user-agent']) {
    headers['user-agent'] = req.headers['user-agent'];
  }
  return headers;
}

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
        headers: getAuthHeaders(req),
      },
    });

    if (session?.user) {
      console.log(`[AUTH] Authenticated user: ${session.user.email} (ID: ${session.user.id})`);
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
    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: getAuthHeaders(req),
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
