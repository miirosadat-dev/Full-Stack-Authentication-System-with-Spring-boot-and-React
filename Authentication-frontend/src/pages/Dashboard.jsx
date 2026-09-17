import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-ink text-paper p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Hello, {user.fullName}</h1>
                    {/* temporary — Phase 13 replaces this with the Avatar/ProfileMenu logout flow */}
                    <button onClick={logout} className="text-sm text-orange-500 hover:underline">
                        Log out
                    </button>
                </div>
                <p className="text-slate-muted">Email: {user.email}</p>
                <p className="text-slate-muted">Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
}

export default Dashboard;