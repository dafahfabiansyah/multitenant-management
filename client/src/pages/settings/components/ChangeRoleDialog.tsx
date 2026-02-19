import { useState } from 'react';
import { X } from 'lucide-react';
import { useTenantStore } from '@/stores/tenantStore';
import type { TenantUser, UserRole } from '@/types';
import { toast } from 'sonner';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: TenantUser;
}

export const ChangeRoleDialog = ({ open, onOpenChange, user }: ChangeRoleDialogProps) => {
  const { updateUserRole, isLoading } = useTenantStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === user.role) {
      toast.info('No changes made');
      onOpenChange(false);
      return;
    }

    try {
      await updateUserRole(user.user_id, selectedRole);
      toast.success(`Role updated to ${selectedRole} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-9998"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl shadow-lg z-9999 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Change User Role</h3>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Change the role for <span className="font-medium text-foreground">{user.user?.full_name}</span>
            </p>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Select Role
              </label>
              
              <div className="space-y-2">
                {(['admin', 'manager', 'member'] as UserRole[]).map((role) => (
                  <label
                    key={role}
                    className={`
                      flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors
                      ${selectedRole === role 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      disabled={isLoading}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-ring/20"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground capitalize">{role}</p>
                      <p className="text-xs text-muted-foreground">
                        {role === 'admin' && 'Full access to all features and settings'}
                        {role === 'manager' && 'Can manage users and view reports'}
                        {role === 'member' && 'Basic access to organization data'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Warning */}
          {selectedRole !== user.role && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800">
                <strong>Warning:</strong> Changing the role will immediately affect the user's permissions.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || selectedRole === user.role}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
