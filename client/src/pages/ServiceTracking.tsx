import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

// Types for service requests
interface ServiceRequest {
  id: number;
  serviceType: string;
  status: string;
  requestDate: string;
  desiredCompletionDate: string | null;
  actualCompletionDate: string | null;
  priority: string;
  notes: string | null;
  assignedWorker: string | null;
  progressPercentage: number;
  lastUpdate: string | null;
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

// Types for comments
interface ServiceComment {
  id: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

// Sample data
const sampleServiceRequests: ServiceRequest[] = [
  {
    id: 1,
    serviceType: "Credit Restoration",
    status: "in_progress",
    requestDate: "2025-05-15T12:00:00Z",
    desiredCompletionDate: "2025-06-15T12:00:00Z",
    actualCompletionDate: null,
    priority: "normal",
    notes: "Need help with removing a collections account",
    assignedWorker: "John Smith",
    progressPercentage: 35,
    lastUpdate: "2025-05-17T14:30:00Z"
  },
  {
    id: 2,
    serviceType: "Trust Creation & Asset Protection",
    status: "pending",
    requestDate: "2025-05-18T09:00:00Z",
    desiredCompletionDate: "2025-06-18T09:00:00Z",
    actualCompletionDate: null,
    priority: "high",
    notes: "Need to create a trust for my primary residence",
    assignedWorker: null,
    progressPercentage: 0,
    lastUpdate: null
  },
  {
    id: 3,
    serviceType: "Business Formation",
    status: "completed",
    requestDate: "2025-04-01T10:00:00Z",
    desiredCompletionDate: "2025-05-01T10:00:00Z",
    actualCompletionDate: "2025-04-28T15:45:00Z",
    priority: "normal",
    notes: "LLC formation for my new consulting business",
    assignedWorker: "Sarah Johnson",
    progressPercentage: 100,
    lastUpdate: "2025-04-28T15:45:00Z"
  }
];

const sampleProgressUpdates: ProgressUpdate[] = [
  {
    id: 1,
    date: "2025-05-17T14:30:00Z",
    percentage: 35,
    description: "Submitted initial dispute letters to all three credit bureaus",
    createdBy: "John Smith",
    attachmentUrl: "/documents/disputes/experian-letter.pdf"
  },
  {
    id: 2,
    date: "2025-05-16T10:15:00Z",
    percentage: 20,
    description: "Reviewed credit reports and identified 3 potential items for dispute",
    createdBy: "John Smith",
    attachmentUrl: null
  },
  {
    id: 3,
    date: "2025-05-15T16:45:00Z",
    percentage: 10,
    description: "Initial consultation completed, gathered all necessary documents",
    createdBy: "John Smith",
    attachmentUrl: null
  }
];

const sampleComments: ServiceComment[] = [
  {
    id: 1,
    userId: 2,
    userName: "John Smith",
    comment: "I'll need your latest credit report from Experian. Can you please upload it?",
    createdAt: "2025-05-15T17:30:00Z",
    isInternal: false
  },
  {
    id: 2,
    userId: 1,
    userName: "You",
    comment: "Just uploaded the Experian report. Let me know if you need anything else.",
    createdAt: "2025-05-16T09:15:00Z",
    isInternal: false
  },
  {
    id: 3,
    userId: 2,
    userName: "John Smith",
    comment: "Thank you, I've received it and will start working on the disputes.",
    createdAt: "2025-05-16T10:00:00Z",
    isInternal: false
  }
];

export default function ServiceTracking() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [newComment, setNewComment] = useState("");
  
  // In a real app, these would be real API calls
  const { data: serviceRequests = sampleServiceRequests, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/service-requests'],
    enabled: false, // Disabled until real API is connected
  });
  
