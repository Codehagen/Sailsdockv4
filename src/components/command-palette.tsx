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
  User,
  Building2,
  Loader2,
  Search,
  Mail,
  Phone,
  Bug,
  FileText,
  Tag,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { searchContactsAndBusinesses } from "@/app/actions/command-search";
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

// Define types based on the server action response
interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Business {
  id: string;
  name: string;
  industry?: string;
  email?: string;
  notes?: string;
  customerSegment?: string;
}

interface DebugInfo {
  query: string;
  totalContacts: number;
  totalBusinesses: number;
  industryCounts?: Record<string, number>;
  error?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  // All state hooks first
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [debug, setDebug] = React.useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = React.useState(false);

  // All ref hooks
  const inputRef = React.useRef<React.ElementRef<typeof CommandInput>>(null);

  // All useMemo hooks next
  const hasSearchResults = React.useMemo(
    () => persons.length > 0 || businesses.length > 0,
    [persons, businesses]
  );

  const showSearchResults = React.useMemo(
    () => searchQuery.length >= 2,
    [searchQuery]
  );

  const showDefaultCommands = React.useMemo(
    () => !showSearchResults || !hasSearchResults,
    [showSearchResults, hasSearchResults]
  );

  // All callbacks next
  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  const navigateToPerson = React.useCallback(
    (personId: string) => {
      runCommand(() => router.push(`/customers/${personId}`));
    },
    [runCommand, router]
  );

  const navigateToBusiness = React.useCallback(
    (businessId: string) => {
      runCommand(() => router.push(`/business/${businessId}`));
    },
    [runCommand, router]
  );

