import { createContext, useContext } from 'react';
import { useStore } from '@neondatabase/auth/react';
import { authClient } from '../lib/auth-client';
import type { AdminUser } from '../lib/types';

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const sessionStore = useStore(authClient.useSession);
    const session = sessionStore?.data;
    const isPending = sessionStore?.isPending;

    const user = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        display_name: session.user.name || 'User',
    } : null;

    const signInWithGoogle = async () => {
        await authClient.signIn.social({
            provider: 'google',
            callbackURL: window.location.origin + '/auth/callback'
        });
    };

    const signOut = async () => {
        await authClient.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading: isPending, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
