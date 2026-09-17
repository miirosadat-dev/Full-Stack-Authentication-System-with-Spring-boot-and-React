import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        fetchCurrentUser(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function fetchCurrentUser(currentToken) {
        try {
            const userData = await getCurrentUser(currentToken);
            setUser(userData);
        } catch (err) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    function login(newToken, userData) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}