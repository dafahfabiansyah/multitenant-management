import { AppLayout } from '@/components/layout';
import { Settings } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your organization settings, users, and audit logs.
          </p>
        </div>

        {/* Placeholder */}
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Organization Settings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenant settings, user management, and audit logs will be implemented in Phase 4.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
