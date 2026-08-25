import { usePresence } from "../../hooks/usePresence";

export default function OverlayPanel({
  open,
  onClose,
  children,
  className = "",
  width,
  height = "88vh",
  style,
}) {
  const { present, exiting } = usePresence(Boolean(open));
  if (!present) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
        style={{
          width,
          height,
          transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          ...style,
        }}
      >
        <div
          className={`h-full w-full ${exiting ? "slide-out-right" : "slide-in-right"} ${className}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function AnimatedPopover({ open, children, className = "" }) {
  const { present, exiting } = usePresence(Boolean(open), 180);
  if (!present) return null;
  return (
    <div
      className={`${className} ${exiting ? "animate-collapse-popup" : "animate-expand-popup"}`}
    >
      {children}
    </div>
  );
}
