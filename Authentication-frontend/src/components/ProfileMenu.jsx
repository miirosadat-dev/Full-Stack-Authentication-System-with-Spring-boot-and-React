import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

function ProfileMenu({ onOpenVerify }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleEscape(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <Avatar fullName={user.fullName} onClick={() => setOpen((prev) => !prev)} />

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {!user.emailVerified && (
                        <button
                            onClick={() => { setOpen(false); onOpenVerify(user.email); }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-slate-50"
                        >
                            Verify email
                        </button>
                    )}

                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;