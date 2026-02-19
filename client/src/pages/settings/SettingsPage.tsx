import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { useTenantStore } from '@/stores/tenantStore';
import { TenantInfoCard } from './components/TenantInfoCard';
import { UsersManagementCard } from './components/UsersManagementCard';
import { AuditLogsCard } from './components/AuditLogsCard';
import { Skeleton } from '@/components/ui/skeleton';

export const SettingsPage = () => {
  const { fetchTenantInfo, tenantInfo, isLoading } = useTenantStore();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchTenantInfo();
      setInitialLoad(false);
    };
    loadData();
  }, [fetchTenantInfo]);

  if (initialLoad && isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your organization settings, users, and view activity logs.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tenant Info - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TenantInfoCard tenant={tenantInfo} />
          </div>

          {/* Users Management - Takes full width below */}
          <div className="lg:col-span-3">
            <UsersManagementCard />
          </div>

          {/* Audit Logs - Takes full width */}
          <div className="lg:col-span-3">
            <AuditLogsCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