  const { data: progressUpdates = sampleProgressUpdates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['/api/progress-updates', selectedService?.id],
    enabled: !!selectedService, // Only fetch when a service is selected
  });
  
  const { data: comments = sampleComments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['/api/service-comments', selectedService?.id],
    enabled: !!selectedService, // Only fetch when a service is selected
  });

  const activeServices = serviceRequests.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const completedServices = serviceRequests.filter(s => s.status === 'completed' || s.status === 'cancelled');
  
  const handleSelectService = (service: ServiceRequest) => {
    setSelectedService(service);
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedService) return;
    
    // In a real app, this would be an API call
    // await apiRequest('/api/service-comments', 'POST', {
    //   serviceRequestId: selectedService.id,
    //   comment: newComment,
    //   isInternal: false
    // });
    
    // Mock update for the demo
    setNewComment("");
    
    // This would trigger a refetch in a real app:
    // queryClient.invalidateQueries(['/api/service-comments', selectedService.id]);
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
  
  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Service List Panel */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Your Service Requests</CardTitle>
              <CardDescription>
                Track the progress of your requested services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-4">
                  {isLoadingServices ? (
                    <div className="text-center py-4">Loading services...</div>
                  ) : activeServices.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No active service requests found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeServices.map(service => (
                        <div 
                          key={service.id}
                          className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
                            selectedService?.id === service.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => handleSelectService(service)}
                        >
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{service.serviceType}</div>
                            {getStatusBadge(service.status)}
                          </div>
                          
                          <div className="mb-2">
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Requested: {formatDate(service.requestDate)}</span>
                            </div>
                            {service.assignedWorker && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                <span>Assigned to: {service.assignedWorker}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Progress: {service.progressPercentage}%</div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${service.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4">
                  {isLoadingServices ? (
                    <div className="text-center py-4">Loading services...</div>
                  ) : completedServices.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No completed service requests found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedServices.map(service => (
                        <div 
                          key={service.id}
                          className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
                            selectedService?.id === service.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => handleSelectService(service)}
                        >
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{service.serviceType}</div>
                            {getStatusBadge(service.status)}
                          </div>
                          
                          <div className="mb-2">
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Completed: {formatDate(service.actualCompletionDate)}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Progress: {service.progressPercentage}%</div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${service.progressPercentage}%` }}
                              />
                            </div>
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
        
        {/* Service Details Panel */}
        <div className="md:w-2/3">
          {selectedService ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedService.serviceType}</CardTitle>
                  <CardDescription>
                    Service Request Details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div>{getStatusBadge(selectedService.status)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Priority</div>
                      <div className="capitalize">{selectedService.priority}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Requested Date</div>
                      <div>{formatDate(selectedService.requestDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Desired Completion</div>
                      <div>{formatDate(selectedService.desiredCompletionDate)}</div>
                    </div>
                    {selectedService.status === 'completed' && (
                      <div>
                        <div className="text-sm text-gray-500">Actual Completion</div>
                        <div>{formatDate(selectedService.actualCompletionDate)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Assigned To</div>
                      <div>{selectedService.assignedWorker || "Not yet assigned"}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Notes</div>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {selectedService.notes || "No notes provided"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Progress: {selectedService.progressPercentage}%</div>
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${selectedService.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Progress Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUpdates ? (
                    <div className="text-center py-4">Loading updates...</div>
                  ) : progressUpdates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No progress updates yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressUpdates.map(update => (
                        <div key={update.id} className="border-l-4 border-primary pl-4 py-1">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">{update.percentage}% Complete</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(update.date), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                          <div className="text-sm mb-2">{update.description}</div>
                          <div className="text-xs text-gray-500">
                            Updated by {update.createdBy}
                            {update.attachmentUrl && (
                              <a 
                                href={update.attachmentUrl} 
                                className="ml-4 inline-flex items-center text-primary hover:underline"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View attachment
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Communication */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 max-h-[400px] overflow-y-auto border rounded p-3">
                    {isLoadingComments ? (
                      <div className="text-center py-4">Loading messages...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No messages yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map(comment => (
                          <div 
                            key={comment.id}
                            className={`flex ${comment.userName === "You" ? "justify-end" : ""}`}
                          >
                            <div 
                              className={`rounded-lg p-3 max-w-[80%] ${
                                comment.userName === "You" 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-gray-100"
                              }`}
                            >
                              <div className="flex justify-between mb-1">
                                <div className="font-medium text-sm">{comment.userName}</div>
                                <div className="text-xs opacity-70">
                                  {format(new Date(comment.createdAt), "h:mm a")}
                                </div>
                              </div>
                              <div className="text-sm">{comment.comment}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No Service Selected</CardTitle>
                <CardDescription>
                  Select a service from the list to view details, track progress and communicate with your assigned professional.
                </CardDescription>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}