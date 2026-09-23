import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function Dashboard({ onOpenVerify, onOpenAccountSettings }) {
    const { user } = useAuth();
    const initial = user.fullName?.charAt(0).toUpperCase() || '?';
    const firstName = user.fullName?.split(' ')[0];

    return (
        <AppLayout onOpenVerify={onOpenVerify} onOpenAccountSettings={onOpenAccountSettings}>
            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* Greeting */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-full bg-orange-500 text-black text-xl font-semibold flex items-center justify-center shrink-0">
                        {initial}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-paper">{getGreeting()}, {firstName}</h1>
                        <p className="text-sm text-paper/60">Welcome back to your account</p>
                    </div>
                </div>

                {/* Status cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-gray-200 border border-white/10 rounded-lg p-5">
                        <p className="text-xs uppercase tracking-wide text-paper/50 mb-2">Email</p>
                        <p className="text-sm font-medium text-paper truncate">{user.email}</p>
                    </div>

                    <div className="bg-gray-200 border border-white/10 rounded-lg p-5">
                        <p className="text-xs uppercase tracking-wide text-paper/90 mb-2">Verification</p>
                        {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Verified
                            </span>
                        ) : (
                            <button
                                onClick={() => onOpenVerify(user.email)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:underline"
                            >
                                <span className="w-1.5 h-1.5 rounded-full cursor-pointer bg-orange-400" />
                                Unverified — click to verify
                            </button>
                        )}
                    </div>

                    <div className="bg-gray-200 border border-white/10 rounded-lg p-5">
                        <p className="text-xs uppercase tracking-wide text-paper/90 mb-2">Security</p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Session active
                        </span>
                    </div>
                </div>

                {/* Quick actions */}
                <h2 className="text-lg font-bold text-paper/90 uppercase tracking-wide mb-4">Account</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <button
                        onClick={onOpenAccountSettings}
                        className="text-left bg-gray-200 border cursor-pointer border-white/10 rounded-lg p-5 hover:bg-orange-300 transition-colors"
                    >
                        <p className="text-md font-medium text-paper mb-1">Change password</p>
                        <p className="text-sm text-paper/70">Update your password to keep your account secure</p>
                    </button>

                    <button
                        onClick={onOpenAccountSettings}
                        className="text-left bg-gray-200 border border-white/10 rounded-lg p-5 hover:bg-orange-300 cursor-pointer transition-colors"
                    >
                        <p className="text-md font-medium text-paper mb-1">Change email</p>
                        <p className="text-sm text-paper/70">Update the email address linked to your account</p>
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}

export default Dashboard;