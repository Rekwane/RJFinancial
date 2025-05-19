import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@/types";
import { Link } from "wouter";
import { FileIcon, FileTextIcon, FileSpreadsheetIcon, FilePlusIcon, DownloadIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { creditTips } from "@/lib/credit-templates";

type DocumentFilter = 'All' | 'Disputes' | 'Trust Docs' | 'EIN Applications';

export function DocumentManager() {
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>('All');
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Mock documents for initial UI
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
    }
  ];
  
  const displayDocuments = documents.length ? documents : sampleDocuments;
  
  // Filter documents based on active filter
  const filteredDocuments = displayDocuments.filter(doc => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Disputes') return doc.documentType === 'Dispute';
    if (activeFilter === 'Trust Docs') return doc.documentType === 'Trust';
    if (activeFilter === 'EIN Applications') return doc.documentType === 'EIN';
    return true;
  });
  
  // Get appropriate icon for document type
  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'Dispute':
        return <FileIcon className="text-red-500" />;
      case 'Trust':
        return <FileTextIcon className="text-blue-500" />;
      case 'EIN':
        return <FileSpreadsheetIcon className="text-green-500" />;
      default:
        return <FileIcon className="text-gray-500" />;
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
      default:
        return 'bg-gray-100';
    }
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
  
  // Format document type for display
  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'Dispute':
        return 'UCC Article 8 Dispute';
      case 'Trust':
        return 'Trust Document';
      case 'EIN':
        return 'IRS Documentation';
      default:
        return type;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Document Manager</h2>
          <Link href="/documents">
            <Button variant="link" className="flex items-center text-primary text-sm font-medium">
              <span>View all documents</span>
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 border-b border-gray-200 pb-4">
              <div className="flex space-x-2">
                <Button
                  variant={activeFilter === 'All' ? 'default' : 'outline'}
                  onClick={() => setActiveFilter('All')}
                  className="px-3 py-1.5 text-sm"
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'Disputes' ? 'default' : 'outline'}
                  onClick={() => setActiveFilter('Disputes')}
                  className="px-3 py-1.5 text-sm"
                >
                  Disputes
                </Button>
                <Button
                  variant={activeFilter === 'Trust Docs' ? 'default' : 'outline'}
                  onClick={() => setActiveFilter('Trust Docs')}
                  className="px-3 py-1.5 text-sm"
                >
                  Trust Docs
                </Button>
                <Button
                  variant={activeFilter === 'EIN Applications' ? 'default' : 'outline'}
                  onClick={() => setActiveFilter('EIN Applications')}
                  className="px-3 py-1.5 text-sm"
                >
                  EIN Applications
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading documents...</div>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map(document => (
                  <div key={document.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 ${getDocumentBgColor(document.documentType)} rounded mr-4`}>
                      {getDocumentIcon(document.documentType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{document.documentName}</h4>
                      <p className="text-xs text-gray-500">
                        {formatDocumentType(document.documentType)} • {formatDocumentDate(document.uploadDate)}
                      </p>
                    </div>
                    <div>
                      <Button variant="ghost" size="icon" className="p-2 text-gray-500 hover:text-gray-700">
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="p-2 text-gray-500 hover:text-gray-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No documents found.</div>
              )}
              
              <Button variant="outline" className="w-full py-3 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50">
                <FilePlusIcon className="mr-2 h-4 w-4" />
                <span className="text-sm">Upload New Document</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Credit Tips</h2>
          <Link href="/credit-tips">
            <Button variant="link" className="flex items-center text-primary text-sm font-medium">
              <span>View all</span>
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {creditTips.slice(0, 3).map((tip, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0">
                <h4 className="font-medium mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{tip.content}</p>
                <Link href={tip.url}>
                  <Button variant="link" className="text-primary text-sm font-medium hover:underline p-0">Read more</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
