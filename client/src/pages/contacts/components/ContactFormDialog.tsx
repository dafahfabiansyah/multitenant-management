import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useContactStore } from '@/stores/contactStore';
import { contactSchema } from '@/lib/validations';
import type { Contact, CreateContactRequest } from '@/types';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  isEditMode?: boolean;
}

export const ContactFormDialog = ({ open, onOpenChange, contact, isEditMode = false }: ContactFormDialogProps) => {
  const { createContact, updateContact, isLoading } = useContactStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateContactRequest>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      company_name: '',
      position: '',
      department: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: '',
      status: 'active',
      source: 'website',
      tags: [],
      notes: '',
    },
  });

  useEffect(() => {
    if (open && isEditMode && contact) {
      reset({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        company_name: contact.company_name || '',
        position: contact.position || '',
        department: contact.department || '',
        address: contact.address || '',
        city: contact.city || '',
        province: contact.province || '',
        postal_code: contact.postal_code || '',
        country: contact.country || '',
        status: contact.status || 'active',
        source: contact.source || 'website',
        tags: contact.tags || [],
        notes: contact.notes || '',
      });
    } else if (open && !isEditMode) {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mobile: '',
        company_name: '',
        position: '',
        department: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: '',
        status: 'active',
        source: 'website',
        tags: [],
        notes: '',
      });
    }
  }, [open, isEditMode, contact, reset]);

  const onSubmit = async (data: CreateContactRequest) => {
    try {
      if (isEditMode && contact) {
        await updateContact(contact.id, data);
        toast.success('Contact updated successfully');
      } else {
        await createContact(data);
        toast.success('Contact created successfully');
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} contact`);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-9998 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-9999 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {isEditMode ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode ? 'Update contact information' : 'Fill in the contact details'}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('first_name')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('last_name')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="+1-555-0123"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mobile
                </label>
                <input
                  {...register('mobile')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="+1-555-0124"
                />
                {errors.mobile && (
                  <p className="mt-1 text-xs text-destructive">{errors.mobile.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Company Name
                </label>
                <input
                  {...register('company_name')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="ABC Corporation"
                />
                {errors.company_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.company_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Position
                </label>
                <input
                  {...register('position')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Marketing Manager"
                />
                {errors.position && (
                  <p className="mt-1 text-xs text-destructive">{errors.position.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Department
                </label>
                <input
                  {...register('department')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Marketing"
                />
                {errors.department && (
                  <p className="mt-1 text-xs text-destructive">{errors.department.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Street Address
                </label>
                <input
                  {...register('address')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  City
                </label>
                <input
                  {...register('city')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Province/State
                </label>
                <input
                  {...register('province')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="NY"
                />
                {errors.province && (
                  <p className="mt-1 text-xs text-destructive">{errors.province.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Postal Code
                </label>
                <input
                  {...register('postal_code')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="10001"
                />
                {errors.postal_code && (
                  <p className="mt-1 text-xs text-destructive">{errors.postal_code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Country
                </label>
                <input
                  {...register('country')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="USA"
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Status <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Source <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('source')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="ads">Ads</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="event">Event</option>
                </select>
                {errors.source && (
                  <p className="mt-1 text-xs text-destructive">{errors.source.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Add any additional notes about this contact..."
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
