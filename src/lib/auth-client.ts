import { createAuthClient } from '@neondatabase/auth';

// In production, always use the relative proxy to avoid cross-domain cookie issues.
// In development, use the env variable if provided.
// In production, we MUST use the current window origin to ensure redirects stay on our domain
const baseURL = (window.location.origin + '/api/auth').replace(/\/$/, '');

export const authClient = createAuthClient(baseURL);
