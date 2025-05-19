import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  FolderOpen, 
  MoreHorizontal, 
  Plus, 
  ChevronRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PDFViewer } from "./PDFViewer";

// Define types for dispute letter and categories
interface DisputeLetter {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  dateAdded: string;
  tags: string[];
}

interface DisputeLetterCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

// Mock categories for demonstration
const DISPUTE_CATEGORIES: DisputeLetterCategory[] = [
  {
    id: "credit-bureaus",
    name: "Credit Bureau Disputes",
    description: "Letters for disputing information with the major credit bureaus (Equifax, Experian, TransUnion)",
    count: 8
  },
  {
    id: "creditors",
    name: "Creditor Disputes",
    description: "Letters addressing disputes directly with creditors and collection agencies",
    count: 6
  },
  {
    id: "debt-validation",
    name: "Debt Validation",
    description: "Letters requesting validation of debts under the FDCPA",
    count: 3
  },
  {
    id: "ucc-dispute",
    name: "UCC-Based Disputes",
    description: "Advanced dispute letters using UCC Articles 8 and 9 references",
    count: 4
  },
  {
    id: "goodwill",
    name: "Goodwill Letters",
    description: "Letters requesting removal of negative items as a goodwill gesture",
    count: 2
  },
  {
    id: "fdcpa",
    name: "FDCPA Violations",
    description: "Letters addressing Fair Debt Collection Practices Act violations",
    count: 3
  }
];

// Mock dispute letter data for demonstration
const MOCK_DISPUTE_LETTERS: DisputeLetter[] = [
  {
    id: "1",
    title: "General Credit Bureau Dispute",
    description: "General-purpose dispute letter for inaccurate information on credit reports",
    category: "credit-bureaus",
    fileUrl: "/dispute-letters/credit-bureau-general.pdf",
    dateAdded: "2025-04-15",
    tags: ["FCRA", "All Bureaus", "General"]
  },
  {
    id: "2",
    title: "Equifax Specific Dispute",
    description: "Targeted dispute letter for Equifax credit reporting issues",
    category: "credit-bureaus",
    fileUrl: "/dispute-letters/equifax-specific.pdf",
    dateAdded: "2025-04-16",
    tags: ["Equifax", "FCRA", "Specific"]
  },
  {
    id: "3",
    title: "Debt Validation Request",
    description: "Request letter demanding validation of debt under FDCPA Section 809(b)",
    category: "debt-validation",
    fileUrl: "/dispute-letters/debt-validation.pdf",
    dateAdded: "2025-04-17",
    tags: ["FDCPA", "Validation", "Collections"]
  },
  {
    id: "4",
    title: "UCC Article 9 Secured Party Dispute",
    description: "Advanced dispute using UCC Article 9 secured party principles",
    category: "ucc-dispute",
    fileUrl: "/dispute-letters/ucc-article9-dispute.pdf",
    dateAdded: "2025-04-18",
    tags: ["UCC", "Article 9", "Advanced"]
  },
  {
    id: "5",
    title: "Late Payment Goodwill Letter",
    description: "Letter requesting removal of late payment as a goodwill adjustment",
    category: "goodwill",
    fileUrl: "/dispute-letters/goodwill-late-payment.pdf",
    dateAdded: "2025-04-19",
    tags: ["Goodwill", "Late Payment"]
  },
  {
    id: "6",
    title: "Creditor Direct Dispute",
    description: "Direct dispute to original creditors for inaccurate reporting",
    category: "creditors",
    fileUrl: "/dispute-letters/creditor-direct.pdf",
    dateAdded: "2025-04-20",
    tags: ["Creditor", "Direct Dispute", "FCRA"]
  },
  {
    id: "7",
    title: "UCC Article 8 Securities Dispute",
    description: "Dispute based on UCC Article 8 securities regulations",
    category: "ucc-dispute",
    fileUrl: "/dispute-letters/ucc-article8-securities.pdf",
    dateAdded: "2025-04-21",
    tags: ["UCC", "Article 8", "Securities"]
  },
  {
    id: "8",
    title: "Mixed File Dispute",
    description: "Dispute for credit report mixing information with another consumer",
    category: "credit-bureaus",
    fileUrl: "/dispute-letters/mixed-file.pdf",
    dateAdded: "2025-04-22",
    tags: ["Mixed File", "Identity", "FCRA"]
  }
];

