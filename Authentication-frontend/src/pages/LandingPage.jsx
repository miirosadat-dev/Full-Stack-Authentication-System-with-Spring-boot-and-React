import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/Hero';

function LandingPage({ onOpenRegister, onOpenLogin }) {
    return (
        <PublicLayout onOpenRegister={onOpenRegister} onOpenLogin={onOpenLogin}>
            <Hero onOpenRegister={onOpenRegister} />
        </PublicLayout>
    );
}

export default LandingPage;