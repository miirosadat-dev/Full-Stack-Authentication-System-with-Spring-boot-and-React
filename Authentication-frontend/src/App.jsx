import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import VerifyEmailModal from './components/VerifyEmailModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { ToastContainer } from './components/Toast';

function App() {
    const [activeModal, setActiveModal] = useState(null); // null | 'register' | 'login' | 'verify' | 'forgot' | 'accountSettings'
    const [pendingEmail, setPendingEmail] = useState('');
    const [toasts, setToasts] = useState([]);

    const notify = useCallback((message, type = 'info') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    function handleRegistered(email) {
        setPendingEmail(email);
        setActiveModal('verify');
        notify('Account created — check your email for a code.', 'success');
    }

    function handleOpenVerify(userEmail) {
        setPendingEmail(userEmail);
        setActiveModal('verify');
    }

    function handleVerified() {
        setActiveModal(null);
        notify('Email verified!', 'success');
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <LandingPage
                                onOpenRegister={() => setActiveModal('register')}
                                onOpenLogin={() => setActiveModal('login')}
                                onOpenVerify={handleOpenVerify}
                                onOpenAccountSettings={() => setActiveModal('accountSettings')}
                            />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard
                                    onOpenVerify={handleOpenVerify}
                                    onOpenAccountSettings={() => setActiveModal('accountSettings')}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>

                {activeModal === 'register' && (
                    <RegisterModal
                        onClose={() => setActiveModal(null)}
                        onRegistered={handleRegistered}
                        onSwitchToLogin={() => setActiveModal('login')}
                    />
                )}

                {activeModal === 'login' && (
                    <LoginModal
                        onClose={() => setActiveModal(null)}
                        onSwitchToRegister={() => setActiveModal('register')}
                        onForgotPassword={() => setActiveModal('forgot')}
                    />
                )}

                {activeModal === 'verify' && (
                    <VerifyEmailModal
                        email={pendingEmail}
                        onClose={() => setActiveModal(null)}
                        onVerified={handleVerified}
                        onNotify={notify}
                    />
                )}

                {activeModal === 'forgot' && (
                    <ForgotPasswordModal onClose={() => setActiveModal(null)} />
                )}

                {activeModal === 'accountSettings' && (
                    <AccountSettingsModal onClose={() => setActiveModal(null)} />
                )}

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;