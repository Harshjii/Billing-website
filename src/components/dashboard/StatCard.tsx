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
    <Card className="bg-card border-border shadow-card p-3 rounded-2xl hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{value}</p>
          <p className={`text-xs font-medium ${colorClasses[color]} flex items-center gap-1`}>
            <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
            {trend}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${bgClasses[color]} flex-shrink-0 border group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClasses[color]}`} />
        </div>
      </div>
    </Card>
  );
};
