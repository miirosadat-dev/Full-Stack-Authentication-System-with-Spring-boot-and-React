function Hero() {
    return (
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-16 items-center">
            <div>
                <h1 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
                    Authentication your users never have to think about.
                </h1>
                <p className="mt-6 text-slate-muted text-lg leading-relaxed max-w-md">
                    Anchor handles registration, email verification, and session security
                    end to end — so every sign-in is provably yours, without your team
                    reinventing the parts that are easy to get wrong.
                </p>
                <div className="mt-9 flex items-center gap-4">
                    <button className="px-6 py-3 bg-brass text-ink font-medium rounded-md hover:bg-brass-light transition-colors">
                        Get started
                    </button>
                    <button className="px-6 py-3 text-paper/90 border border-white/15 rounded-md hover:border-white/30 transition-colors">
                        Log in
                    </button>
                </div>
            </div>

            <div className="bg-ink-light border border-white/10 rounded-lg p-6 font-mono text-sm leading-relaxed">
                <div className="flex gap-1.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
                </div>
                <p className="text-slate-muted">// decoded session token</p>
                <pre className="mt-3 text-paper/90">
                    {`{
  "sub": "user_8f2a1c",
  "email_verified": true,
  "role": "authenticated",
  "iat": 1757894400,
  "exp": 1757898000
}`}
                </pre>
                <p className="mt-4 text-brass">✓ signature valid</p>
            </div>
        </section>
    );
}

export default Hero;