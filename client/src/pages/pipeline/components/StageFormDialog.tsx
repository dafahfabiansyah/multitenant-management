import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import type { PipelineStage } from '@/types';
import { toast } from 'sonner';
import { pipelineStageSchema, type PipelineStageFormData } from '@/lib/validations';

interface StageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage?: PipelineStage | null;
}

export const StageFormDialog = ({ open, onOpenChange, stage }: StageFormDialogProps) => {
  const { createStage, updateStage, stages, isLoading } = usePipelineStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PipelineStageFormData>({
    resolver: zodResolver(pipelineStageSchema),
    defaultValues: stage
      ? {
          name: stage.name,
          probability: stage.probability,
          color: stage.color,
          is_closed_won: stage.is_closed_won,
          is_closed_lost: stage.is_closed_lost,
        }
      : {
          name: '',
          probability: 50,
          color: '#8B5CF6',
          is_closed_won: false,
          is_closed_lost: false,
        },
  });

  useEffect(() => {
    if (stage) {
      reset({
        name: stage.name,
        probability: stage.probability,
        color: stage.color,
        is_closed_won: stage.is_closed_won,
        is_closed_lost: stage.is_closed_lost,
      });
    } else {
      reset({
        name: '',
        probability: 50,
        color: '#8B5CF6',
        is_closed_won: false,
        is_closed_lost: false,
      });
    }
  }, [stage, reset]);

  const onSubmit = async (data: PipelineStageFormData) => {
    try {
      if (stage) {
        await updateStage(stage.id, data);
        toast.success('Stage updated successfully');
      } else {
        // Calculate next order number for new stage
        const nextOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 1;
        await createStage({ ...data, order: nextOrder });
        toast.success('Custom stage created successfully');
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save stage');
    }
  };

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
          className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-xl font-semibold text-foreground">
              {stage ? 'Edit Stage' : 'Create Custom Stage'}
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
            {/* Stage Note */}
            {!stage && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-800 dark:text-blue-200">
                💡 You can create custom stages between the 6 default stages
              </div>
            )}

            {/* Default Stage Warning */}
            {stage?.is_default && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ This is a default stage. You can only edit its name, color, and probability.
              </div>
            )}

            {/* Stage Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Stage Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Demo Scheduled"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Probability */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Probability (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('probability', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="50"
              />
              {errors.probability && (
                <p className="text-xs text-red-600 mt-1">{errors.probability.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Win probability for deals in this stage
              </p>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Stage Color *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register('color')}
                  className="h-10 w-20 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  {...register('color')}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#8B5CF6"
                />
              </div>
              {errors.color && (
                <p className="text-xs text-red-600 mt-1">{errors.color.message}</p>
              )}
            </div>

            {/* Terminal Stage Flags */}
            {!stage?.is_default && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="is_closed_won"
                    {...register('is_closed_won')}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <label htmlFor="is_closed_won" className="text-sm font-medium text-foreground cursor-pointer">
                      Closed Won Stage
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deals moved here will be marked as "won"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="is_closed_lost"
                    {...register('is_closed_lost')}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <label htmlFor="is_closed_lost" className="text-sm font-medium text-foreground cursor-pointer">
                      Closed Lost Stage
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deals moved here will be marked as "lost"
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                {isLoading ? 'Saving...' : stage ? 'Update Stage' : 'Create Stage'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
