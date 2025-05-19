import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@/types";
import { Link } from "wouter";
import { CalendarIcon, File, IdCardIcon } from "lucide-react";

export function Notifications() {
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample reminders for initial UI
  const sampleReminders = [
    {
      id: 1,
      userId: 1,
      title: "Credit Bureau Response Deadline",
      message: "Follow up required for Experian dispute if no response received by May 20, 2025.",
      type: "Alert",
      isRead: false,
      createdAt: "2025-05-15",
      dueDate: "2025-05-20"
    },
    {
      id: 2,
      userId: 1,
      title: "Monthly Credit Report Check",
      message: "Schedule to review your monthly credit report from all three bureaus to track changes.",
      type: "Reminder",
      isRead: false,
      createdAt: "2025-05-18",
      dueDate: "2025-05-23"
    },
    {
      id: 3,
      userId: 1,
      title: "EIN Application Status Check",
      message: "Follow up on your EIN application with the IRS if no response has been received.",
      type: "Update",
      isRead: false,
      createdAt: "2025-05-18",
      dueDate: "2025-05-25"
    }
  ];
  
  const displayReminders = notifications.length ? notifications : sampleReminders;
  
  // Function to get appropriate icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Alert':
        return <CalendarIcon className="text-red-600" />;
      case 'Reminder':
        return <File className="text-yellow-600" />;
      case 'Update':
        return <IdCardIcon className="text-blue-600" />;
      default:
        return <CalendarIcon className="text-gray-600" />;
    }
  };
  
  // Function to get appropriate bg color based on notification type
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'Alert':
        return 'bg-red-100';
      case 'Reminder':
        return 'bg-yellow-100';
      case 'Update':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  // Function to calculate due days
  const calculateDueDays = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const differenceInTime = due.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    if (differenceInDays === 0) return "Due Today";
    if (differenceInDays === 1) return "Due Tomorrow";
    if (differenceInDays < 0) return "Overdue";
    return `In ${differenceInDays} days`;
  };
  
  // Function to get badge color based on due days
  const getDueBadgeColor = (dueText: string | null) => {
    if (!dueText) return 'bg-gray-100 text-gray-800';
    if (dueText === "Due Today" || dueText === "Due Tomorrow" || dueText === "Overdue") 
      return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Alerts & Reminders</h2>
        <Link href="/notifications">
          <Button variant="link" className="flex items-center text-primary text-sm font-medium">
            <span>View all</span>
            <i className="fas fa-chevron-right ml-1 text-xs"></i>
          </Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : displayReminders.length > 0 ? (
            displayReminders.map(reminder => {
              const dueText = calculateDueDays(reminder.dueDate);
              return (
                <div key={reminder.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`mr-4 p-2 ${getNotificationBgColor(reminder.type)} rounded-full`}>
                      {getNotificationIcon(reminder.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{reminder.title}</h4>
                        {dueText && (
                          <span className={`text-xs font-medium ${getDueBadgeColor(dueText)} px-2 py-0.5 rounded-full`}>
                            {dueText}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reminder.message}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <i className="fas fa-clock mr-1"></i>
                        <span>
                          {reminder.dueDate 
                            ? `Reminder set for ${formatDate(reminder.dueDate)}`
                            : `Created on ${formatDate(reminder.createdAt)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              No upcoming alerts or reminders.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
