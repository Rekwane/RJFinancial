import { useState } from "react";
import { EINForm } from "@/components/ein/EINForm";
import { useQuery } from "@tanstack/react-query";
import { EINApplication } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdCard, Info, FileCheck, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function EINApplicationPage() {
  const [activeTab, setActiveTab] = useState("apply");
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: einApplications = [], isLoading } = useQuery<EINApplication[]>({
    queryKey: ['/api/ein-applications', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample EIN applications for UI display
  const sampleEINApplications = [
    {
      id: 1,
      userId: 1,
      entityName: "Smith Family Trust",
      entityType: "Trust",
      responsibleParty: "John Smith",
      einNumber: "12-3456789",
      applicationStatus: "Approved",
      submissionDate: "2025-04-10",
      approvalDate: "2025-04-20",
      documentPath: "/documents/smith-trust-ein.pdf"
    },
    {
      id: 2,
      userId: 1,
      entityName: "ABC Real Estate LLC",
      entityType: "LLC",
      responsibleParty: "John Smith",
      einNumber: null,
      applicationStatus: "Submitted",
      submissionDate: "2025-05-05",
      approvalDate: null,
      documentPath: null
    },
    {
      id: 3,
      userId: 1,
      entityName: "Education Fund Trust",
      entityType: "Trust",
      responsibleParty: "John Smith",
      einNumber: null,
      applicationStatus: "Draft",
      submissionDate: null,
      approvalDate: null,
      documentPath: null
    }
  ];
  
  const displayEINApplications = einApplications.length ? einApplications : sampleEINApplications;
  
  const handleEINFormSuccess = () => {
    setActiveTab("status");
  };
  
  // Function to get status badge styling
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // FAQ content for the info tab
  const einFAQs = [
    {
      question: "What is an EIN?",
      answer: "An Employer Identification Number (EIN) is a unique nine-digit number assigned by the Internal Revenue Service (IRS) to identify business entities, trusts, estates, and other organizations for tax purposes. It's sometimes referred to as a Federal Tax Identification Number."
    },
    {
      question: "Why does my trust need an EIN?",
      answer: "Trusts typically need an EIN if they generate income that must be reported on a tax return, have assets that produce income, or if you want to open a bank account in the name of the trust. Even if your trust is a grantor trust (where you report income on your personal return), many financial institutions still require an EIN to open accounts in the trust's name."
    },
    {
      question: "How long does it take to get an EIN from the IRS?",
      answer: "If you apply online through the IRS website, you can receive your EIN immediately upon completion of the application. If you apply by mail using Form SS-4, it can take up to 4-5 weeks. Our automated service helps streamline this process by guiding you through the online application."
    },
    {
      question: "What information do I need to apply for an EIN?",
      answer: "You'll need the name and SSN/ITIN/EIN of the responsible party (usually the trustee for trusts), the legal name of the entity, mailing address, type of entity, reason for applying, and in some cases, information about the principal business activities."
    },
    {
      question: "Can I apply for multiple EINs?",
      answer: "Yes, you can apply for EINs for different entities. However, the IRS restricts how many EINs can be issued to a single responsible party in a day. Our service can help manage this by properly scheduling applications if you need multiple EINs."
    }
  ];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">EIN Application Center</h1>
        <p className="text-gray-600 mt-1">Apply for and manage Employer Identification Numbers (EINs) for your trusts and business entities.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="apply">Apply for EIN</TabsTrigger>
          <TabsTrigger value="status">Application Status</TabsTrigger>
          <TabsTrigger value="info">EIN Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apply">
          <EINForm onSuccess={handleEINFormSuccess} />
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IdCard className="mr-2 h-5 w-5" />
                Your EIN Applications
              </CardTitle>
              <CardDescription>
                Track the status of your EIN applications with the IRS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Name</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Responsible Party</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>EIN (if issued)</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Loading EIN applications...
                        </TableCell>
                      </TableRow>
                    ) : displayEINApplications.length > 0 ? (
                      displayEINApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {app.entityName}
                          </TableCell>
                          <TableCell>
                            {app.entityType}
                          </TableCell>
                          <TableCell>
                            {app.responsibleParty}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusBadgeColor(app.applicationStatus)}
                            >
                              {app.applicationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.einNumber || "Pending"}
                          </TableCell>
                          <TableCell>
                            {app.submissionDate 
                              ? new Date(app.submissionDate).toLocaleDateString() 
                              : "Not Submitted"}
                          </TableCell>
                          <TableCell className="text-right">
                            {app.applicationStatus === "Draft" ? (
                              <Button variant="link">Continue</Button>
                            ) : app.applicationStatus === "Submitted" ? (
                              <Button variant="link">Check Status</Button>
                            ) : (
                              <Button variant="link">View Details</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No EIN applications found. Apply for your first EIN to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setActiveTab("apply")}>
                  Apply for New EIN
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                EIN Information Center
              </CardTitle>
              <CardDescription>
                Learn about EINs and how they benefit your financial entities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <IdCard className="mr-2 h-4 w-4" />
                      What is an EIN?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      An Employer Identification Number (EIN) is a 9-digit number assigned by the IRS to identify
                      business entities and trusts for tax purposes. Think of it as a Social Security Number for
                      your business or trust. It's required for tax filings, opening bank accounts, and many other
                      financial activities.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Benefits of an EIN
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Establish separate identity for your trust or business</li>
                      <li>Open bank accounts in the entity's name</li>
                      <li>Build business credit separate from personal credit</li>
                      <li>Protect personal information when conducting business</li>
                      <li>Required for tax filings and employee hiring</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Why Trusts Need EINs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Trusts generally need an EIN when they:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-2">
                      <li>Function as separate legal entities</li>
                      <li>Generate reportable income</li>
                      <li>Have assets that produce income</li>
                      <li>Need to open financial accounts</li>
                      <li>Are required to file tax returns</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {einFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-base font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
