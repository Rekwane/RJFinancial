import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeForm } from "@/components/credit-repair/DisputeForm";
import { DisputeLetterTemplate } from "@/components/credit-repair/DisputeLetterTemplate";
import { CreditTips } from "@/components/credit-repair/CreditTips";
import { useQuery } from "@tanstack/react-query";
import { Dispute } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Settings } from "lucide-react";

export default function CreditRepair() {
  const [activeTab, setActiveTab] = useState("disputes");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templateData, setTemplateData] = useState({
    template: "",
    formData: undefined,
  });
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample disputes for the UI display
  const sampleDisputes = [
    {
      id: 1,
      userId: 1,
      creditorName: "Chase Bank",
      accountNumber: "XXXX-XXXX-XXXX-1234",
      disputeType: "UCC Article 8",
      reason: "Account incorrectly reported as delinquent when it was paid in full.",
      status: "Resolved",
      dateFiled: "2025-05-02",
      dateResolved: "2025-05-15",
      documentPath: "/documents/chase-dispute.pdf"
    },
    {
      id: 2,
      userId: 1,
      creditorName: "American Express",
      accountNumber: "XXXX-XXXX-XXXX-5678",
      disputeType: "UCC Article 9",
      reason: "Creditor failed to provide documentation of the debt when requested.",
      status: "In Progress",
      dateFiled: "2025-05-10",
      documentPath: null
    },
    {
      id: 3,
      userId: 1,
      creditorName: "Capital One",
      accountNumber: "XXXX-XXXX-XXXX-9012",
      disputeType: "UCC Article 8",
      reason: "Account shows incorrect balance that exceeds the actual amount owed.",
      status: "Resolved",
      dateFiled: "2025-04-28",
      dateResolved: "2025-05-12",
      documentPath: "/documents/capital-one-dispute.pdf"
    },
    {
      id: 4,
      userId: 1,
      creditorName: "Bank of America",
      accountNumber: "XXXX-XXXX-XXXX-3456",
      disputeType: "UCC Article 9",
      reason: "Debt was sold without proper notification as required by UCC Article 9.",
      status: "Rejected",
      dateFiled: "2025-04-15",
      dateResolved: "2025-05-01",
      documentPath: "/documents/boa-dispute.pdf"
    }
  ];
  
  const displayDisputes = disputes.length ? disputes : sampleDisputes;
  
  const handleDisputeFormSuccess = () => {
    setShowTemplatePreview(false);
  };
  
  const handlePreview = (template: string, formData: any) => {
    setTemplateData({
      template,
      formData,
    });
    setShowTemplatePreview(true);
  };
  
  // Function to determine badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credit Repair Center</h1>
        <p className="text-gray-600 mt-1">Manage your credit disputes and repair strategy.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="letters">Letter Templates</TabsTrigger>
          <TabsTrigger value="tips">Credit Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="disputes" className="space-y-6">
          {showTemplatePreview ? (
            <DisputeLetterTemplate 
              template={templateData.template}
              formData={templateData.formData}
              onClose={() => setShowTemplatePreview(false)}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisputeForm 
                  onSuccess={handleDisputeFormSuccess}
                  onPreview={handlePreview}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Your UCC Disputes
                    </CardTitle>
                    <CardDescription>
                      Track the status of your credit disputes and their outcomes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Creditor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Filed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4">
                                Loading disputes...
                              </TableCell>
                            </TableRow>
                          ) : displayDisputes.length > 0 ? (
                            displayDisputes.map((dispute) => (
                              <TableRow key={dispute.id}>
                                <TableCell className="font-medium">
                                  {dispute.creditorName}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {dispute.disputeType}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={getStatusBadgeColor(dispute.status)}
                                    variant="outline"
                                  >
                                    {dispute.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {new Date(dispute.dateFiled).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4">
                                No disputes found. Create your first dispute to get started.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Dispute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="letters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Dispute Letter Templates
              </CardTitle>
              <CardDescription>
                Pre-crafted UCC dispute letter templates you can customize for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">UCC Article 8 Dispute Template</CardTitle>
                  <CardDescription>
                    For disputes involving investment securities and proper ownership chain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 mb-4">
                    This template focuses on securities entitlement issues under UCC Article 8,
                    challenging creditors to prove proper maintenance and chain of title for debt securities.
                  </p>
                </CardContent>
                <div className="px-6 pb-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePreview(
                      "UCC Article 8", 
                      { disputeType: "UCC Article 8" }
                    )}
                  >
                    View Template
                  </Button>
                </div>
              </Card>
              
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">UCC Article 9 Dispute Template</CardTitle>
                  <CardDescription>
                    For disputes involving secured transactions and perfection issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 mb-4">
                    This template addresses secured transaction issues under UCC Article 9,
                    questioning whether creditors properly perfected their security interests.
                  </p>
                </CardContent>
                <div className="px-6 pb-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePreview(
                      "UCC Article 9", 
                      { disputeType: "UCC Article 9" }
                    )}
                  >
                    View Template
                  </Button>
                </div>
              </Card>
              
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">General Dispute Template</CardTitle>
                  <CardDescription>
                    A comprehensive template for general credit reporting errors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 mb-4">
                    This general template can be used for any type of credit reporting error,
                    focusing on verification requirements under the FCRA.
                  </p>
                </CardContent>
                <div className="px-6 pb-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePreview(
                      "General", 
                      { disputeType: "General" }
                    )}
                  >
                    View Template
                  </Button>
                </div>
              </Card>
              
              <Card className="border border-gray-200 bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Custom Template Builder</CardTitle>
                  <CardDescription>
                    Create a completely customized dispute letter for your specific situation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Build a custom letter from scratch or combine elements from our existing 
                    templates to create a personalized dispute letter.
                  </p>
                </CardContent>
                <div className="px-6 pb-4">
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Create Custom
                  </Button>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tips">
          <CreditTips />
        </TabsContent>
      </Tabs>
    </div>
  );
}