  // Function to highlight matching text - not a hook, but moved before effects
  const highlightMatch = (text: string, query: string) => {
    if (!text) return null;

    // Use case-insensitive matching
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span
              key={i}
              className="bg-yellow-100 dark:bg-yellow-800 font-semibold"
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Fetch search results from the server action
  const fetchSearchResults = async (query: string) => {
    if (!query || query.length < 2) {
      setPersons([]);
      setBusinesses([]);
      setDebug(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchContactsAndBusinesses(query);

      // Force normalize the data through serialization to ensure clean objects
      const normalized = JSON.parse(JSON.stringify(results));

      // Special debug for partners search
      if (query.toLowerCase() === "partners") {
        // Force show the debug info for partners search
        setShowDebug(true);
      }

      // Use the normalized results
      const newPersons = normalized.people || [];
      const newBusinesses = normalized.businesses || [];

      // Update state with the new results
      setPersons(newPersons);
      setBusinesses(newBusinesses);
      setDebug(normalized.debug || null);
    } catch (error) {
      console.error("Error searching:", error);
      setPersons([]);
      setBusinesses([]);
      setDebug({
        query,
        totalContacts: 0,
        totalBusinesses: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((query: string) => {
    fetchSearchResults(query);
  }, 300);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Finally all useEffects

  // Toggle debug mode with Ctrl+Alt+D
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" && e.ctrlKey && e.altKey) {
        e.preventDefault();
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus the input when the dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      // Reset search state when opening
      setSearchQuery("");
      setPersons([]);
      setBusinesses([]);
      setDebug(null);
    }
  }, [open]);

  // Only render on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Track state changes for debugging
  React.useEffect(() => {
    // Keep empty for now, removed console logs
  }, [persons, businesses]);

  // Separate effect for debug logging to avoid dependency cycle
  React.useEffect(() => {
    // Keep empty for now, removed console logs
  }, [
    showSearchResults,
    hasSearchResults,
    persons,
    businesses,
    searchQuery,
    showDebug,
  ]);

  if (!mounted) {
    return null;
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          ref={inputRef}
          placeholder="Søk personer, bedrifter eller skriv en kommando..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          value={searchQuery}
          onValueChange={handleSearchChange}
        />
        <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <CommandList>
        {/* Debug monitor */}
        {showDebug && (
          <div className="px-3 py-2 text-xs bg-muted/50">
            <div>
              Søkeord: "{searchQuery}" (lengde: {searchQuery.length})
            </div>
            <div>Søker: {isSearching ? "ja" : "nei"}</div>
            <div>
              Personer: {persons.length}, bedrifter: {businesses.length}
            </div>
            <div>viserSøkeresultater: {showSearchResults ? "ja" : "nei"}</div>
            <div>harSøkeresultater: {hasSearchResults ? "ja" : "nei"}</div>
          </div>
        )}

        {/* Loading or Empty State */}
        {(isSearching || (!hasSearchResults && showSearchResults)) && (
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Søker...</span>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div>Ingen resultater funnet for "{searchQuery}"</div>
                {showDebug && debug && (
                  <div className="mt-2 text-xs text-muted-foreground border rounded-md p-2 mx-auto max-w-[80%] text-left">
                    <div className="font-semibold mb-1">
                      Feilsøkingsinformasjon:
                    </div>
                    <div>Søkeord: "{debug.query}"</div>
                    <div>
                      Totalt antall kontakter i DB: {debug.totalContacts}
                    </div>
                    <div>
                      Totalt antall bedrifter i DB: {debug.totalBusinesses}
                    </div>

                    {debug.industryCounts &&
                      Object.keys(debug.industryCounts).length > 0 && (
                        <div className="mt-1">
                          <div className="font-medium">
                            Bransjer i databasen:
                          </div>
                          <ul className="pl-2 mt-1">
                            {Object.entries(debug.industryCounts)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([industry, count]) => (
                                <li key={industry}>
                                  {industry}: {count}
                                </li>
                              ))}
                            {Object.keys(debug.industryCounts).length > 5 && (
                              <li>
                                ... og{" "}
                                {Object.keys(debug.industryCounts).length - 5}{" "}
                                flere
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                    {debug.error && (
                      <div className="text-red-500 mt-1">
                        Feil: {debug.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CommandEmpty>
        )}

        {/* Debug Info */}
        {showDebug && debug && showSearchResults && hasSearchResults && (
          <CommandGroup heading="Feilsøkingsinformasjon">
            <CommandItem className="flex flex-col items-start">
              <div className="flex items-center w-full">
                <Bug className="mr-2 h-4 w-4" />
                <span>Søkefeilsøking</span>
              </div>
              <div className="pl-6 text-xs text-muted-foreground mt-1 w-full">
                <div>Søkeord: "{debug.query}"</div>
                <div>
                  Resultater: {persons.length} personer, {businesses.length}{" "}
                  bedrifter
                </div>
                <div>
                  Database: {debug.totalContacts} kontakter,{" "}
                  {debug.totalBusinesses} bedrifter
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        )}

        {/* People Results */}
        {!isSearching && showSearchResults && persons.length > 0 && (
          <CommandGroup heading="Personer">
            {showDebug && (
              <div className="py-1 px-2 text-xs text-blue-600 font-medium">
                Fant {persons.length} personer
              </div>
            )}
            {persons.map((person) => (
              <CommandItem
                key={person.id}
                onSelect={() => navigateToPerson(person.id)}
                className="flex items-center border border-transparent hover:border-primary/20 my-1 !py-2"
                value={`person-${person.id}-${person.name}`}
              >
                <User className="mr-2 h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  {highlightMatch(person.name, searchQuery)}
                </span>
              </CommandItem>
            ))}
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  router.push(`/customers?search=${searchQuery}`)
                )
              }
              className="text-primary"
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="text-sm">
                Vis alle personresultater for "{searchQuery}"
              </span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Business Results */}
        {!isSearching && showSearchResults && (
          <>
            {/* Direct debug output for businesses */}
            {showDebug && (
              <div className="px-3 py-1 text-xs text-muted-foreground">
                <div>Bedriftsarray status: Lengde = {businesses.length}</div>
                {businesses.length === 0 ? (
                  <div className="text-orange-500">⚠️ Bedriftsarray er tom</div>
                ) : (
                  <div className="text-green-500">
                    ✓ Bedrifter funnet:{" "}
                    {businesses.map((b) => b.name).join(", ")}
                  </div>
                )}
              </div>
            )}

            {businesses.length > 0 && (
              <CommandGroup heading="Bedrifter">
                {showDebug && (
                  <div className="py-1 px-2 text-xs text-green-600 font-medium">
                    Fant {businesses.length} bedrifter
                  </div>
                )}
                {businesses.map((business) => (
                  <CommandItem
                    key={business.id}
                    onSelect={() => navigateToBusiness(business.id)}
                    className="flex items-center !py-2"
                    value={`business-${business.id}-${business.name}`}
                  >
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {highlightMatch(business.name, searchQuery)}
                    </span>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() =>
                    runCommand(() =>
                      router.push(`/business?search=${searchQuery}`)
                    )
                  }
                  className="text-primary"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="text-sm">
                    Vis alle bedriftsresultater for "{searchQuery}"
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}

        {/* Default Commands */}
        {!isSearching && showDefaultCommands && (
          <>
            <CommandGroup heading="Navigasjon">
              <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                <Home className="mr-2 h-4 w-4" />
                <span>Oversikt</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/customers"))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Kunder</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/business"))}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Bedrifter</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/tickets"))}
              >
                <Ticket className="mr-2 h-4 w-4" />
                <span>Saker</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/settings"))}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Innstillinger</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Handlinger">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/customers/new"))}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Ny kunde</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/business/new"))}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Ny bedrift</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/tickets/new"))}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Ny sak</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Snarveier">
              <CommandItem onSelect={() => {}}>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Vis tastatursnarveier</span>
              </CommandItem>
              {showDebug && (
                <CommandItem onSelect={() => setShowDebug(false)}>
                  <Bug className="mr-2 h-4 w-4" />
                  <span>Skjul feilsøkingsinformasjon (Ctrl+Alt+D)</span>
                </CommandItem>
              )}
              {!showDebug && (
                <CommandItem onSelect={() => setShowDebug(true)}>
                  <Bug className="mr-2 h-4 w-4" />
                  <span>Vis feilsøkingsinformasjon (Ctrl+Alt+D)</span>
                </CommandItem>
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Konto">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/logout"))}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
