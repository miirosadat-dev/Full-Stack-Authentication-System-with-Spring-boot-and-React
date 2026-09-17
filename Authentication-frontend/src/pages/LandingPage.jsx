import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/Hero';

function LandingPage({ onOpenRegister, onOpenLogin, onOpenVerify }) {
    return (
        <PublicLayout onOpenRegister={onOpenRegister} onOpenLogin={onOpenLogin} onOpenVerify={onOpenVerify}>
            <Hero onOpenRegister={onOpenRegister} />
        </PublicLayout>
    );
}

export default LandingPage;