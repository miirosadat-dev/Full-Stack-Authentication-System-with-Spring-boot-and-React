import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail, resendVerification } from '../services/authApi';

function VerifyEmailModal({ email, onClose, onVerified, onNotify }) {
    const { login, refreshUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await verifyEmail({ email, code });

            if (isAuthenticated) {
                // already logged in — this was triggered from the dropdown/dashboard, not fresh registration
                refreshUser();
            } else {
                // fresh registration flow — log the user straight in
                login(data.token, data.refreshToken, data.user);
                navigate('/dashboard');
            }

            onVerified();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setResending(true);
        setError('');
        try {
            await resendVerification(email);
            onNotify('New code sent — check your inbox.', 'success');
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-slate-900">Verify your email</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                    We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        required
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline disabled:opacity-50"
                >
                    {resending ? 'Sending...' : "Didn't get a code? Resend"}
                </button>
            </div>
        </div>
    );
}

export default VerifyEmailModal;