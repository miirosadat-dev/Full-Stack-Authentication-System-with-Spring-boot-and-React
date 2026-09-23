import { useState } from 'react';
import { forgotPassword } from '../services/authApi';

function ForgotPasswordModal({ onClose }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Reset your password</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {sent ? (
                    <p className="text-sm text-slate-600">
                        If an account with that email exists, a reset link has been sent. Check your inbox (and spam folder).
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordModal;