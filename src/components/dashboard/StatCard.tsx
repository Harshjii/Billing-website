import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: "primary" | "accent" | "success";
}

export const StatCard = ({ title, value, icon: Icon, trend, color }: StatCardProps) => {
  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
  };

  const bgClasses = {
    primary: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20",
    accent: "bg-gradient-to-br from-accent/20 to-accent/10 border-accent/20",
    success: "bg-gradient-to-br from-success/20 to-success/10 border-success/20",
  };

  return (
    <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-none">{value}</p>
          <p className={`text-sm font-medium ${colorClasses[color]} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {trend}
          </p>
        </div>
        <div className={`p-3 sm:p-4 rounded-xl ${bgClasses[color]} flex-shrink-0 border group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${colorClasses[color]}`} />
        </div>
      </div>
    </Card>
  );
};
