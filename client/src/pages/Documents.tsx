import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document, DocumentType } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Folder,
  FileText,
  File,
  FileSpreadsheet,
  FileUp,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Share2,
  Search,
  FilterX,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const documentUploadSchema = z.object({
  userId: z.number(),
  documentName: z.string().min(1, { message: "Document name is required" }),
  documentType: z.string({ required_error: "Document type is required" }),
  filePath: z.string().min(1, { message: "Document upload is required" }),
  fileSize: z.number().optional(),
  isTemplate: z.boolean().default(false),
});

type DocumentUploadValues = z.infer<typeof documentUploadSchema>;

export default function Documents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  // Query for documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { userId, documentType: filterType }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample documents for UI display
  const sampleDocuments = [
    {
      id: 1,
      userId: 1,
      documentName: "Chase Bank Dispute Letter",
      documentType: "Dispute",
      filePath: "/documents/chase-dispute.pdf",
      uploadDate: "2025-05-02",
      fileSize: 125000,
      isTemplate: false
    },
    {
      id: 2,
      userId: 1,
      documentName: "Living Trust Document",
      documentType: "Trust",
      filePath: "/documents/living-trust.docx",
      uploadDate: "2025-04-15",
      fileSize: 350000,
      isTemplate: false
    },
    {
      id: 3,
      userId: 1,
      documentName: "EIN Application - ABC Trust",
      documentType: "EIN",
      filePath: "/documents/ein-application.xlsx",
      uploadDate: "2025-05-08",
      fileSize: 85000,
      isTemplate: false
    },
    {
      id: 4,
      userId: 1,
      documentName: "Credit Report - TransUnion",
      documentType: "Report",
      filePath: "/documents/transunion-report.pdf",
      uploadDate: "2025-04-22",
      fileSize: 1250000,
      isTemplate: false
    },
    {
      id: 5,
      userId: 1,
      documentName: "UCC Article 8 Template",
      documentType: "Dispute",
      filePath: "/templates/ucc-article-8.docx",
      uploadDate: "2025-03-15",
      fileSize: 45000,
      isTemplate: true
    },
    {
      id: 6,
      userId: 1,
      documentName: "Irrevocable Trust Template",
      documentType: "Trust",
      filePath: "/templates/irrevocable-trust.docx",
      uploadDate: "2025-03-20",
      fileSize: 75000,
      isTemplate: true
    }
  ];
  
  const displayDocuments = documents.length ? documents : sampleDocuments;
  
  // Filter documents based on active tab
  const getFilteredDocuments = () => {
    let filtered = [...displayDocuments];
    
    // Apply type filter if any
    if (filterType) {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }
    
    // Apply tab filter
    if (activeTab === "templates") {
      filtered = filtered.filter(doc => doc.isTemplate);
    } else if (activeTab !== "all") {
      filtered = filtered.filter(doc => doc.documentType.toLowerCase() === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.documentName.toLowerCase().includes(query) || 
        doc.documentType.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  const filteredDocuments = getFilteredDocuments();
  
  // Form setup for document upload
  const form = useForm<DocumentUploadValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      userId: userId,
      documentName: "",
      documentType: "",
      filePath: "",
      fileSize: 0,
      isTemplate: false,
    },
  });
  
  // Get appropriate icon for document type
  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'Dispute':
        return <File className="h-6 w-6 text-red-500" />;
      case 'Trust':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'EIN':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'Report':
        return <FileText className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Get appropriate background color for document type
  const getDocumentBgColor = (documentType: string) => {
    switch (documentType) {
      case 'Dispute':
        return 'bg-red-100';
      case 'Trust':
        return 'bg-blue-100';
      case 'EIN':
        return 'bg-green-100';
      case 'Report':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Format document date
  const formatDocumentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (data: DocumentUploadValues) => 
      apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
      setIsUploadDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete document: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate document counts by type
  const documentCounts = {
    all: displayDocuments.length,
    dispute: displayDocuments.filter(doc => doc.documentType === "Dispute").length,
    trust: displayDocuments.filter(doc => doc.documentType === "Trust").length,
    ein: displayDocuments.filter(doc => doc.documentType === "EIN").length,
    report: displayDocuments.filter(doc => doc.documentType === "Report").length,
    templates: displayDocuments.filter(doc => doc.isTemplate).length,
  };
  
  // Submit handler for document upload form
  function onSubmit(data: DocumentUploadValues) {
    // In a real implementation, you would handle the file upload
    // and then call the mutation with the file path
    uploadDocumentMutation.mutate({
      ...data,
      filePath: `/documents/${data.documentName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      fileSize: 100000, // Mock file size for demonstration
    });
  }
  
  // Handle file selection (mock implementation)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("filePath", URL.createObjectURL(file));
      form.setValue("fileSize", file.size);
      
      // If no document name is entered yet, use the file name (without extension)
      if (!form.getValues("documentName")) {
        const fileName = file.name.split('.').slice(0, -1).join('.');
        form.setValue("documentName", fileName);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
        <p className="text-gray-600 mt-1">Organize and access all your financial documents in one place.</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Input
            className="pl-10"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex space-x-2">
          <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Dispute">Disputes</SelectItem>
              <SelectItem value="Trust">Trust Documents</SelectItem>
              <SelectItem value="EIN">EIN Applications</SelectItem>
              <SelectItem value="Report">Reports</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType && (
            <Button variant="ghost" size="icon" onClick={() => setFilterType(null)}>
              <FilterX className="h-4 w-4" />
            </Button>
          )}
          
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all" className="flex items-center">
            All
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="dispute" className="flex items-center">
            Disputes
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.dispute}
            </span>
          </TabsTrigger>
          <TabsTrigger value="trust" className="flex items-center">
            Trusts
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.trust}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ein" className="flex items-center">
            EIN
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.ein}
            </span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center">
            Reports
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.report}
            </span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            Templates
            <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
              {documentCounts.templates}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                {activeTab === "all" ? "All your documents" : 
                 activeTab === "templates" ? "Document templates" : 
                 `Your ${activeTab} documents`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading documents...</div>
              ) : filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map(document => (
                    <Card key={document.id} className="border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <CardContent className="p-0">
                        <div className="flex items-center p-4 border-b border-gray-100">
                          <div className={`p-2 ${getDocumentBgColor(document.documentType)} rounded mr-3`}>
                            {getDocumentIcon(document.documentType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{document.documentName}</h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span className="truncate">{document.documentType}</span>
                              <span className="mx-1">•</span>
                              <span className="truncate">{formatDocumentDate(document.uploadDate)}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <Download className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <Share2 className="mr-2 h-4 w-4" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="flex items-center text-red-600" 
                                onClick={() => deleteDocumentMutation.mutate(document.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="p-4 flex justify-between items-center text-xs text-gray-500">
                          <div>
                            {document.fileSize && (
                              <span>{formatFileSize(document.fileSize)}</span>
                            )}
                          </div>
                          {document.isTemplate && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Template
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery 
                      ? "No documents match your search criteria." 
                      : `You don't have any ${activeTab === "all" ? "" : activeTab + " "}documents yet.`}
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to your document library.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dispute">Dispute Letter</SelectItem>
                        <SelectItem value="Trust">Trust Document</SelectItem>
                        <SelectItem value="EIN">EIN Application</SelectItem>
                        <SelectItem value="Report">Credit Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isTemplate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel>Save as template</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="space-y-2">
                    <FileUp className="h-10 w-10 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                        Click to upload
                      </label>{" "}
                      or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX up to 10MB
                    </p>
                  </div>
                  
                  {form.watch("filePath") && (
                    <div className="mt-4 p-2 bg-gray-50 rounded text-left flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {form.watch("documentName") || "Selected file"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => form.setValue("filePath", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <input type="hidden" {...form.register("userId")} />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={uploadDocumentMutation.isPending || !form.watch("filePath")}
                >
                  {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
