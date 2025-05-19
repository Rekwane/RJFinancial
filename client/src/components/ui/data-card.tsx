import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataCardIconProps = {
  icon: React.ReactNode;
  color: string;
};

type DataCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  details?: string;
  className?: string;
};

const DataCardIcon = ({ icon, color }: DataCardIconProps) => (
  <div className={cn("p-3 rounded-full", color)}>
    {icon}
  </div>
);

export function DataCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  trend,
  details,
  className
}: DataCardProps) {
  const trendColorClass = 
    trend?.direction === 'up' 
      ? 'text-green-600' 
      : trend?.direction === 'down' 
        ? 'text-red-600' 
        : 'text-gray-600';

  const trendIcon = 
    trend?.direction === 'up' 
      ? <i className="fas fa-arrow-up mr-1"></i> 
      : trend?.direction === 'down' 
        ? <i className="fas fa-arrow-down mr-1"></i> 
        : null;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <DataCardIcon
            icon={icon}
            color={iconBgColor}
          />
        </div>
        {(trend || details) && (
          <div className="mt-4">
            {details && (
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", iconColor)} 
                  style={{ width: typeof details === 'string' && details.includes('%') ? details : '100%' }}>
                </div>
              </div>
            )}
            {trend && (
              <p className={cn("text-xs mt-2", trendColorClass)}>
                {trendIcon}
                <span>{trend.value}</span>
              </p>
            )}
            {!trend && details && (
              <p className="text-gray-600 text-xs mt-2">
                <span>{details}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
