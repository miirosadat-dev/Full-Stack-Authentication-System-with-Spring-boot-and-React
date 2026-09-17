import AppHeader from '../components/AppHeader';

function AppLayout({ children, onOpenVerify }) {
    return (
        <div className="min-h-screen bg-ink text-paper flex flex-col">
            <AppHeader onOpenVerify={onOpenVerify} />
            <main className="flex-1">{children}</main>
        </div>
    );
}

export default AppLayout;