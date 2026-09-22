import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, refreshAccessToken, logoutUser } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
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
            setIsLoading(false);
        } catch (err) {
            // access token invalid/expired — try silent refresh before giving up
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
                clearSession();
                return;
            }
            try {
                const data = await refreshAccessToken(storedRefreshToken);
                persistSession(data.token, data.refreshToken, data.user);
            } catch (refreshErr) {
                clearSession();
            }
        }
    }

    function persistSession(newToken, newRefreshToken, userData) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(userData);
        setIsLoading(false);
    }

    function clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsLoading(false);
    }

    function login(newToken, newRefreshToken, userData) {
        persistSession(newToken, newRefreshToken, userData);
    }

    async function logout() {
        if (token) {
            try { await logoutUser(token); } catch (err) { /* best-effort — clear locally regardless */ }
        }
        clearSession();
    }

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser: () => { if (token) fetchCurrentUser(token); },
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