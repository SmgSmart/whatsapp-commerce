import { createAuthClient } from '@neondatabase/auth';

const baseURL = import.meta.env.VITE_NEON_AUTH_URL || (window.location.origin + '/api/auth');

export const authClient = createAuthClient(baseURL);
