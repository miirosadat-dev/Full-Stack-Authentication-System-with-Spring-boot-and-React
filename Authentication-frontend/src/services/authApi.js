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