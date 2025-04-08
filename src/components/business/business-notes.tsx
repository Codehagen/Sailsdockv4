"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Business } from "@prisma/client";
import { toast } from "sonner";
import { createBusinessActivity } from "@/app/actions/business-activities";

interface BusinessNotesProps {
  business: Business;
}

export function BusinessNotes({ business }: BusinessNotesProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<
    Array<{
      id: string;
      content: string;
      createdAt: Date;
      createdBy: string;
    }>
  >([]);

  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Notatet kan ikke være tomt");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create an activity of type "note"
      const result = await createBusinessActivity(business.id, {
        type: "note",
        description: newNote.trim(),
        date: new Date(),
        completed: true,
      });

      const note = {
        id: result.id,
        content: newNote,
        createdAt: new Date(),
        createdBy: "Jan Johansen", // This would come from the current user in a real app
      };

      setNotes([note, ...notes]);
      setNewNote("");
      setIsOpen(false);
      toast.success("Notat lagt til");

      // Refresh the page to update the timeline
      router.refresh();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Kunne ikke legge til notat");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return (
        "I dag " +
        date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })
      );
    } else if (days === 1) {
      return (
        "I går " +
        date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })
      );
    } else if (days < 7) {
      return days + " dager siden";
    } else {
      return date.toLocaleDateString("no-NO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const displayNotes = [
    // Start with the business.notes if it exists
    ...(business.notes
      ? [
          {
            id: "business-note",
            content: business.notes,
            createdAt: business.createdAt,
            createdBy: "System",
          },
        ]
      : []),
    // Then add any additional notes
    ...notes,
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notater</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Legg til notat
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Legg til nytt notat</SheetTitle>
              <SheetDescription>
                Legg til et notat om {business.name}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Skriv notatet ditt her..."
                className="min-h-[200px]"
              />
            </div>
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="gap-1"
              >
                <X className="h-4 w-4" /> Avbryt
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={isSubmitting || !newNote.trim()}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Lagrer..." : "Lagre notat"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {displayNotes.length > 0 ? (
        <div className="space-y-4">
          {displayNotes.map((note) => (
            <Card key={note.id} className="bg-white border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {note.createdBy.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{note.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">
                  {note.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">Ingen notater</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Det er ingen notater tilknyttet denne bedriften ennå.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex mx-auto items-center gap-1.5"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Legg til første notat
          </Button>
        </div>
      )}
    </div>
  );
}
