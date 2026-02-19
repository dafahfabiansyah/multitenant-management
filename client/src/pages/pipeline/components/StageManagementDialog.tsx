import { useState } from 'react';
import { X, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import type { PipelineStage } from '@/types';
import { StageFormDialog } from './StageFormDialog';
import { toast } from 'sonner';

interface StageManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StageManagementDialog = ({ open, onOpenChange }: StageManagementDialogProps) => {
  const { stages, deleteStage, isLoading } = usePipelineStore();
  const [showStageForm, setShowStageForm] = useState(false);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const handleCreateStage = () => {
    setSelectedStage(null);
    setShowStageForm(true);
  };

  const handleEditStage = (stage: PipelineStage) => {
    setSelectedStage(stage);
    setShowStageForm(true);
  };

  const handleDeleteStage = async (stage: PipelineStage) => {
    if (stage.is_default) {
      toast.error('Cannot delete default stages');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${stage.name}" stage?`)) return;

    try {
      await deleteStage(stage.id);
      toast.success('Stage deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete stage');
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
          className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Pipeline Stages</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your sales pipeline stages
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Info Card */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>6 default stages</strong> are automatically created for you. You can add custom stages, 
                edit colors and probabilities, but cannot delete default stages if deals exist in them.
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateStage}
              className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors mb-4"
            >
              <Plus className="h-4 w-4" />
              Add Custom Stage
            </button>

            {/* Stages List */}
            <div className="space-y-2">
              {stages
                .sort((a, b) => a.order - b.order)
                .map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Drag Handle */}
                    <div className="text-muted-foreground cursor-move">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Color Indicator */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />

                    {/* Stage Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{stage.name}</h3>
                        {stage.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Default
                          </span>
                        )}
                        {stage.is_closed_won && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                            Closed Won
                          </span>
                        )}
                        {stage.is_closed_lost && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">
                            Closed Lost
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stage.probability}% probability • Order: {stage.order}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStage(stage)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit stage"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage)}
                        disabled={stage.is_default || isLoading}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={stage.is_default ? 'Cannot delete default stages' : 'Delete stage'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-xs text-muted-foreground text-center">
              Drag stages to reorder them in your pipeline (coming soon)
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Stage Form Dialog */}
      <StageFormDialog
        open={showStageForm}
        onOpenChange={(open) => {
          setShowStageForm(open);
          if (!open) setSelectedStage(null);
        }}
        stage={selectedStage}
      />
    </>
  );
};
