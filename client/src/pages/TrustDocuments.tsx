import { useState } from "react";
import { TrustForm } from "@/components/trust/TrustForm";
import { DisputeLetterTemplate } from "@/components/credit-repair/DisputeLetterTemplate";
import { useQuery } from "@tanstack/react-query";
import { TrustDocument } from "@/types";
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
import { FileText, Shield, Info, GavelIcon, BookOpen, AlertTriangle } from "lucide-react";
import { getTrustTemplate } from "@/lib/trust-templates";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function TrustDocuments() {
  const [activeTab, setActiveTab] = useState("create");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templateData, setTemplateData] = useState({
    template: "",
    formData: undefined,
  });
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: trustDocuments = [], isLoading } = useQuery<TrustDocument[]>({
    queryKey: ['/api/trust-documents', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample trust documents for UI display
  const sampleTrustDocuments = [
    {
      id: 1,
      userId: 1,
      trustName: "Smith Family Living Trust",
      trustType: "Living",
      trusteeNames: ["John Smith", "Jane Smith"],
      beneficiaryNames: ["Michael Smith", "Emily Smith"],
      assetsList: { "Primary Residence": "$450,000", "Investment Account": "$120,000" },
      dateCreated: "2025-04-15",
      documentPath: "/documents/smith-trust.pdf"
    },
    {
      id: 2,
      userId: 1,
      trustName: "Johnson Asset Protection Trust",
      trustType: "Irrevocable",
      trusteeNames: ["John Smith", "Financial Trust Services"],
      beneficiaryNames: ["Sarah Johnson", "Thomas Johnson"],
      assetsList: { "Commercial Property": "$750,000", "Stock Portfolio": "$350,000" },
      dateCreated: "2025-03-22",
      documentPath: "/documents/johnson-trust.pdf"
    },
    {
      id: 3,
      userId: 1,
      trustName: "Education Trust Fund",
      trustType: "Revocable",
      trusteeNames: ["John Smith"],
      beneficiaryNames: ["Michael Smith", "Emily Smith"],
      assetsList: { "Investment Account": "$85,000", "Savings Bonds": "$25,000" },
      dateCreated: "2025-05-01",
      documentPath: null
    }
  ];
  
  const displayTrustDocuments = trustDocuments.length ? trustDocuments : sampleTrustDocuments;
  
  const handleTrustFormSuccess = () => {
    setShowTemplatePreview(false);
    setActiveTab("manage");
  };
  
  const handlePreview = (template: string, formData: any) => {
    setTemplateData({
      template,
      formData,
    });
    setShowTemplatePreview(true);
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trust Documents</h1>
        <p className="text-gray-600 mt-1">Create and manage trust documents to protect your assets.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="create">Create Trust</TabsTrigger>
          <TabsTrigger value="manage">Manage Trusts</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Remedies</TabsTrigger>
          <TabsTrigger value="info">Trust Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          {showTemplatePreview ? (
            <DisputeLetterTemplate 
              template={templateData.template}
              formData={templateData.formData}
              onClose={() => setShowTemplatePreview(false)}
            />
          ) : (
            <TrustForm 
              onSuccess={handleTrustFormSuccess}
              onPreview={handlePreview}
            />
          )}
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Your Trust Documents
              </CardTitle>
              <CardDescription>
                View and manage the trusts you've created to protect your assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trust Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Trustees</TableHead>
                      <TableHead>Beneficiaries</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading trust documents...
                        </TableCell>
                      </TableRow>
                    ) : displayTrustDocuments.length > 0 ? (
                      displayTrustDocuments.map((trust) => (
                        <TableRow key={trust.id}>
                          <TableCell className="font-medium">
                            {trust.trustName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {trust.trustType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(trust.trusteeNames) 
                              ? trust.trusteeNames.join(", ")
                              : trust.trusteeNames}
                          </TableCell>
                          <TableCell>
                            {Array.isArray(trust.beneficiaryNames) 
                              ? trust.beneficiaryNames.join(", ")
                              : trust.beneficiaryNames}
                          </TableCell>
                          <TableCell>
                            {new Date(trust.dateCreated).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="link" className="mr-2">View</Button>
                            <Button variant="link">Download</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No trust documents found. Create your first trust to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setActiveTab("create")}>
                  Create New Trust
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GavelIcon className="mr-2 h-5 w-5" />
                Traffic Ticket Remedies
              </CardTitle>
              <CardDescription>
                Learn about effective legal strategies for addressing traffic tickets and navigating the court system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="mt-1 mr-3 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium text-amber-800">Disclaimer</h4>
                    <p className="text-sm text-amber-700">
                      This information is provided for educational purposes only and is not legal advice. 
                      If you need specific legal guidance, please consult with a qualified attorney.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-3">Understanding the Legal Framework</h3>
              <p className="text-gray-700 mb-4">
                Traffic tickets represent complex legal interactions involving contract law, administrative procedures, and jurisdictional questions. Understanding this framework is essential for developing effective remedies.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">The Three Branches of Government</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">To understand traffic court proceedings, it's important to understand the separation of powers:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li><strong>Legislative Branch</strong>: The authority to create laws</li>
                      <li><strong>Executive Branch</strong>: The authority to enforce the laws that were created</li>
                      <li><strong>Judicial Branch</strong>: The authority to decide the meaning of the law and how to apply them in real life situations/cases</li>
                    </ul>
                    <p className="mt-2">When dealing with traffic tickets, you're often navigating a system where these distinctions have become blurred.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">What Really Happens With a Traffic Ticket</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">When you're issued a ticket, a human being holding an "office" (title) has made a "claim" that your act either:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Injured persons</li>
                      <li>Damaged property</li>
                      <li>Breached a contract/trust</li>
                    </ul>
                    <p className="mt-2">Most traffic tickets fall under the "breach of contract" category. The system presumes you've entered into a contract by using public roads and having a driver's license. Your signature on a ticket is treated as an admission of breach and a promise to remedy the breach (pay the fine or appear in court).</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">Court Jurisdiction</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Understanding jurisdiction is crucial for successful remedy strategies:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Traffic Court functions under administrative law, not common law</li>
                      <li>There's a critical distinction between the public and private capacity of courts</li>
                      <li>Without the proper jurisdictional challenge, courts presume jurisdiction by your appearance</li>
                    </ul>
                    <p className="mt-2">According to the document, "Nothing can happen in 'public' that hasn't happened in 'private' first." This refers to the legal principle that a living human being must witness an act before any official action can be taken.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium mb-3">Effective Remedy Strategies</h3>
              <p className="text-gray-700 mb-4">
                The following strategies are discussed in the Traffic Ticket Remedies guide as potential approaches to address traffic tickets:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Right of Rescission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      A legal right that allows a person to cancel certain legal contracts within a specific time period (typically 3 business days). Can be used to rescind your signature on traffic tickets under certain conditions.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Name Correction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Uses the legal distinction between your given name and the all-caps name (e.g., JOHN DOE) that appears on legal documents. Filing a proper name correction can separate you from this legal entity.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Challenging Under 15 USC 1692</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Since traffic tickets represent alleged contract breaches, debt collection laws can be relevant. Request verification of the debt (the fine) under Fair Debt Collection Practices Act.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Quo Warranto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      This legal concept challenges the authority of officials to act against you. It formally questions the jurisdiction and authority of the court/officer and requires the plaintiff to prove their authority.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-lg mb-2">Legal Concepts Central to Traffic Remedies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-1">Suretyship</h5>
                    <p className="text-sm text-gray-600">
                      In traffic court cases, you may unknowingly become the surety for a legal fiction (your NAME in all caps). Understanding this relationship allows you to separate yourself from the legal entity being charged.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Abatement</h5>
                    <p className="text-sm text-gray-600">
                      A legal procedure that suspends court proceedings due to defects in the process. Can be used when proper procedures haven't been followed or to challenge jurisdictional errors.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Estate Concepts</h5>
                    <p className="text-sm text-gray-600">
                      Your estate includes everything of value that you own. The legal system often treats your NAME as a separate entity from you as a living being. Learning to operate as the executor of your estate rather than the surety can change your legal standing.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Private vs. Public Distinction</h5>
                    <p className="text-sm text-gray-600">
                      A fundamental concept is understanding the difference between your private capacity (you as a living being) and your public capacity (legal name/fiction that is subject to statutory jurisdiction).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Trust Information Center
              </CardTitle>
              <CardDescription>
                Learn about the different types of trusts and their benefits for your financial protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Living Trust</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      A living trust allows you to transfer assets to a trust during your lifetime. 
                      You can serve as the trustee and maintain control over trust assets, with 
                      a successor trustee taking over when you become incapacitated or pass away.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Avoids probate process</li>
                      <li>Maintains privacy of assets</li>
                      <li>Allows for management during incapacity</li>
                      <li>Can be revoked or modified</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Revocable Trust</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      A revocable trust can be altered, amended, or completely revoked during your lifetime. 
                      This flexibility allows you to make changes as your circumstances or wishes change.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Flexible and modifiable</li>
                      <li>Maintains control of assets</li>
                      <li>Simplifies asset management</li>
                      <li>Limited asset protection</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Irrevocable Trust</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Once established, an irrevocable trust cannot be changed or revoked without permission 
                      from all beneficiaries. Assets placed in this trust are no longer considered your property.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Strong asset protection</li>
                      <li>Estate tax benefits</li>
                      <li>Medicaid planning advantages</li>
                      <li>Permanent transfer of assets</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Trust Benefits for Financial Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Asset Protection</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Properly structured trusts, especially irrevocable trusts, can protect your assets from creditors, 
                        legal judgments, and other financial risks. By legally transferring assets to a trust, they may no 
                        longer be considered part of your personal estate.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-2">Privacy & Probate Avoidance</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Unlike wills, which become public record through the probate process, trusts maintain privacy 
                        for your assets and beneficiaries. Assets in a trust can be transferred directly to beneficiaries 
                        without going through the often lengthy and costly probate process.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-2">Tax Benefits</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Certain trusts can provide significant tax advantages, including potential reduction of estate taxes, 
                        generation-skipping taxes, and income taxes. Consult with a tax professional to understand how 
                        different trust structures can optimize your tax position.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-2">Control & Succession Planning</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Trusts allow you to specify exactly how and when your assets should be distributed to beneficiaries. 
                        You can set conditions for distributions based on age, education, or other milestones, ensuring that 
                        your wishes are carried out according to your specific intentions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
