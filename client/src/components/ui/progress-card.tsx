import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  progress: number; // 0-100
  children: React.ReactNode;
  action?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  className?: string;
}

export function ProgressCard({
  title,
  progress,
  children,
  action,
  secondaryAction,
  className
}: ProgressCardProps) {
  return (
    <Card className={cn("bg-white rounded-lg shadow overflow-hidden", className)}>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="font-medium">{title}</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <div className="text-sm text-gray-600 mb-1">Overall progress</div>
            <div className="flex items-center">
              <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden mr-3">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progress}%` }}>
                </div>
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
          
          {(action || secondaryAction) && (
            <div className="flex items-center space-x-2">
              {action && (
                <Button 
                  onClick={action.onClick}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.text}
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  {secondaryAction.icon && <span className="mr-1">{secondaryAction.icon}</span>}
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {children}
      </CardContent>
    </Card>
  );
}
