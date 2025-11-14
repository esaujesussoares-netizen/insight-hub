import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  variant?: "fitness" | "nutrition" | "default";
  className?: string;
}

export function StatCard({ icon, title, value, change, variant = "default", className }: StatCardProps) {
  const variantClasses = {
    fitness: "glass-card border-primary/20 hover:border-primary/40 transition-smooth cursor-pointer hover:scale-105",
    nutrition: "glass-card border-secondary/20 hover:border-secondary/40 transition-smooth cursor-pointer hover:scale-105",
    default: "glass-card border-border hover:border-muted-foreground/40 transition-smooth cursor-pointer hover:scale-105"
  };

  const iconClasses = {
    fitness: "text-primary",
    nutrition: "text-secondary",
    default: "text-muted-foreground"
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", 
            variant === "fitness" && "bg-gradient-fitness-subtle",
            variant === "nutrition" && "bg-gradient-nutrition-subtle",
            variant === "default" && "bg-muted"
          )}>
            <div className={iconClasses[variant]}>
              {icon}
            </div>
          </div>
          {change && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              change.startsWith('+') ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
            )}>
              {change}
            </span>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}