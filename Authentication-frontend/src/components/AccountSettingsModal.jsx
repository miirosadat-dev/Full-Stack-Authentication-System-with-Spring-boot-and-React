import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword, requestEmailChange, confirmEmailChange } from '../services/authApi';

function AccountSettingsModal({ onClose }) {
    const { token, logout, refreshUser } = useAuth();
    const [tab, setTab] = useState('password'); // 'password' | 'email'

    // password tab state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwDone, setPwDone] = useState(false);

    // email tab state
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [code, setCode] = useState('');
    const [emailStep, setEmailStep] = useState('request'); // 'request' | 'confirm'
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    async function handleChangePassword(e) {
        e.preventDefault();
        setPwError('');
        setPwLoading(true);
        try {
            await changePassword({ currentPassword, newPassword }, token);
            setPwDone(true);
        } catch (err) {
            setPwError(err.message);
        } finally {
            setPwLoading(false);
        }
    }

    async function handleRequestEmailChange(e) {
        e.preventDefault();
        setEmailError('');
        setEmailLoading(true);
        try {
            await requestEmailChange({ newEmail, currentPassword: emailPassword }, token);
            setEmailStep('confirm');
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setEmailLoading(false);
        }
    }

    async function handleConfirmEmailChange(e) {
        e.preventDefault();
        setEmailError('');
        setEmailLoading(true);
        try {
            await confirmEmailChange(code, token);
            refreshUser();
            onClose();
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setEmailLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Account settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="flex gap-4 border-b border-slate-200 mb-6">
                    <button onClick={() => setTab('password')} className={`pb-2 text-sm font-medium ${tab === 'password' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>
                        Password
                    </button>
                    <button onClick={() => setTab('email')} className={`pb-2 text-sm font-medium ${tab === 'email' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>
                        Email
                    </button>
                </div>

                {tab === 'password' && (
                    pwDone ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">Password changed. Please log in again.</p>
                            <button onClick={logout} className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800">
                                Log out
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                            <button type="submit" disabled={pwLoading}
                                className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                                {pwLoading ? 'Changing...' : 'Change password'}
                            </button>
                        </form>
                    )
                )}

                {tab === 'email' && (
                    emailStep === 'request' ? (
                        <form onSubmit={handleRequestEmailChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New email</label>
                                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
                                <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                            <button type="submit" disabled={emailLoading}
                                className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                                {emailLoading ? 'Sending...' : 'Send verification code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                            <p className="text-sm text-slate-600">Enter the code sent to {newEmail}</p>
                            <input
                                type="text" inputMode="numeric" maxLength={6} value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                            <button type="submit" disabled={emailLoading || code.length !== 6}
                                className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                                {emailLoading ? 'Verifying...' : 'Confirm email change'}
                            </button>
                        </form>
                    )
                )}
            </div>
        </div>
    );
}

export default AccountSettingsModal;