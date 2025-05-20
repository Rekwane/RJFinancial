import { useState, useEffect } from "react";
import { TrustForm } from "@/components/trust/TrustForm";
import { DisputeLetterTemplate } from "@/components/credit-repair/DisputeLetterTemplate";
import { useQuery } from "@tanstack/react-query";
import { TrustDocument } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { 
  FileText, Shield, Info, GavelIcon, BookOpen, AlertTriangle, FilePlus, 
  Download, Car, FileCheck, Save, Crown, Edit, Lock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTrustTemplate } from "@/lib/trust-templates";
import { getTrafficRemedyTemplate } from "@/lib/traffic-ticket-templates";
import { getLegalTemplate } from "@/lib/legal-templates";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { z } from "zod";

// Define the form schema for Declaration of Trust
const declarationOfTrustSchema = z.object({
  trustName: z.string().min(2, { message: "Trust name must be at least 2 characters" }),
  grantorName: z.string().min(2, { message: "Grantor name is required" }),
  maritalStatus: z.string().min(1, { message: "Marital status is required" }),
  children: z.string().optional(),
  trusteeName: z.string().min(2, { message: "Trustee name is required" }),
  successorTrustee: z.string().optional(),
  beneficiaries: z.string().min(2, { message: "At least one beneficiary is required" }),
  specificBequests: z.string().optional(),
  childrenAge: z.string().optional(),
  contingentBeneficiary: z.string().optional()
});

type DeclarationOfTrustFormValues = z.infer<typeof declarationOfTrustSchema>;

