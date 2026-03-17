// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function HomePage() {
  const supabase = createBrowserClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setMessage(null);
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        window.location.href = "/dashboard";
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.user && !data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        } else {
          setMessage("Account created. Redirecting to your dashboard…");
          window.location.href = "/dashboard";
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-slate-950">
              RE
            </div>
            <div className="text-sm font-semibold">RevEng</div>
            <span className="text-xs text-slate-500">Stripe Revenue Recovery</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-slate-300">
            <a href="#features" className="hover:text-emerald-300">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-300">
              How it works
            </a>
            <a href="#who" className="hover:text-emerald-300">
              Who it’s for
            </a>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="rounded border border-slate-700 px-3 py-1 text-xs hover:border-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-start">
        {/* Left: SaaS hero and explanation */}
        <section className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Recover 35–45% of failed Stripe payments
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              SaaS-grade Stripe recovery without writing your own billing engine.
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              RevEng plugs into your Stripe account, listens to 12 critical webhook events, and turns
              silent failures into recovered MRR. Get a live health score, signal-backed audit, and a
              dunning system that exits correctly on every recovery.
            </p>
          </div>

          <div id="features" className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Webhook engine"
              body="12 Stripe events handled with idempotent storage, HMAC verification, and async workers."
            />
            <FeatureCard
              title="Signal dashboard"
              body="Six payment health metrics with benchmarks and prioritized recommendations."
            />
            <FeatureCard
              title="Dunning engine"
              body="Decline-code aware flows, Klaviyo/Postmark integration, and instant exit on success."
            />
          </div>

          <section id="how-it-works" className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">How RevEng works</h2>
            <ol className="space-y-2 text-xs text-slate-300">
              <li>
                1. Connect Stripe and let RevEng ingest your webhook events into a structured event log.
              </li>
              <li>
                2. The signal engine scores your authorization, failure, recovery, and dispute rates in real time.
              </li>
              <li>
                3. The dunning engine routes each failure into the right sequence and exits as soon as a payment succeeds.
              </li>
              <li>
                4. Your dashboard shows a single health score and a mini audit report you can act on today.
              </li>
            </ol>
          </section>

          <section id="who" className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">Built for</h2>
            <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="mb-1 text-xs font-semibold text-slate-100">SaaS founders</div>
                <p>
                  Self-diagnose Stripe billing, see what you’re leaking, and decide whether to invest in a full audit.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="mb-1 text-xs font-semibold text-slate-100">Stripe specialists</div>
                <p>
                  Send prospects a live demo URL that shows exactly how your webhook and dunning architecture performs.
                </p>
              </div>
            </div>
          </section>

          <p className="text-xs text-slate-500">
            No credit card required to explore the demo dashboard. Upgrade later to connect your own Stripe data.
          </p>
        </section>

        {/* Right: SaaS auth card */}
        <section className="w-full max-w-md">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/40 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === "login" ? "Sign in to RevEng" : "Create your RevEng workspace"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {mode === "login"
                    ? "Access your Stripe health dashboard and recovery system."
                    : "Start with a demo workspace, then connect your own Stripe data."}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {mode === "login" ? "New here? Create account" : "Already using RevEng? Sign in"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Work email</label>
                <input
                  type="email"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "email" : "new-email"}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">Password</label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-xs text-emerald-300">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? mode === "login"
                    ? "Signing in…"
                    : "Creating workspace…"
                  : mode === "login"
                  ? "Sign in with Email"
                  : "Create workspace"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded border border-slate-700 bg-slate-800 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
              <p className="mb-1">
                After sign in, founders land on their workspace dashboard. Admin users can switch
                between client workspaces from within the app.
              </p>
              <p>
                Already signed in? Go straight to{" "}
                <Link href="/dashboard" className="text-emerald-300 hover:underline">
                  your dashboard
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold">{props.title}</h3>
      <p className="mt-1 text-xs text-slate-400">{props.body}</p>
    </div>
  );
}