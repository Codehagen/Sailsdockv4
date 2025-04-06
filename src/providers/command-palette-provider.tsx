"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Dynamically import CommandPalette for better performance
const CommandPalette = dynamic(
  () =>
    import("@/components/command-palette").then((mod) => mod.CommandPalette),
  {
    ssr: false,
    loading: () => null,
  }
);

interface CommandPaletteContextType {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextType>({
  open: false,
  toggle: () => {},
  setOpen: () => {},
});

export function useCommandPalette() {
  return React.useContext(CommandPaletteContext);
}

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Add keyboard shortcut for CMD+K to open CommandPalette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <CommandPaletteContext.Provider value={{ open, toggle, setOpen }}>
      <CommandPalette open={open} onOpenChange={setOpen} />
      {children}
    </CommandPaletteContext.Provider>
  );
}