export default function TrustDocuments() {
  const [activeTab, setActiveTab] = useState("create");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templateData, setTemplateData] = useState({
    template: "",
    formData: undefined,
  });
  const [trafficTemplateType, setTrafficTemplateType] = useState<string | null>(null);
  const [legalTemplateType, setLegalTemplateType] = useState<string | null>(null);
  const [showDeclarationForm, setShowDeclarationForm] = useState(false);
  const [showRightToTravelForm, setShowRightToTravelForm] = useState(false);
  const [showMotorVehicleAffidavitForm, setShowMotorVehicleAffidavitForm] = useState(false);
  const [compiledTrustDoc, setCompiledTrustDoc] = useState<string | null>(null);
  const [isGoldMember, setIsGoldMember] = useState(false); // For membership status
  const [showMembershipModal, setShowMembershipModal] = useState(false); // For membership upgrade prompt
  const [editableDocument, setEditableDocument] = useState<{ type: string, content: string } | null>(null); // For editable document content
  const [editedContent, setEditedContent] = useState<string>(""); // For tracking edited document content

  // For demo purposes - in a real app, this would come from a user profile or auth context
  useEffect(() => {
    // Simulate a check for gold membership status
    // For demo, we're defaulting to non-gold
    setIsGoldMember(false);
  }, []);
  
  // Handle editing documents (gold members only)
  const handleDocumentEdit = (templateType: string, templateContent: string) => {
    if (isGoldMember) {
      setEditableDocument({
        type: templateType,
        content: templateContent
      });
      setEditedContent(templateContent);
    } else {
      setShowMembershipModal(true);
    }
  };
  
  // Save edited document
  const handleSaveDocument = () => {
    // In a real app, this would save the document to backend storage
    setEditableDocument(null);
    // Show success message or download prompt
  };
  
  // Handle editable document content changes
  const handleDocumentContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };
  
  // Set up the form for Declaration of Trust
  const declarationForm = useForm<DeclarationOfTrustFormValues>({
    defaultValues: {
      trustName: "",
      grantorName: "",
      maritalStatus: "Single",
      children: "",
      trusteeName: "",
      successorTrustee: "",
      beneficiaries: "",
      specificBequests: "",
      childrenAge: "21",
      contingentBeneficiary: ""
    }
  });
  
  // Right to Travel Motion form schema
  const rightToTravelSchema = z.object({
    officerName: z.string().min(1, { message: "Officer name is required" }),
    courtName: z.string().min(1, { message: "Court name is required" }),
    courtAddress: z.string().min(1, { message: "Court address is required" }),
    courtCityStateZip: z.string().min(1, { message: "City, State, ZIP is required" }),
    trusteeName: z.string().min(1, { message: "Trustee name is required" }),
    trusteeAddress: z.string().min(1, { message: "Trustee address is required" }),
    trusteeCityStateZip: z.string().min(1, { message: "City, State, ZIP is required" }),
    recipientName: z.string().min(1, { message: "Recipient name is required" }),
    trustName: z.string().min(1, { message: "Trust name is required" }),
    incidentDate: z.string().min(1, { message: "Incident date is required" }),
    lawEnforcementAgency: z.string().min(1, { message: "Law enforcement agency is required" }),
    allegedViolation: z.string().min(1, { message: "Alleged violation is required" }),
    contactInformation: z.string()
  });

  type RightToTravelFormValues = z.infer<typeof rightToTravelSchema>;
  
  const rightToTravelForm = useForm<RightToTravelFormValues>({
    defaultValues: {
      officerName: "",
      courtName: "",
      courtAddress: "",
      courtCityStateZip: "",
      trusteeName: "",
      trusteeAddress: "",
      trusteeCityStateZip: "",
      recipientName: "",
      trustName: "",
      incidentDate: "",
      lawEnforcementAgency: "",
      allegedViolation: "",
      contactInformation: ""
    }
  });
  
  // Motor Vehicle Affidavit form schema
  const motorVehicleAffidavitSchema = z.object({
    state: z.string().min(1, { message: "State is required" }),
    county: z.string().min(1, { message: "County is required" }),
    fullName: z.string().min(1, { message: "Full name is required" }),
    vehicleYear: z.string().min(1, { message: "Vehicle year is required" }),
    vehicleMake: z.string().min(1, { message: "Vehicle make is required" }),
    vehicleModel: z.string().min(1, { message: "Vehicle model is required" }),
    vehicleVin: z.string().min(1, { message: "VIN is required" }),
    trustName: z.string().min(1, { message: "Trust name is required" }),
    idNumber: z.string(),
    address: z.string().min(1, { message: "Address is required" }),
    cityStateZip: z.string().min(1, { message: "City, State, ZIP is required" })
  });

  type MotorVehicleAffidavitFormValues = z.infer<typeof motorVehicleAffidavitSchema>;
  
  const motorVehicleAffidavitForm = useForm<MotorVehicleAffidavitFormValues>({
    defaultValues: {
      state: "",
      county: "",
      fullName: "",
      vehicleYear: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleVin: "",
      trustName: "",
      idNumber: "",
      address: "",
      cityStateZip: ""
    }
  });
  
  // Function to compile the trust document with form data
  function compileTrustDocument(data: DeclarationOfTrustFormValues) {
    let template = getLegalTemplate("declaration-of-trust");
    
    // Replace placeholders with actual data
    template = template.replace(/\[TRUST NAME\]/g, data.trustName);
    template = template.replace(/\[GRANTOR NAME\]/g, data.grantorName);
    template = template.replace(/\[MARITAL STATUS\]/g, data.maritalStatus);
    
    // Handle children
    const childrenList = data.children ? data.children.split(',').map(child => child.trim()) : [];
    template = template.replace(/\[NUMBER\]/g, childrenList.length.toString());
    
    if (childrenList.length > 0) {
      let childrenText = '';
      childrenList.forEach(child => {
        childrenText += `${child}\n`;
      });
      template = template.replace(/\[CHILD NAME 1\]\n\[CHILD NAME 2\]/g, childrenText.trim());
    } else {
      template = template.replace(/\[CHILD NAME 1\]\n\[CHILD NAME 2\]/g, "None");
    }
    
    // Replace trustee information
    template = template.replace(/\[TRUSTEE NAME\]/g, data.trusteeName);
    template = template.replace(/\[SUCCESSOR TRUSTEE\]/g, data.successorTrustee || "None designated");
    
    // Handle specific bequests
    template = template.replace(/\[LIST SPECIFIC BEQUESTS\]/g, data.specificBequests || "None");
    
    // Replace children age
    template = template.replace(/\[AGE\]/g, data.childrenAge || "21");
    
    // Replace contingent beneficiary
    template = template.replace(/\[CONTINGENT BENEFICIARY\]/g, data.contingentBeneficiary || "the Grantor's heirs at law");
    
    return template;
  }

  // Function to compile the right to travel motion
  function compileRightToTravelMotion(data: RightToTravelFormValues) {
    let template = getTrustTemplate("right-to-travel");
    
    // Replace placeholders with actual data
    template = template.replace(/\[OFFICER_NAME\]/g, data.officerName);
    template = template.replace(/\[COURT_NAME\]/g, data.courtName);
    template = template.replace(/\[COURT_ADDRESS\]/g, data.courtAddress);
    template = template.replace(/\[COURT_CITY_STATE_ZIP\]/g, data.courtCityStateZip);
    template = template.replace(/\[TRUSTEE_NAME\]/g, data.trusteeName);
    template = template.replace(/\[TRUSTEE_ADDRESS\]/g, data.trusteeAddress);
    template = template.replace(/\[TRUSTEE_CITY_STATE_ZIP\]/g, data.trusteeCityStateZip);
    template = template.replace(/\[CURRENT_DATE\]/g, format(new Date(), 'MMMM d, yyyy'));
    template = template.replace(/\[RECIPIENT_NAME\]/g, data.recipientName);
    template = template.replace(/\[TRUST_NAME\]/g, data.trustName);
    template = template.replace(/\[INCIDENT_DATE\]/g, data.incidentDate);
    template = template.replace(/\[LAW_ENFORCEMENT_AGENCY\]/g, data.lawEnforcementAgency);
    template = template.replace(/\[ALLEGED_VIOLATION\]/g, data.allegedViolation);
    template = template.replace(/\[CONTACT_INFORMATION\]/g, data.contactInformation);
    
    return template;
  }
  
  // Function to compile the motor vehicle affidavit
  function compileMotorVehicleAffidavit(data: MotorVehicleAffidavitFormValues) {
    let template = getTrustTemplate("motor-vehicle-affidavit");
    
    // Replace placeholders with actual data
    template = template.replace(/\[STATE\]/g, data.state);
    template = template.replace(/\[COUNTY\]/g, data.county);
    template = template.replace(/\[FULL_NAME\]/g, data.fullName);
    template = template.replace(/\[VEHICLE_YEAR\]/g, data.vehicleYear);
    template = template.replace(/\[VEHICLE_MAKE\]/g, data.vehicleMake);
    template = template.replace(/\[VEHICLE_MODEL\]/g, data.vehicleModel);
    template = template.replace(/\[VEHICLE_VIN\]/g, data.vehicleVin);
    template = template.replace(/\[TRUST_NAME\]/g, data.trustName);
    template = template.replace(/\[ID_NUMBER\]/g, data.idNumber);
    template = template.replace(/\[ADDRESS\]/g, data.address);
    template = template.replace(/\[CITY_STATE_ZIP\]/g, data.cityStateZip);
    template = template.replace(/\[DAY\]/g, format(new Date(), 'd'));
    template = template.replace(/\[MONTH\]/g, format(new Date(), 'MMMM'));
    template = template.replace(/\[YEAR\]/g, format(new Date(), 'yyyy'));
    
    return template;
  }
  
  // Handle form submission
  function onSubmit(data: DeclarationOfTrustFormValues) {
    const compiledDoc = compileTrustDocument(data);
    setCompiledTrustDoc(compiledDoc);
    setShowDeclarationForm(false);
  }
  
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
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="create">Create Trust</TabsTrigger>
          <TabsTrigger value="manage">Manage Trusts</TabsTrigger>
          <TabsTrigger value="legal">Legal Templates</TabsTrigger>
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
        
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal Document Templates
              </CardTitle>
              <CardDescription>
                Reference legal document templates and guides for trust creation and protection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="mt-1 mr-3 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium text-amber-800">Disclaimer</h4>
                    <p className="text-sm text-amber-700">
                      These documents are provided for educational and reference purposes only and do not constitute legal advice. 
                      Always consult with a qualified attorney for specific legal guidance.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Trust Protection and Right to Travel Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <FileCheck className="h-4 w-4 mr-2" />
                      IN GOD WE TRUST Motion to Dismiss
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Constitutional rights violation and motion to dismiss with trust property protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      This document asserts constitutional rights and trust property protections when facing 
                      traffic violations. It references key case laws including Marbury v. Madison, 
                      Murdock v. Pennsylvania, Shuttlesworth v. Birmingham, and others.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Key Points:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>Assertion of constitutional rights to travel freely</li>
                        <li>Trust property protection from regulatory enforcement</li>
                        <li>Citations of relevant Supreme Court case law</li>
                        <li>Clear motion to dismiss format for legal proceedings</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => {
                        setTemplateData({
                          template: getTrustTemplate("right-to-travel"),
                          formData: undefined
                        });
                        setShowTemplatePreview(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDocumentEdit("Right to Travel Motion", getTrustTemplate("right-to-travel"))}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Document
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Motor Vehicle Affidavit
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Affidavit for non-commercial, religious right to travel, private trust ownership
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      This affidavit declares a vehicle's status as trust property used exclusively for 
                      non-commercial purposes and asserts religious right to travel protections under 
                      the First Amendment.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Key Declarations:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>Non-business and non-commercial use of the vehicle</li>
                        <li>First Amendment religious freedom protection</li>
                        <li>Private living trust ownership of the vehicle</li>
                        <li>Exemption from commercial regulations claim</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => {
                        setTemplateData({
                          template: getTrustTemplate("motor-vehicle-affidavit"),
                          formData: undefined
                        });
                        setShowTemplatePreview(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDocumentEdit("Motor Vehicle Affidavit", getTrustTemplate("motor-vehicle-affidavit"))}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Document
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Trust Creation and Asset Protection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Schedule A - Property List Template
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Comprehensive property list for trust asset inventory and protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      This exhaustive property list template can be used to document all assets protected 
                      by the terms and conditions of your trust documents.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Asset Categories Include:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>Real property, land, buildings, and fixed structures</li>
                        <li>Financial accounts, securities, and monetary instruments</li>
                        <li>Vehicles, watercraft, and transportation assets</li>
                        <li>Intellectual property rights and personal data</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => {
                        setTemplateData({
                          template: getTrustTemplate("schedule-a"),
                          formData: undefined
                        });
                        setShowTemplatePreview(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDocumentEdit("Schedule A - Property List", getTrustTemplate("schedule-a"))}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Document
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Declaration of Trust
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Essential foundation document for establishing a living trust
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      This declaration of trust template provides the fundamental structure for establishing 
                      a living trust, defining the grantor, trustees, beneficiaries, and trust purposes.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Key Sections:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>Trust establishment and declaration of intent</li>
                        <li>Trustees powers, duties, and succession</li>
                        <li>Beneficiary designations and distributions</li>
                        <li>Trust property and certificate protocols</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => setShowDeclarationForm(true)}
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      Create Document
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDocumentEdit("Declaration of Trust", getLegalTemplate("declaration-of-trust"))}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                  </CardFooter>
                </Card>
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
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
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

              <h3 className="text-lg font-medium mb-3">Document Templates</h3>
              <p className="text-gray-700 mb-4">
                The following document templates can be used as part of your traffic ticket remedy strategy. Select a template to view and customize it for your specific situation.
              </p>

              {trafficTemplateType ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {trafficTemplateType === 'right-of-rescission' && 'Right of Rescission Notice'}
                      {trafficTemplateType === 'debt-validation' && 'Debt Validation Letter'}
                      {trafficTemplateType === 'notice-of-status' && 'Notice of Status and Standing'}
                      {trafficTemplateType === 'quo-warranto' && 'Quo Warranto Challenge'}
                      {trafficTemplateType === 'abatement' && 'Notice of Abatement'}
                    </h3>
                    <Button variant="outline" onClick={() => setTrafficTemplateType(null)}>
                      Back to Templates
                    </Button>
                  </div>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="bg-gray-50 p-4 rounded mb-4 font-mono text-sm whitespace-pre-wrap">
                        {getTrafficRemedyTemplate(trafficTemplateType)}
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setTrafficTemplateType(null)}>
                          Cancel
                        </Button>
                        <Button>
                          Download Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Right of Rescission Notice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Use this template to rescind your signature on a traffic ticket within the 3-day rescission period. Establishes that the contract was signed under duress or without full disclosure.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => setTrafficTemplateType('right-of-rescission')}
                      >
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Debt Validation Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Based on the Fair Debt Collection Practices Act (15 USC 1692g), this letter demands verification of the alleged debt (traffic fine) before payment can be required.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setTrafficTemplateType('debt-validation')}
                      >
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Notice of Status and Standing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Formally establishes your status as distinct from the legal fiction, clarifies your standing, and challenges the presumption of jurisdiction by the court.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setTrafficTemplateType('notice-of-status')}
                      >
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Quo Warranto Challenge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Formally challenges the authority and jurisdiction of the court or agency by requiring them to prove their lawful authority to proceed against you.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setTrafficTemplateType('quo-warranto')}
                      >
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Notice of Abatement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Requests suspension of proceedings due to procedural errors, jurisdictional defects, or other irregularities in the process that warrant abatement.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setTrafficTemplateType('abatement')}
                      >
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
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
      
      {/* Gold Membership Modal */}
      <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <Crown className="h-5 w-5 mr-2" />
              Gold Membership Required
            </DialogTitle>
            <DialogDescription>
              Document editing is a premium feature available exclusively to Gold members.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
            <h4 className="font-medium text-sm mb-2">Gold Membership Benefits:</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <div className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0">✓</div>
                <span>Edit and customize all legal document templates</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0">✓</div>
                <span>Save unlimited custom templates to your account</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0">✓</div>
                <span>Priority support from our legal document experts</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0">✓</div>
                <span>Advanced document generation with AI assistance</span>
              </li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowMembershipModal(false)}>
              Cancel
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Upgrade to Gold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Editor Modal */}
      <Dialog open={!!editableDocument} onOpenChange={(open) => !open && setEditableDocument(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit {editableDocument?.type}
            </DialogTitle>
            <DialogDescription>
              Make changes to the document template. This editor allows full customization of the legal text.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-[400px] border rounded-md">
            <Textarea 
              className="min-h-[400px] font-mono text-sm p-4 border-0 resize-none outline-none"
              value={editedContent}
              onChange={handleDocumentContentChange}
              placeholder="Document content will appear here for editing."
            />
          </div>
          <DialogFooter className="sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setEditableDocument(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDocument} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
