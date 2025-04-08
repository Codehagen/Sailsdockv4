import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteContacts: boolean) => Promise<void>;
  businessCount: number;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  businessCount,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  const [deleteContacts, setDeleteContacts] = useState(false);

  const handleConfirm = async () => {
    await onConfirm(deleteContacts);
  };

  const businessText =
    businessCount === 1
      ? "denne bedriften"
      : `disse ${businessCount} bedriftene`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Bekreft sletting
          </DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil slette {businessText}? Denne handlingen
            kan ikke angres.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="delete-contacts"
            checked={deleteContacts}
            onCheckedChange={(checked) => setDeleteContacts(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="delete-contacts">
              Slett også tilknyttede kontakter
            </Label>
            <p className="text-sm text-muted-foreground">
              Hvis ikke valgt, vil kontaktene beholdes.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Sletter..." : "Slett"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
