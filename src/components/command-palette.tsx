"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Briefcase,
  Ticket,
  Settings,
  PlusCircle,
  LogOut,
  Keyboard,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const inputRef = React.useRef<React.ElementRef<typeof CommandInput>>(null);

  // Focus the input when the dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Only render on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  if (!mounted) {
    return null;
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <CommandInput
          ref={inputRef}
          placeholder="Type a command or search..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/customers"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Customers</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/business"))}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Business</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/tickets"))}
          >
            <Ticket className="mr-2 h-4 w-4" />
            <span>Tickets</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/customers/new"))}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Customer</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/business/new"))}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Business</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/tickets/new"))}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Ticket</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Shortcuts">
          <CommandItem onSelect={() => {}}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Show keyboard shortcuts</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/logout"))}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
