"use client";

import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Terminal } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief loading then redirect
    setTimeout(() => {
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-cyan-500/5 rounded-[100%] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[300px] bg-blue-500/5 rounded-[100%] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">Cerebro</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-white/40">
              Sign in to access the Cerebro console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* SSO placeholder */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3 text-sm text-white/60 transition-all hover:bg-white/5 hover:border-white/20 hover:text-white/80"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* Bottom link */}
        <p className="mt-6 text-center text-xs text-white/20">
          Don't have an account?{" "}
          <Link
            to="/console"
            className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
          >
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
