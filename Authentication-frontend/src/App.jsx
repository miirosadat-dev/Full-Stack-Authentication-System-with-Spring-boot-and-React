import { useState, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterModal from './components/RegisterModal';
import VerifyEmailModal from './components/VerifyEmailModal';
import { ToastContainer } from './components/Toast';

function App() {
    const [activeModal, setActiveModal] = useState(null); // null | 'register' | 'verify'
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
        <>
            <LandingPage onOpenRegister={() => setActiveModal('register')} />

            {activeModal === 'register' && (
                <RegisterModal
                    onClose={() => setActiveModal(null)}
                    onRegistered={handleRegistered}
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
        </>
    );
}

export default App;