import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Edit, Save, X } from 'lucide-react';
import { useTenantStore } from '@/stores/tenantStore';
import { updateTenantSchema, type UpdateTenantFormData } from '@/lib/validations';
import type { Tenant } from '@/types';
import { toast } from 'sonner';

interface TenantInfoCardProps {
  tenant: Tenant | null;
}

export const TenantInfoCard = ({ tenant }: TenantInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTenant, isLoading } = useTenantStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    values: {
      name: tenant?.name || '',
      status: tenant?.status || 'active',
    },
  });

  const onSubmit = async (data: UpdateTenantFormData) => {
    try {
      await updateTenant(data);
      toast.success('Organization updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update organization');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Organization Info</h3>
            <p className="text-sm text-muted-foreground">
              Manage your organization details
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Organization Name
            </label>
            <p className="text-base font-medium text-foreground">{tenant?.name || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <span className={`
              inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium
              ${tenant?.status === 'active' ? 'bg-green-100 text-green-700' : 
                tenant?.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-gray-100 text-gray-700'}
            `}>
              {tenant?.status ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1) : 'Active'}
            </span>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Created
            </label>
            <p className="text-sm text-foreground">
              {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '-'}
            </p>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Organization Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-xs text-destructive">{errors.status.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Inactive will restrict access for all users in this organization
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
