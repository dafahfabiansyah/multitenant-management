import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useContactStore } from '@/stores/contactStore';
import type { Contact } from '@/types';

interface DeleteContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

export const DeleteContactDialog = ({ open, onOpenChange, contact }: DeleteContactDialogProps) => {
  const { deleteContact, isLoading } = useContactStore();

  const handleDelete = async () => {
    if (!contact) return;

    try {
      await deleteContact(contact.id);
      toast.success(`Contact "${contact.first_name} ${contact.last_name}" has been deleted`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete contact');
    }
  };

  if (!open || !contact) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-9998 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-9999 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Delete Contact</h2>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm text-foreground">
            Are you sure you want to delete this contact?
          </p>
          <div className="mt-3 rounded-lg bg-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">
              {contact.first_name} {contact.last_name}
            </p>
            {contact.email && (
              <p className="text-xs text-muted-foreground mt-1">{contact.email}</p>
            )}
            {contact.company_name && (
              <p className="text-xs text-muted-foreground">{contact.company_name}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All information associated with this contact will be permanently removed from the system.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete Contact'}
          </button>
        </div>
      </div>
    </>
  );
};
