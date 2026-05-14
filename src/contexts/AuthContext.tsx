import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../lib/api';
import { authClient } from '../lib/auth-client';
import type { AdminUser } from '../lib/types';

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: session } = await authClient.getSession();
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    display_name: session.user.name,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { user } = await authApi.login(email, password);
        setUser(user);
    };

    const signOut = async () => {
        await authClient.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
