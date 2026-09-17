import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

function Dashboard({ onOpenVerify }) {
    const { user } = useAuth();

    return (
        <AppLayout onOpenVerify={onOpenVerify}>
            <div className="max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-4">Hello, {user.fullName}</h1>
                <p className="text-slate-muted">Email: {user.email}</p>
                <p className="text-slate-muted">Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
        </AppLayout>
    );
}

export default Dashboard;