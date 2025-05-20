import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  FileText, 
  Filter, 
  MessageSquare, 
  Plus, 
  Search,
  User,
  Briefcase,
  Calendar,
  XCircle,
  PauseCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for service tasks
interface ServiceTask {
  id: number;
  serviceType: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  status: string;
  priority: string;
  deadline: string | null;
  completedDate: string | null;
  assignedDate: string;
  assignedToId: number | null;
  assignedToName: string | null;
  progressPercentage: number;
  notes: string | null;
  lastUpdateDate: string | null;
}

// Types for updates
interface ProgressUpdate {
  id: number;
  date: string;
  percentage: number;
  description: string;
  createdBy: string;
  attachmentUrl: string | null;
}

// Sample data
const sampleTasks: ServiceTask[] = [
  {
    id: 1,
    serviceType: "Credit Restoration",
    client: {
      id: 101,
      name: "James Wilson",
      email: "james.wilson@example.com"
    },
    status: "in_progress",
    priority: "high",
    deadline: "2025-06-15",
    completedDate: null,
    assignedDate: "2025-05-15",
    assignedToId: 1,
    assignedToName: "You",
    progressPercentage: 35,
    notes: "Need to dispute collection accounts with all three bureaus",
    lastUpdateDate: "2025-05-17"
  },
  {
    id: 2,
    serviceType: "Trust Creation & Asset Protection",
    client: {
      id: 102,
      name: "Emily Johnson",
      email: "emily.johnson@example.com"
    },
    status: "pending",
    priority: "normal",
    deadline: "2025-06-20",
    completedDate: null,
    assignedDate: "2025-05-18",
    assignedToId: null,
    assignedToName: null,
    progressPercentage: 0,
    notes: "Client wants to create a trust for real estate holdings",
    lastUpdateDate: null
  },
  {
    id: 3,
    serviceType: "Business Formation",
    client: {
      id: 103,
      name: "Robert Brown",
      email: "robert.brown@example.com"
    },
    status: "on_hold",
    priority: "normal",
    deadline: "2025-06-10",
    completedDate: null,
    assignedDate: "2025-05-10",
    assignedToId: 1,
    assignedToName: "You",
    progressPercentage: 45,
    notes: "Waiting for client to provide Articles of Incorporation draft",
    lastUpdateDate: "2025-05-16"
  },
  {
    id: 4,
    serviceType: "Credit Restoration",
    client: {
      id: 104,
      name: "Sarah Miller",
      email: "sarah.miller@example.com"
    },
    status: "completed",
    priority: "high",
    deadline: "2025-05-15",
    completedDate: "2025-05-14",
    assignedDate: "2025-04-20",
    assignedToId: 1,
    assignedToName: "You",
    progressPercentage: 100,
    notes: "Successfully removed 3 negative items from all bureaus",
    lastUpdateDate: "2025-05-14"
  },
  {
    id: 5,
    serviceType: "Trust Creation & Asset Protection",
    client: {
      id: 105,
      name: "Michael Davis",
      email: "michael.davis@example.com"
    },
    status: "assigned",
    priority: "urgent",
    deadline: "2025-06-01",
    completedDate: null,
    assignedDate: "2025-05-19",
    assignedToId: 1,
    assignedToName: "You",
    progressPercentage: 0,
    notes: "Client needs trust documents ASAP for closing on property",
    lastUpdateDate: null
  }
];

// Update form schema
const updateSchema = z.object({
  progressPercentage: z.number().min(0).max(100),
  description: z.string().min(1, "Please provide an update description"),
  attachment: z.any().optional()
});

// Service comment schema
const commentSchema = z.object({
  comment: z.string().min(1, "Please enter a comment"),
  isInternal: z.boolean().default(false)
});

