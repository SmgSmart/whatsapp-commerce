import { createAuthClient } from '@neondatabase/auth';

// In production, always use the relative proxy to avoid cross-domain cookie issues.
// In development, use the env variable if provided.
const baseURL = import.meta.env.PROD 
  ? (window.location.origin + '/api/auth')
  : (import.meta.env.VITE_NEON_AUTH_URL || (window.location.origin + '/api/auth'));

export const authClient = createAuthClient(baseURL);
