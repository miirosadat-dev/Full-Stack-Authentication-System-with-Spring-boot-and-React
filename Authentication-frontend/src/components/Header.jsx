function Header() {
    return (
        <header className="border-b border-gray-300">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2L25 7.5V14C25 20.5 20.5 25.3 14 27C7.5 25.3 3 20.5 3 14V7.5L14 2Z" stroke="#ff6003ff" strokeWidth="1.6" fill="none" />
                        <path d="M14 12.5V18.5" stroke="#e45d0fff" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="14" cy="9.5" r="1.4" fill="#f06c00ff" />
                    </svg>
                    <span className="font-display text-xl font-bold text-orange-500">Anchor</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-muted/80 font-semibold">
                    <a href="#security" className="hover:text-orange-500/60 text-ink-light">Security</a>
                    <a href="#developers" className="hover:text-orange-500/60 text-ink-light">Developers</a>
                </nav>

                <div className="flex items-center gap-3">
                    <button className="text-sm px-4 py-2 text-ink-light font-semibold hover:text-orange-500/60 transition-colors cursor-pointer">
                        Log in
                    </button>
                    <button className="text-sm px-4 py-2 bg-ink-light text-white font-medium rounded-md hover:bg-brass-light transition-colors">
                        Get started
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;