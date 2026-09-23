import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authApi';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await resetPassword({ token, newPassword });
            setDone(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return <div className="min-h-screen flex items-center justify-center text-slate-600">Invalid reset link.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-ink p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Set a new password</h2>

                {done ? (
                    <p className="text-sm text-slate-600">Password reset. Redirecting to login...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                            <input
                                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;