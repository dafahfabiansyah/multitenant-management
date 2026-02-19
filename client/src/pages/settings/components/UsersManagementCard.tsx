import { useEffect, useState } from 'react';
import { Users, Search, UserPlus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useTenantStore } from '@/stores/tenantStore';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { RemoveUserDialog } from './RemoveUserDialog';
import type { TenantUser, UserRole } from '@/types';

export const UsersManagementCard = () => {
  const { tenantUsers, fetchTenantUsers, isLoading, pagination } = useTenantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTenantUsers(currentPage, 20);
  }, [fetchTenantUsers, currentPage]);

  // Filter users based on search and role
  const filteredUsers = tenantUsers.filter((tenantUser) => {
    const matchesSearch = 
      tenantUser.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantUser.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || tenantUser.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleChangeRole = (user: TenantUser) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
    setOpenMenuUserId(null);
  };

  const handleRemoveUser = (user: TenantUser) => {
    setSelectedUser(user);
    setShowRemoveDialog(true);
    setOpenMenuUserId(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setOpenMenuUserId(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Users Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage user roles and permissions
              </p>
            </div>
          </div>
          
          <button
            className="flex items-center gap-2 rounded-lg border border-dashed border-primary bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            title="Coming Soon - Backend endpoint needed"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No users in this organization yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((tenantUser) => (
                  <tr key={tenantUser.id} className="group hover:bg-accent/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {tenantUser.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tenantUser.user?.full_name || '-'}</p>
                          <p className="text-xs text-muted-foreground">{tenantUser.user?.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getRoleBadgeColor(tenantUser.role)}`}>
                        {tenantUser.role.charAt(0).toUpperCase() + tenantUser.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-foreground">
                        {tenantUser.created_at ? new Date(tenantUser.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : '-'}
                      </p>
                    </td>
                    <td className="py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuUserId(openMenuUserId === tenantUser.id ? null : tenantUser.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuUserId === tenantUser.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuUserId(null)}
                            />
                            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
                              <div className="py-1">
                                <button
                                  onClick={() => handleChangeRole(tenantUser)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                  Change Role
                                </button>
                                <button
                                  onClick={() => handleRemoveUser(tenantUser)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove User
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {pagination.users.total} users
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
                Page {currentPage} of {Math.ceil(pagination.users.total / pagination.users.page_size)}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(pagination.users.total / pagination.users.page_size)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <ChangeRoleDialog
            open={showRoleDialog}
            onOpenChange={setShowRoleDialog}
            user={selectedUser}
          />
          <RemoveUserDialog
            open={showRemoveDialog}
            onOpenChange={setShowRemoveDialog}
            user={selectedUser}
          />
        </>
      )}
    </>
  );
};
