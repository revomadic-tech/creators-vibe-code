import { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginOrbs({ onSubmit, isLoading, error, hint }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const emailRef = useRef(null);

  const showSignIn = password.trim().length > 0;
  const message = error || localError;

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (e.key !== "Enter" && e.key.length !== 1) return;
      emailRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!isEmail(nextEmail)) {
      setLocalError("Enter a valid email");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setLocalError("Enter your password");
      return;
    }
    setLocalError("");
    onSubmit({ email: nextEmail, password });
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full flex-col items-start">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`login-orb ${email.trim() ? "login-orb--filled" : ""}`}
          data-label="Email"
        >
          <span className="login-orb-icon" aria-hidden>
            <Mail size={16} />
          </span>
          <input
            ref={emailRef}
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (localError) setLocalError("");
            }}
            placeholder="you@revomadic.com"
            autoComplete="email"
            aria-label="Email"
            className="login-orb-input"
          />
        </div>

        <div
          className={`login-orb ${password.trim() ? "login-orb--filled" : ""}`}
          data-label="Password"
        >
          <span className="login-orb-icon" aria-hidden>
            <Lock size={16} />
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (localError) setLocalError("");
            }}
            placeholder="Enter password"
            autoComplete="current-password"
            aria-label="Password"
            className="login-orb-input"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="login-orb-reveal"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {showSignIn ? (
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Sign in"
            className="login-orb login-orb-go"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="pointer-events-none mt-3 text-[11px] text-red-300/90">
          {message}
        </p>
      ) : hint ? (
        <p className="pointer-events-none mt-3 text-[11px] text-white/30">
          {hint}
        </p>
      ) : null}
    </form>
  );
}
