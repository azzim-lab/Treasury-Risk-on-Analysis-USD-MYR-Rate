import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral', 
  icon,
  className 
}: MetricsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (Math.abs(val) >= 1000000) {
        return `$${(val / 1000000).toFixed(2)}M`;
      } else if (Math.abs(val) >= 1000) {
        return `$${(val / 1000).toFixed(0)}K`;
      }
      return `$${val.toFixed(0)}`;
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-profit';
      case 'negative':
        return 'text-loss';
      default:
        return 'text-neutral';
    }
  };

  return (
    <Card className={cn(
      "bg-gradient-card shadow-elegant border-border/50 p-6 hover:shadow-glow transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className={cn("text-2xl font-bold", getTrendColor())}>
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-muted-foreground/60">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}