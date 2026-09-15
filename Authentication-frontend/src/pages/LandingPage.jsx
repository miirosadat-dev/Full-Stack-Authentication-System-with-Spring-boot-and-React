import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/Hero';

function LandingPage({ onOpenRegister }) {
    return (
        <PublicLayout onOpenRegister={onOpenRegister}>
            <Hero onOpenRegister={onOpenRegister} />
        </PublicLayout>
    );
}

export default LandingPage;