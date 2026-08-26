import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useLogin, formatError } from "../api/auth/hooks";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { mutate: signIn, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    signIn(
      {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      },
      {
        onError: (err) => {
          if (!err.response) {
            setError("Can't reach the sign-in API from this origin. Try again.");
            return;
          }
          setError(formatError(err) || "Invalid email or password");
        },
      }
    );
  };

  return (
    <div className="h-screen lustrous-bg flex items-center justify-center px-6">
      <div className="ambient-orbs" aria-hidden="true">
        <span className="orb orb-red" />
        <span className="orb orb-purple" />
        <span className="orb orb-orange" />
      </div>
      <div className="relative w-full max-w-[420px] glass-panel rounded-2xl border border-white/[0.08] p-8 shadow-2xl shadow-black/40">
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.2em]">
          REVO Create
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight mt-2">
          Sign in
        </h1>
        <p className="text-[13px] text-white/40 mt-2 leading-relaxed">
          Use your creator account to open the shared content library.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <label className="block">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
              Email
            </span>
            <div className="relative mt-1.5">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-2.5 pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/20"
                placeholder="you@revomadic.com"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
              Password
            </span>
            <div className="relative mt-1.5">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-2.5 pl-9 pr-10 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="text-[12px] text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-2.5 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isPending ? "Signing in…" : "Sign in"}
            {!isPending && <ArrowRight size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
}
