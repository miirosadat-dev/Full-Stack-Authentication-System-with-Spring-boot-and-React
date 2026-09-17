import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import VerifyEmailModal from './components/VerifyEmailModal';
import { ToastContainer } from './components/Toast';

function App() {
    const [activeModal, setActiveModal] = useState(null); // null | 'register' | 'login' | 'verify'
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

    function handleVerified() {
        setActiveModal(null);
        notify('Email verified! You can now log in.', 'success');
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
                            />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
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

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;