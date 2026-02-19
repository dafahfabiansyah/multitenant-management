import { X, AlertTriangle } from 'lucide-react';
import { useTenantStore } from '@/stores/tenantStore';
import type { TenantUser } from '@/types';
import { toast } from 'sonner';

interface RemoveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: TenantUser;
}

export const RemoveUserDialog = ({ open, onOpenChange, user }: RemoveUserDialogProps) => {
  const { removeUser, isLoading } = useTenantStore();

  if (!open) return null;

  const handleRemove = async () => {
    try {
      await removeUser(user.user_id);
      toast.success('User removed successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl shadow-lg z-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Remove User</h3>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to remove{' '}
              <span className="font-semibold">{user.user?.full_name}</span> from this organization?
            </p>
            <p className="text-xs text-muted-foreground">
              {user.user?.email}
            </p>
          </div>

          {/* Warning Box */}
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-xs text-destructive">
              <strong>Warning:</strong> This action cannot be undone. The user will lose access to all organization data immediately.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Removing...' : 'Remove User'}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
