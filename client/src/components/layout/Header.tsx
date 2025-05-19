import { useState } from "react";
import { Bell, ChevronDown, Menu, Search, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Notification } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // For a real app, this would use the user ID from an auth context
  const userId = 1; // Placeholder
  
  // Query for notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-800 hidden md:inline-block">FinancialAI</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search..."
                className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <span className={`${
                            notification.type === 'Alert'
                              ? 'bg-primary bg-opacity-10 text-primary'
                              : notification.type === 'Reminder'
                                ? 'bg-secondary bg-opacity-10 text-secondary'
                                : 'bg-warning bg-opacity-10 text-warning'
                          } p-2 rounded-full`}>
                            {notification.type === 'Alert' ? (
                              <i className="fas fa-file-alt text-sm"></i>
                            ) : notification.type === 'Reminder' ? (
                              <i className="fas fa-chart-line text-sm"></i>
                            ) : (
                              <i className="fas fa-exclamation-triangle text-sm"></i>
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
                
                <div className="px-4 py-2 text-center">
                  <Link href="/notifications" className="text-primary text-sm font-medium">
                    View all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">John Doe</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem>
                  <i className="fas fa-user-circle mr-2 text-gray-500"></i> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <i className="fas fa-cog mr-2 text-gray-500"></i> Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <i className="fas fa-question-circle mr-2 text-gray-500"></i> Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <i className="fas fa-sign-out-alt mr-2"></i> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
