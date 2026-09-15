import { useEffect } from 'react';

function Toast({ id, message, type = 'info', onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), 4000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const styles = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        info: 'bg-slate-800',
    };

    return (
        <div className={`${styles[type]} text-white px-4 py-3 rounded-md shadow-lg text-sm flex items-center justify-between gap-4 min-w-[280px]`}>
            <span>{message}</span>
            <button onClick={() => onDismiss(id)} className="text-white/70 hover:text-white">✕</button>
        </div>
    );
}

export function ToastContainer({ toasts, onDismiss }) {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <Toast key={t.id} {...t} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

export default Toast;