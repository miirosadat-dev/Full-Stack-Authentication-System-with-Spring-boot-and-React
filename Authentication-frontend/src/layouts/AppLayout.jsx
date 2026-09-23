import AppHeader from '../components/AppHeader';

function AppLayout({ children, onOpenVerify, onOpenAccountSettings }) {
    return (
        <div className="min-h-screen bg-ink text-paper flex flex-col">
            <AppHeader onOpenVerify={onOpenVerify} onOpenAccountSettings={onOpenAccountSettings} />
            <main className="flex-1">{children}</main>
        </div>
    );
}

export default AppLayout;