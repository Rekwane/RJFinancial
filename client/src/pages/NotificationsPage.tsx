import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BellRing, Search, CheckCircle, Clock, BellOff, CalendarDays, MoreVertical, AlertCircle, Bell, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { add, format, isBefore, isEqual, isSameDay, startOfToday } from "date-fns";

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  // Query for notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample notifications for UI display
  const sampleNotifications = [
    {
      id: 1,
      userId: 1,
      title: "Credit Bureau Response Deadline",
      message: "Follow up required for Experian dispute if no response received by May 20, 2025.",
      type: "Alert",
      isRead: false,
      createdAt: "2025-05-15T10:30:00Z",
      dueDate: "2025-05-20T23:59:59Z"
    },
    {
      id: 2,
      userId: 1,
      title: "Monthly Credit Report Check",
      message: "Schedule to review your monthly credit report from all three bureaus to track changes.",
      type: "Reminder",
      isRead: false,
      createdAt: "2025-05-18T08:15:00Z",
      dueDate: "2025-05-23T23:59:59Z"
    },
    {
      id: 3,
      userId: 1,
      title: "EIN Application Status Check",
      message: "Follow up on your EIN application with the IRS if no response has been received.",
      type: "Update",
      isRead: false,
      createdAt: "2025-05-18T14:45:00Z",
      dueDate: "2025-05-25T23:59:59Z"
    },
    {
      id: 4,
      userId: 1,
      title: "Credit Score Increased",
      message: "Your TransUnion credit score has increased by 15 points since last month.",
      type: "Update",
      isRead: true,
      createdAt: "2025-05-12T09:20:00Z",
      dueDate: null
    },
    {
      id: 5,
      userId: 1,
      title: "Trust Document Created",
      message: "Your Living Trust document has been successfully created and saved to your documents.",
      type: "Update",
      isRead: true,
      createdAt: "2025-05-10T16:05:00Z",
      dueDate: null
    },
    {
      id: 6,
      userId: 1,
      title: "Bill Payment Reminder",
      message: "Your credit card payment is due in 5 days. Remember to make your payment on time to avoid late fees.",
      type: "Reminder",
      isRead: false,
      createdAt: "2025-05-08T11:30:00Z",
      dueDate: "2025-05-27T23:59:59Z"
    }
  ];
  
  const displayNotifications = notifications.length ? notifications : sampleNotifications;
  
  // Filter notifications based on active tab, search query, and filters
  const getFilteredNotifications = () => {
    let filtered = [...displayNotifications];
    
    // Apply read/unread filter based on tab
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.isRead);
    }
    
    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(n => n.type === filterType);
    }
    
    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(n => {
        const createdDate = new Date(n.createdAt);
        return isSameDay(createdDate, dateFilter);
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }
    
    // Sort by created date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to mark notification as read: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Function to handle marking a notification as read
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
    
    // Optimistically update the UI
    const notification = displayNotifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    }
  };
  
  // Function to open notification details
  const handleOpenNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    
    // Mark as read when opened
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };
  
  // Function to determine notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'Reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Update':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Function to determine notification background color
  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'Alert':
        return 'bg-red-50';
      case 'Reminder':
        return 'bg-yellow-50';
      case 'Update':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  // Function to determine badge color
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Alert':
        return 'bg-red-100 text-red-800';
      case 'Reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'Update':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = startOfToday();
    
    // If it's today, show time
    if (isSameDay(date, today)) {
      return format(date, "'Today at' h:mm a");
    }
    
    // If it's yesterday
    const yesterday = add(today, { days: -1 });
    if (isSameDay(date, yesterday)) {
      return format(date, "'Yesterday at' h:mm a");
    }
    
    // Otherwise show full date
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };
  
  // Calculate due status
  const getDueStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const today = new Date();
    
    if (isBefore(due, today)) {
      return { text: "Overdue", color: "text-red-600 bg-red-100" };
    }
    
    const diffInDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return { text: "Due Today", color: "text-red-600 bg-red-100" };
    } else if (diffInDays === 1) {
      return { text: "Due Tomorrow", color: "text-yellow-600 bg-yellow-100" };
    } else if (diffInDays <= 7) {
      return { text: `Due in ${diffInDays} days`, color: "text-blue-600 bg-blue-100" };
    } else {
      return { text: format(due, "Due MMM d"), color: "text-gray-600 bg-gray-100" };
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    // In a real implementation, this would call an API endpoint
    // that marks all notifications as read
    
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
    
    // Refresh notifications list
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType(null);
    setDateFilter(null);
    setActiveTab("all");
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications & Alerts</h1>
        <p className="text-gray-600 mt-1">Stay on top of important updates and reminders.</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Input
            className="pl-10"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex space-x-2">
          <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Alert">Alerts</SelectItem>
              <SelectItem value="Reminder">Reminders</SelectItem>
              <SelectItem value="Update">Updates</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={dateFilter ? "border-primary" : ""}>
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "MMM d, yyyy") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter || undefined}
                onSelect={setDateFilter}
                initialFocus
              />
              {dateFilter && (
                <div className="p-3 border-t border-gray-200">
                  <Button variant="ghost" size="sm" onClick={() => setDateFilter(null)}>
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {(searchQuery || filterType || dateFilter) && (
            <Button variant="ghost" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center">
                All
                <Badge className="ml-2" variant="outline">
                  {displayNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center">
                Unread
                <Badge className="ml-2" variant="outline">
                  {displayNotifications.filter(n => !n.isRead).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center">
                Read
                <Badge className="ml-2" variant="outline">
                  {displayNotifications.filter(n => n.isRead).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex justify-between items-center my-4">
              <div>
                <h2 className="text-lg font-medium">{activeTab === "all" ? "All Notifications" : activeTab === "unread" ? "Unread Notifications" : "Read Notifications"}</h2>
                <p className="text-sm text-gray-500">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {activeTab === "unread" && displayNotifications.some(n => !n.isRead) && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              )}
            </div>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BellRing className="h-12 w-12 animate-pulse text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Loading notifications...</h3>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {filteredNotifications.map(notification => {
                        const dueStatus = notification.dueDate ? getDueStatus(notification.dueDate) : null;
                        
                        return (
                          <div 
                            key={notification.id} 
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${getNotificationBgColor(notification.type, notification.isRead)}`}
                            onClick={() => handleOpenNotification(notification)}
                          >
                            <div className="flex items-start">
                              <div className={`mr-4 p-2 ${
                                notification.type === 'Alert' ? 'bg-red-100' :
                                notification.type === 'Reminder' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              } rounded-full`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className={`font-medium truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h4>
                                  {dueStatus && (
                                    <Badge variant="outline" className={`ml-2 ${dueStatus.color}`}>
                                      {dueStatus.text}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm mb-2 line-clamp-2 ${!notification.isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatNotificationDate(notification.createdAt)}</span>
                                  </div>
                                  <Badge variant="outline" className={getBadgeColor(notification.type)}>
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead ? (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      // This would call an API to mark as unread in a real implementation
                                    }}>
                                      <BellRing className="mr-2 h-4 w-4" />
                                      Mark as unread
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    // This would call an API to dismiss in a real implementation
                                  }}>
                                    <BellOff className="mr-2 h-4 w-4" />
                                    Dismiss
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchQuery || filterType || dateFilter
                        ? "Try adjusting your filters to see more notifications."
                        : activeTab === "unread"
                        ? "You're all caught up! No unread notifications."
                        : activeTab === "read"
                        ? "You haven't read any notifications yet."
                        : "You don't have any notifications yet."}
                    </p>
                    {(searchQuery || filterType || dateFilter) && (
                      <Button onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-primary" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Notification Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Alerts</span>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm">Reminders</span>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">Updates</span>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-3">Delivery Methods</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In-app notifications</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email notifications</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS notifications</span>
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-3">Notification Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credit dispute updates</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credit score changes</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document alerts</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bill reminders</span>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Notification Detail Dialog */}
      {selectedNotification && (
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className={`mr-2 ${getBadgeColor(selectedNotification.type)}`}
                >
                  {selectedNotification.type}
                </Badge>
                <DialogTitle>{selectedNotification.title}</DialogTitle>
              </div>
              <DialogDescription className="flex items-center">
                {formatNotificationDate(selectedNotification.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedNotification.message}</p>
              </div>
              
              {selectedNotification.dueDate && (
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    Due date: {format(new Date(selectedNotification.dueDate), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
              
              <div className="flex space-x-2">
                {selectedNotification.type === "Reminder" && (
                  <Button>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Set Reminder
                  </Button>
                )}
                
                {selectedNotification.type === "Alert" && (
                  <Button>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Take Action
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
