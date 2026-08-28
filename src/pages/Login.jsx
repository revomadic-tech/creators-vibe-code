import { useEffect, useState } from "react";
import LiveWindow from "../components/login/LiveWindow";
import LoginOrbs from "../components/login/LoginOrbs";
import { useLogin, formatError } from "../api/auth/hooks";
import "../components/login/login.css";

const STATEMENTS = [
  "The board is warm. Pick it up.",
  "Every brief, one deck.",
  "Nothing is waiting on you that can't move today.",
  "The studio is already working.",
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function useStatement() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % STATEMENTS.length),
      7000,
    );
    return () => window.clearInterval(id);
  }, []);
  return STATEMENTS[index];
}

export default function Login() {
  const now = useClock();
  const statement = useStatement();
  const [error, setError] = useState("");
  const { mutate: signIn, isPending } = useLogin();

  const time = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const onSubmit = ({ email, password }) => {
    setError("");
    signIn(
      {
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onError: (err) => {
          if (!err.response) {
            setError("Can't reach the sign-in API from this origin. Try again.");
            return;
          }
          setError(formatError(err) || "Invalid email or password");
        },
      },
    );
  };

  return (
    <div className="login-stage lustrous-bg">
      <LiveWindow />

      <header className="login-crown">
        <p className="login-wordmark">
          REVO <span>CREATE</span>
        </p>
        <div className="login-clock">
          <p className="login-clock-time">{time}</p>
          <p className="login-clock-date">{date}</p>
        </div>
      </header>

      <div className="login-lead">
        <h1 className="login-greeting">Welcome back</h1>
        <p key={statement} className="login-statement">
          {statement}
        </p>
        <LoginOrbs
          onSubmit={onSubmit}
          isLoading={isPending}
          error={error}
          hint="Signing in to REVO Studios"
        />
      </div>
    </div>
  );
}
