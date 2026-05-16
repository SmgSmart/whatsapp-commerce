import './polyfill';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { authClient } from './lib/auth-client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NeonAuthUIProvider 
      authClient={authClient}
      credentials={false}
      signUp={false}
      social={{
        providers: ['google']
      }}
      redirectTo="/auth/success"
    >
      <App />
    </NeonAuthUIProvider>
  </StrictMode>
);
