import { AppLayout } from '@/components/layout';
import { Users, Building2, Activity, TrendingUp } from 'lucide-react';

// Placeholder statistics - will be replaced with real data from API
const statistics = [
  {
    name: 'Total Contacts',
    value: '0',
    icon: Users,
    change: '+0%',
    changeType: 'positive',
  },
  {
    name: 'Active Organizations',
    value: '1',
    icon: Building2,
    change: '+0%',
    changeType: 'positive',
  },
  {
    name: 'Recent Activities',
    value: '0',
    icon: Activity,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Growth Rate',
    value: '0%',
    icon: TrendingUp,
    change: '+0%',
    changeType: 'positive',
  },
];

export const DashboardPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Here's an overview of your organization.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">More Insights Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're working on adding charts, recent activities, and more detailed analytics to help you
              understand your data better.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/dashboard/contacts/new"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add New Contact</p>
                <p className="text-xs text-muted-foreground">Create a contact</p>
              </div>
            </a>
            
            <a
              href="/dashboard/contacts"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">View All Contacts</p>
                <p className="text-xs text-muted-foreground">Browse contacts</p>
              </div>
            </a>
            
            <a
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Organization Settings</p>
                <p className="text-xs text-muted-foreground">Manage settings</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
