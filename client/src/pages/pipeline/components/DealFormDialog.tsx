import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useDealStore } from '@/stores/dealStore';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useContactStore } from '@/stores/contactStore';
import type { Deal } from '@/types';
import { toast } from 'sonner';
import { dealSchema, type DealFormData } from '@/lib/validations';

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
}

export const DealFormDialog = ({ open, onOpenChange, deal }: DealFormDialogProps) => {
  const { createDeal, updateDeal, isLoading } = useDealStore();
  const { stages, fetchStages } = usePipelineStore();
  const { contacts, fetchContacts } = useContactStore();
  const [searchContact, setSearchContact] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          value: deal.value,
          currency: deal.currency,
          stage_id: deal.stage_id,
          contact_id: deal.contact_id || undefined,
          expected_close_date: deal.expected_close_date?.split('T')[0] || undefined,
          probability: deal.probability || undefined,
          description: deal.description || undefined,
        }
      : {
          currency: 'IDR',
          value: 0,
          stage_id: 0,
          title: '',
        },
  });

  useEffect(() => {
    if (open) {
      fetchStages();
      fetchContacts({});
    }
  }, [open, fetchStages, fetchContacts]);

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage_id: deal.stage_id,
        contact_id: deal.contact_id || undefined,
        expected_close_date: deal.expected_close_date?.split('T')[0] || undefined,
        probability: deal.probability || undefined,
        description: deal.description || undefined,
      });
    } else {
      reset({ currency: 'IDR', value: 0, stage_id: 0, title: '' });
    }
  }, [deal, reset]);

  const onSubmit = async (data: DealFormData) => {
    try {
      // Convert date format from YYYY-MM-DD to ISO 8601 datetime
      const submitData = {
        ...data,
        expected_close_date: data.expected_close_date 
          ? `${data.expected_close_date}T00:00:00Z` 
          : undefined,
      };

      if (deal) {
        await updateDeal(deal.id, submitData);
        toast.success('Deal updated successfully');
      } else {
        await createDeal(submitData);
        toast.success('Deal created successfully');
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save deal');
    }
  };

  const filteredContacts = contacts.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email}`
      .toLowerCase()
      .includes(searchContact.toLowerCase())
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 9998 }}
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
      >
        <div
          className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-xl font-semibold text-foreground">
              {deal ? 'Edit Deal' : 'Create New Deal'}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Deal Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Enterprise Software License"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Value & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Deal Value *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
                {errors.value && (
                  <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pipeline Stage *
              </label>
              <select
                {...register('stage_id', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a stage</option>
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}%)
                    </option>
                  ))}
              </select>
              {errors.stage_id && (
                <p className="text-xs text-red-600 mt-1">{errors.stage_id.message}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Contact
              </label>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              />
              <select
                {...register('contact_id', { 
                  setValueAs: (v) => v === '' ? undefined : Number(v) 
                })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No contact (optional)</option>
                {filteredContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name} - {contact.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Close Date & Probability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Expected Close Date
                </label>
                <input
                  type="date"
                  {...register('expected_close_date')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Probability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { 
                    setValueAs: (v) => v === '' ? undefined : Number(v) 
                  })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
                {errors.probability && (
                  <p className="text-xs text-red-600 mt-1">{errors.probability.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Additional notes about this deal..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