export default function StaffDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  
  // In a real app, these would be real API calls
  const { data: tasks = sampleTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: false, // Disabled until real API is connected
  });
  
  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      progressPercentage: selectedTask ? selectedTask.progressPercentage : 0,
      description: "",
      attachment: undefined
    }
  });
  
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
      isInternal: false
    }
  });
  
  // Filter tasks based on search, status, and priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      searchQuery === "" || 
      task.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const myTasks = filteredTasks.filter(task => task.assignedToId === 1); // Using user ID 1 for "you"
  const unassignedTasks = filteredTasks.filter(task => task.assignedToId === null);
  const completedTasks = filteredTasks.filter(task => task.status === "completed");
  
  const handleSelectTask = (task: ServiceTask) => {
    setSelectedTask(task);
  };
  
  const handleClaimTask = async (taskId: number) => {
    try {
      // In a real app, this would be an API call
      // await apiRequest(`/api/tasks/${taskId}/claim`, 'POST');
      
      // Mock update for the demo
      toast({
        title: "Task Claimed",
        description: "You have successfully claimed this task.",
      });
      
      // In a real app, this would trigger a refetch:
      // queryClient.invalidateQueries(['/api/tasks']);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim the task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      // In a real app, this would be an API call
      // await apiRequest(`/api/tasks/${taskId}/status`, 'PATCH', { status: newStatus });
      
      // Mock update for the demo
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}.`,
      });
      
      // In a real app, this would trigger a refetch:
      // queryClient.invalidateQueries(['/api/tasks']);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the task status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const onSubmitUpdate = async (data: z.infer<typeof updateSchema>) => {
    if (!selectedTask) return;
    
    try {
      // In a real app, this would be an API call with file upload
      // const formData = new FormData();
      // formData.append('progressPercentage', data.progressPercentage.toString());
      // formData.append('description', data.description);
      // if (data.attachment && data.attachment[0]) {
      //   formData.append('attachment', data.attachment[0]);
      // }
      // await apiRequest(`/api/tasks/${selectedTask.id}/update`, 'POST', formData, true);
      
      // Mock update for the demo
      toast({
        title: "Progress Updated",
        description: `Progress updated to ${data.progressPercentage}% for this task.`,
      });
      
      // Reset form and close dialog
      updateForm.reset();
      setOpenUpdateDialog(false);
      
      // In a real app, this would trigger a refetch:
      // queryClient.invalidateQueries(['/api/tasks']);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the task progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const onSubmitComment = async (data: z.infer<typeof commentSchema>) => {
    if (!selectedTask) return;
    
    try {
      // In a real app, this would be an API call
      // await apiRequest(`/api/tasks/${selectedTask.id}/comments`, 'POST', data);
      
      // Mock update for the demo
      toast({
        title: "Comment Sent",
        description: data.isInternal 
          ? "Internal note added to this task."
          : "Message sent to the client.",
      });
      
      // Reset form and close dialog
      commentForm.reset();
      setOpenMessageDialog(false);
      
      // In a real app, this would trigger a refetch:
      // queryClient.invalidateQueries(['/api/tasks']);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send the message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-green-100 text-green-800">In Progress</Badge>;
      case 'on_hold':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">On Hold</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper function to get appropriate priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Low</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Normal</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Helper function to calculate remaining days
  const getRemainingDays = (deadlineString: string | null) => {
    if (!deadlineString) return null;
    
    const deadline = new Date(deadlineString);
    const today = new Date();
    
    // Set hours to 0 to compare only dates
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-gray-600">Manage client service requests and track progress</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Task List Panel */}
        <div className="md:w-7/12">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Service Tasks</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("unassigned")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Claim New Task
                </Button>
              </div>
              <CardDescription>
                View and manage assigned service tasks
              </CardDescription>
              
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search clients or services"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tasks" className="mt-4">
                  {isLoadingTasks ? (
                    <div className="text-center py-4">Loading tasks...</div>
                  ) : myTasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No tasks found matching your filters
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
                            selectedTask?.id === task.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectTask(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{task.serviceType}</div>
                              <div className="text-sm text-gray-600">Client: {task.client.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              {getStatusBadge(task.status)}
                              <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Deadline: {formatDate(task.deadline)}</span>
                            </div>
                            
                            {task.deadline && (
                              <div className={`flex items-center gap-1 ${
                                (getRemainingDays(task.deadline) || 0) < 0 ? 'text-red-500' :
                                (getRemainingDays(task.deadline) || 0) <= 3 ? 'text-orange-500' : 
                                'text-green-500'
                              }`}>
                                <Clock className="h-3 w-3" />
                                {getRemainingDays(task.deadline) === 0 && <span>Due today</span>}
                                {(getRemainingDays(task.deadline) || 0) < 0 && (
                                  <span>Overdue by {Math.abs(getRemainingDays(task.deadline) || 0)} days</span>
                                )}
                                {(getRemainingDays(task.deadline) || 0) > 0 && (
                                  <span>{getRemainingDays(task.deadline)} days left</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Progress: {task.progressPercentage}%</div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${task.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="unassigned" className="mt-4">
                  {isLoadingTasks ? (
                    <div className="text-center py-4">Loading unassigned tasks...</div>
                  ) : unassignedTasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No unassigned tasks available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unassignedTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
                            selectedTask?.id === task.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectTask(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{task.serviceType}</div>
                              <div className="text-sm text-gray-600">Client: {task.client.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              {getStatusBadge(task.status)}
                              <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Deadline: {formatDate(task.deadline)}</span>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimTask(task.id);
                              }}
                            >
                              Claim Task
                            </Button>
                          </div>
                          
                          <div className="text-sm text-gray-600 italic mt-1">
                            {task.notes || "No additional notes"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4">
                  {isLoadingTasks ? (
                    <div className="text-center py-4">Loading completed tasks...</div>
                  ) : completedTasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No completed tasks found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
                            selectedTask?.id === task.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectTask(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{task.serviceType}</div>
                              <div className="text-sm text-gray-600">Client: {task.client.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              {getStatusBadge(task.status)}
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Completed on {formatDate(task.completedDate)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 italic mt-1">
                            {task.notes || "No additional notes"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Task Details Panel */}
        <div className="md:w-5/12">
          {selectedTask ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedTask.serviceType}</CardTitle>
                      <CardDescription>
                        Task #{selectedTask.id} • {getStatusBadge(selectedTask.status)}
                      </CardDescription>
                    </div>
                    {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && selectedTask.assignedToId === 1 && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => setOpenUpdateDialog(true)}
                        >
                          Update Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setOpenMessageDialog(true)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Client</div>
                      <div className="font-medium">{selectedTask.client.name}</div>
                      <div className="text-sm text-primary">{selectedTask.client.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Priority</div>
                      <div>{getPriorityBadge(selectedTask.priority)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Deadline</div>
                      <div className="font-medium">{formatDate(selectedTask.deadline)}</div>
                      {selectedTask.deadline && getRemainingDays(selectedTask.deadline) !== null && selectedTask.status !== 'completed' && (
                        <div className={`text-sm ${
                          getRemainingDays(selectedTask.deadline) || 0 < 0 ? 'text-red-500' :
                          getRemainingDays(selectedTask.deadline) || 0 <= 3 ? 'text-orange-500' : 
                          'text-green-500'
                        }`}>
                          {getRemainingDays(selectedTask.deadline) === 0 && "Due today"}
                          {(getRemainingDays(selectedTask.deadline) || 0) < 0 && (
                            `Overdue by ${Math.abs(getRemainingDays(selectedTask.deadline) || 0)} days`
                          )}
                          {(getRemainingDays(selectedTask.deadline) || 0) > 0 && (
                            `${getRemainingDays(selectedTask.deadline)} days remaining`
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Assigned Date</div>
                      <div className="font-medium">{formatDate(selectedTask.assignedDate)}</div>
                    </div>
                    {selectedTask.status === 'completed' && (
                      <div>
                        <div className="text-sm text-gray-500">Completed Date</div>
                        <div className="font-medium">{formatDate(selectedTask.completedDate)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Progress</div>
                      <div className="font-medium">{selectedTask.progressPercentage}% Complete</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Notes</div>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {selectedTask.notes || "No notes available"}
                    </div>
                  </div>
                  
                  {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && selectedTask.assignedToId === 1 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                        disabled={selectedTask.status === 'in_progress'}
                      >
                        <Refresh className="h-4 w-4 mr-1" />
                        Mark In Progress
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedTask.id, 'on_hold')}
                        disabled={selectedTask.status === 'on_hold'}
                      >
                        <PauseCircle className="h-4 w-4 mr-1" />
                        Put On Hold
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(selectedTask.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{selectedTask.client.name}</div>
                        <div className="text-sm text-gray-500">{selectedTask.client.email}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-1" />
                        View Client Profile
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Client ID</div>
                        <div>{selectedTask.client.id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Services</div>
                        <div>1 Active, 0 Completed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No Task Selected</CardTitle>
                <CardDescription>
                  Select a task from the list to view details and manage client services
                </CardDescription>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Progress Update Dialog */}
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task Progress</DialogTitle>
            <DialogDescription>
              Enter the current progress and provide notes on what has been accomplished.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="progressPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a number between 0 and 100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what has been accomplished in this update"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateForm.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachment (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files?.length) {
                            field.onChange(files);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload any relevant documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenUpdateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog open={openMessageDialog} onOpenChange={setOpenMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Communicate with the client or add internal notes about this task.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...commentForm}>
            <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-4">
              <FormField
                control={commentForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={commentForm.control}
                name="isInternal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Internal Note Only
                      </FormLabel>
                      <FormDescription>
                        If checked, this message will only be visible to staff, not to the client
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenMessageDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send Message</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}