export function DisputeLetterLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<DisputeLetter | null>(null);
  const [viewingPdf, setViewingPdf] = useState(false);
  
  // In a real implementation, this would fetch from your API
  // For now, we'll simulate an API call with our mock data
  const { data: disputeLetters = MOCK_DISPUTE_LETTERS, isLoading } = useQuery({
    queryKey: ["dispute-letters"],
    queryFn: async () => {
      // In production, replace with actual API call
      // return await apiRequest("/api/dispute-letters");
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 500));
      return MOCK_DISPUTE_LETTERS;
    }
  });
  
  // Filter letters based on selected category and search query
  const filteredLetters = disputeLetters.filter(letter => {
    const matchesCategory = selectedCategory === "all" || letter.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  // Handle letter download
  const handleDownload = (letter: DisputeLetter) => {
    // In a real app, this would trigger the file download from your server
    alert(`Downloading file: ${letter.title}`);
    
    // For demonstration purposes. In production, use the actual URL
    // window.open(letter.fileUrl, '_blank');
  };
  
  // Handle letter view
  const handleViewLetter = (letter: DisputeLetter) => {
    setSelectedLetter(letter);
    setViewingPdf(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Dispute Letter Library</CardTitle>
              <CardDescription>
                Access professional dispute letter templates for various situations
              </CardDescription>
            </div>
            <Button className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Request New Letter
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search letter templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                  All Categories
                </DropdownMenuItem>
                <Separator className="my-1" />
                {DISPUTE_CATEGORIES.map(category => (
                  <DropdownMenuItem 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-4 flex flex-nowrap overflow-x-auto">
              <TabsTrigger value="all">All Letters</TabsTrigger>
              {DISPUTE_CATEGORIES.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <h3 className="text-lg font-medium mb-4">All Dispute Letters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  // Loading placeholders
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-24 bg-gray-100 rounded-t-lg"></CardHeader>
                      <CardContent className="h-40 bg-gray-50"></CardContent>
                    </Card>
                  ))
                ) : filteredLetters.length === 0 ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">No dispute letters found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  filteredLetters.map(letter => (
                    <Card key={letter.id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{letter.title}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {letter.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 flex-grow">
                        <p className="text-sm text-gray-500 line-clamp-3">
                          {letter.description}
                        </p>
                        
                        <div className="mt-3 text-xs text-gray-400">
                          Added: {new Date(letter.dateAdded).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewLetter(letter)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleDownload(letter)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            {DISPUTE_CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <Badge variant="outline">{category.count} Templates</Badge>
                </div>
                <p className="text-gray-500 mb-6">{category.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    // Loading placeholders
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="h-24 bg-gray-100 rounded-t-lg"></CardHeader>
                        <CardContent className="h-40 bg-gray-50"></CardContent>
                      </Card>
                    ))
                  ) : filteredLetters.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">No dispute letters found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  ) : (
                    filteredLetters.map(letter => (
                      <Card key={letter.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{letter.title}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {letter.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 flex-grow">
                          <p className="text-sm text-gray-500 line-clamp-3">
                            {letter.description}
                          </p>
                          
                          <div className="mt-3 text-xs text-gray-400">
                            Added: {new Date(letter.dateAdded).toLocaleDateString()}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLetter(letter)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleDownload(letter)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* PDF Viewer Dialog */}
      <Dialog open={viewingPdf} onOpenChange={setViewingPdf}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedLetter?.title}</DialogTitle>
            <DialogDescription>
              {selectedLetter?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 min-h-[500px]">
            {selectedLetter && (
              <PDFViewer 
                url={selectedLetter.fileUrl}
                title={selectedLetter.title}
                onDownload={() => handleDownload(selectedLetter)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}