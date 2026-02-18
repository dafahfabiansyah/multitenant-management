import { Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const Header = () => {
  const { tenant } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {tenant?.name || 'Organization'}
        </span>
        <span className={`
          inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
          ${tenant?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
        `}>
          {tenant?.status || 'Active'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications - placeholder for now */}
        <button
          className="relative rounded-full p-2 hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {/* Notification badge - uncomment when implementing notifications
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"></span>
          */}
        </button>
      </div>
    </header>
  );
};
