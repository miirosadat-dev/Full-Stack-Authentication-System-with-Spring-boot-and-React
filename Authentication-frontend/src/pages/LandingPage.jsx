import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/Hero';
import DeveloperPopup from '../components/DeveloperPopup';

function LandingPage({ onOpenRegister, onOpenLogin, onOpenVerify }) {
    return (
        <PublicLayout onOpenRegister={onOpenRegister} onOpenLogin={onOpenLogin} onOpenVerify={onOpenVerify}>
            <Hero onOpenRegister={onOpenRegister} onOpenLogin={onOpenLogin} />
            <DeveloperPopup />
        </PublicLayout>
    );
}

export default LandingPage;