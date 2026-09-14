import Header from '../components/Header';
import Footer from '../components/Footer';

function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-ink text-paper flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

export default PublicLayout;