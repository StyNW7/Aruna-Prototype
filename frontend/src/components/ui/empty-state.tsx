import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-aruna-border bg-aruna-light1/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-aruna-secondary shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-aruna-text">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-aruna-textSecondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
