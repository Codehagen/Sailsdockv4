"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommandPaletteTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showKeyboardHint?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function CommandPaletteTrigger({
  className,
  showKeyboardHint = true,
  size = "default",
  variant = "outline",
  ...props
}: CommandPaletteTriggerProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "flex items-center justify-between gap-2 text-sm",
        size === "icon" ? "w-9 p-0" : "w-full max-w-[200px] pr-1.5",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        {size !== "icon" && <span>Search...</span>}
      </div>
      {showKeyboardHint && size !== "icon" && (
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>J
        </kbd>
      )}
    </Button>
  );
}
