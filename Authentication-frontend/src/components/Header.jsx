function Header() {
    return (
        <header className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2L25 7.5V14C25 20.5 20.5 25.3 14 27C7.5 25.3 3 20.5 3 14V7.5L14 2Z" stroke="#C9A227" strokeWidth="1.6" fill="none" />
                        <path d="M14 12.5V18.5" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="14" cy="9.5" r="1.4" fill="#C9A227" />
                    </svg>
                    <span className="font-display text-xl tracking-tight">Anchor</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-muted">
                    <a href="#security" className="hover:text-paper transition-colors">Security</a>
                    <a href="#developers" className="hover:text-paper transition-colors">Developers</a>
                </nav>

                <div className="flex items-center gap-3">
                    <button className="text-sm px-4 py-2 text-paper/90 hover:text-paper transition-colors">
                        Log in
                    </button>
                    <button className="text-sm px-4 py-2 bg-brass text-ink font-medium rounded-md hover:bg-brass-light transition-colors">
                        Get started
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;