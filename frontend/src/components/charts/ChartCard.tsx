import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  footnote?: string;
}

export function ChartCard({ title, description, action, children, className, footnote }: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 pt-2">{children}</CardContent>
      {footnote && (
        <div className="border-t border-aruna-border px-5 py-2.5 text-xs text-aruna-textSecondary">{footnote}</div>
      )}
    </Card>
  );
}
