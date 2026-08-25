import { createContext, useContext } from "react";

const CommandCenterContext = createContext(null);

export function CommandCenterProvider({ value, children }) {
  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  const ctx = useContext(CommandCenterContext);
  if (!ctx) {
    throw new Error("useCommandCenter must be used within CommandCenterProvider");
  }
  return ctx;
}
