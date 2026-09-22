const API_BASE = 'http://localhost:8080/api';

async function handleResponse(res) {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.message || 'Something went wrong. Please try again.');
    }
    return data;
}

export async function register({ fullName, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
    });
    return handleResponse(res);
}

export async function verifyEmail({ email, code }) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
    });
    return handleResponse(res);
}

export async function resendVerification(email) {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(res);
}

export async function getCurrentUser(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
}

export async function loginUser({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    return {
        token: data.token,
        refreshToken: data.refreshToken,
        user: { id: data.userId, email: data.email, fullName: data.fullName, emailVerified: data.emailVerified },
    };
}

export async function refreshAccessToken(refreshToken) {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await handleResponse(res);
    return {
        token: data.token,
        refreshToken: data.refreshToken,
        user: { id: data.userId, email: data.email, fullName: data.fullName, emailVerified: data.emailVerified },
    };
}

export async function logoutUser(token) {
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
}