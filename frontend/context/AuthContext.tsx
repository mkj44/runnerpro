'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    weight: number;
    weeklyGoal: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('runnerpro_token');
        if (savedToken) {
            setToken(savedToken);
            getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('runnerpro_token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('runnerpro_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('runnerpro_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
