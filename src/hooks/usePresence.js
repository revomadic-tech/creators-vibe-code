import { useEffect, useState } from "react";
import { EXIT_MS } from "../components/layout/chrome";

export function usePresence(open, duration = EXIT_MS) {
  const [present, setPresent] = useState(Boolean(open));
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setExiting(false);
      return undefined;
    }
    if (!present) return undefined;
    setExiting(true);
    const t = window.setTimeout(() => {
      setPresent(false);
      setExiting(false);
    }, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, present]);

  return { present, exiting };
}
