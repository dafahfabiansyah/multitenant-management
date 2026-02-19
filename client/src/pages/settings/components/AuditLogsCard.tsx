import { useEffect, useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';
import { useTenantStore } from '@/stores/tenantStore';
import { Skeleton } from '@/components/ui/skeleton';

export const AuditLogsCard = () => {
  const { auditLogs, fetchAuditLogs, isLoading, pagination } = useTenantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs(currentPage, 20);
  }, [fetchAuditLogs, currentPage]);

  // Get unique actions and resources for filters
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueResources = Array.from(new Set(auditLogs.map(log => log.resource)));

  // Filter logs based on search and filters
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id.toString().includes(searchQuery);
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
    
    return matchesSearch && matchesAction && matchesResource;
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return 'bg-green-100 text-green-700';
    }
    if (action.includes('delete') || action.includes('remove')) {
      return 'bg-red-100 text-red-700';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Audit Logs</h3>
          <p className="text-sm text-muted-foreground">
            Track all activities in your organization
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Action Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 appearance-none"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Filter */}
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="all">All Resources</option>
          {uniqueResources.map((resource) => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No audit logs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery || actionFilter !== 'all' || resourceFilter !== 'all'
              ? 'Try adjusting your filters' 
              : 'No activities recorded yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Resource
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User ID
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/50 transition-colors">
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-foreground capitalize">
                      {log.resource}
                      {log.resource_id && (
                        <span className="text-xs text-muted-foreground ml-1">#{log.resource_id}</span>
                      )}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-foreground">User #{log.user_id}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-muted-foreground font-mono">
                      {log.ip_address || '-'}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-foreground">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {pagination.logs.total} logs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-foreground">
              Page {currentPage} of {Math.ceil(pagination.logs.total / pagination.logs.page_size)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(pagination.logs.total / pagination.logs.page_size)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
