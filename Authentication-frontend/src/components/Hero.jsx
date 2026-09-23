function Hero({ onOpenRegister, onOpenLogin }) {
    return (
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-10 items-center">
            <div>
                <h1 className="font-display text-2xl md:text-3xl leading-[1.05] text-ink-light tracking-tight">
                    Top Security Authentication Built with React & Spring Boot.
                </h1>
                <p className="mt-6 text-black/80 text-lg leading-relaxed max-w-md">
                    Anchor handles registration, email verification, and session security
                    end to end — so every sign-in is provably yours, without your team
                    reinventing the parts that are easy to get wrong.
                </p>
                <div className="mt-9 flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-4">
                    <button onClick={onOpenRegister} className="px-6 py-3 bg-ink-light cursor-pointer text-ink font-medium rounded-md hover:bg-brass transition-colors">
                        Get started
                    </button>

                    <button onClick={onOpenLogin} className="px-6 py-3 text-orange-500 cursor-pointer border border-white/15 rounded-md hover:border-white/30 transition-colors">
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
                <p className="text-brass">// decoded session token</p>
                <pre className="mt-3 lg:ml-30 md:ml-15 ml-5 text-white">
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