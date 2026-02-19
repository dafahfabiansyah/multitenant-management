import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Plus, TrendingUp, DollarSign, MoreVertical, Pencil, Trash2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useDealStore } from '@/stores/dealStore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Deal } from '@/types';
import { DealFormDialog } from './components/DealFormDialog';
import { StageManagementDialog } from './components/StageManagementDialog';
import { toast } from 'sonner';

export const PipelinePage = () => {
  const { stages, fetchStages, isLoading: stagesLoading } = usePipelineStore();
  const { deals, fetchDeals, fetchPipelineValues, pipelineValues, moveDeal, deleteDeal, updateDealStatus, isLoading: dealsLoading } = useDealStore();
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showStageManagement, setShowStageManagement] = useState(false);

  useEffect(() => {
    fetchStages();
    fetchDeals(); // Remove status filter temporarily to see all deals
    fetchPipelineValues();
  }, [fetchStages, fetchDeals, fetchPipelineValues]);

  const getDealsByStage = (stageId: number): Deal[] => {
    const filtered = deals.filter(deal => {
      // Handle both nested stage object and primitive stage_id
      const dealStageId = deal.stage?.id || deal.stage_id;
      return dealStageId === stageId;
    });
    return filtered;
  };

  const formatCurrency = (value: number, currency: string = 'IDR'): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stageId: number) => {
    if (!draggedDeal) {
      return;
    }
    
    // Handle nested stage object
    const currentStageId = draggedDeal.stage?.id || draggedDeal.stage_id;
    if (currentStageId === stageId) {
      setDraggedDeal(null);
      return;
    }

    const dealId = draggedDeal.id;

    try {
      // Move deal and refresh to get updated data from backend
      await moveDeal(dealId, stageId);
      await fetchPipelineValues();
      
      toast.success('Deal moved successfully');
    } catch (error) {
      toast.error('Failed to move deal');
    }
    setDraggedDeal(null);
  };

  const totalPipelineValue = Object.values(pipelineValues).reduce((sum, val) => sum + val, 0);

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setShowDealDialog(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDialog(true);
    setOpenMenuId(null);
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      await deleteDeal(dealId);
      // Store already auto-refreshes deals after deletion
      await fetchPipelineValues();
      toast.success('Deal deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete deal');
    }
    setOpenMenuId(null);
  };

  const handleMarkAsWon = async (dealId: number) => {
    try {
      await updateDealStatus(dealId, 'won');
      // Store already auto-refreshes deals after status update
      await fetchPipelineValues();
      toast.success('Deal marked as won! 🎉');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update deal status');
    }
    setOpenMenuId(null);
  };

  const handleMarkAsLost = async (dealId: number) => {
    try {
      await updateDealStatus(dealId, 'lost');
      // Store already auto-refreshes deals after status update
      await fetchPipelineValues();
      toast.success('Deal marked as lost');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update deal status');
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (dealId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === dealId ? null : dealId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your sales opportunities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStageManagement(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              Manage Stages
            </button>
            <button
              onClick={handleCreateDeal}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Deal
            </button>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold text-foreground">{deals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(totalPipelineValue)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Deal Value</p>
                <p className="text-xl font-bold text-foreground">
                  {deals.length > 0 ? formatCurrency(totalPipelineValue / deals.length) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {stagesLoading || dealsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {stages.sort((a, b) => a.order - b.order).map((stage) => {
                const stageDeals = getDealsByStage(stage.id);
                const stageValue = pipelineValues[stage.id] || 0;

                return (
                  <div
                    key={stage.id}
                    className="shrink-0 w-80 rounded-lg border border-border bg-card"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(stage.id)}
                  >
                    {/* Stage Header */}
                    <div 
                      className="p-4 border-b border-border"
                      style={{ borderTopColor: stage.color, borderTopWidth: '3px' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                        <span className="text-xs font-medium text-muted-foreground">
                          {stage.probability}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{stageDeals.length} deals</span>
                        <span className="font-medium">{formatCurrency(stageValue)}</span>
                      </div>
                    </div>

                    {/* Deal Cards */}
                    <div className="p-3 space-y-2 max-h-150 overflow-y-auto">
                      {stageDeals.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No deals in this stage
                        </p>
                      ) : (
                        stageDeals.map((deal) => (
                          <div
                            key={deal.id}
                            draggable
                            onDragStart={() => handleDragStart(deal)}
                            className="p-3 rounded-lg border border-border bg-background hover:shadow-md transition-shadow cursor-move relative group"
                          >
                            {/* Actions Menu Button */}
                            <button
                              onClick={(e) => toggleMenu(deal.id, e)}
                              className="absolute top-2 right-2 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuId === deal.id && (
                              <div
                                className="absolute right-2 top-8 bg-background border border-border rounded-lg shadow-lg py-1 min-w-40"
                                style={{ zIndex: 100 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleEditDeal(deal)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit Deal
                                </button>
                                <button
                                  onClick={() => handleMarkAsWon(deal.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-green-600"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Mark as Won
                                </button>
                                <button
                                  onClick={() => handleMarkAsLost(deal.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-orange-600"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Mark as Lost
                                </button>
                                <div className="border-t border-border my-1" />
                                <button
                                  onClick={() => handleDeleteDeal(deal.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}

                            <h4 className="font-medium text-sm text-foreground mb-1 truncate pr-6">
                              {deal.title}
                            </h4>
                            <p className="text-lg font-bold text-primary mb-2">
                              {formatCurrency(deal.value, deal.currency)}
                            </p>
                            {deal.contact && (
                              <p className="text-xs text-muted-foreground truncate">
                                {deal.contact.first_name} {deal.contact.last_name}
                              </p>
                            )}
                            {deal.expected_close_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Stage Management Dialog */}
        <StageManagementDialog
          open={showStageManagement}
          onOpenChange={setShowStageManagement}
        />
        {/* Deal Form Dialog */}
        <DealFormDialog
          open={showDealDialog}
          onOpenChange={(open) => {
            setShowDealDialog(open);
            if (!open) setSelectedDeal(null);
          }}
          deal={selectedDeal}
        />

        {/* Stage Management Dialog */}
        <StageManagementDialog
          open={showStageManagement}
          onOpenChange={setShowStageManagement}
        />
      </div>
    </AppLayout>
  );
};
