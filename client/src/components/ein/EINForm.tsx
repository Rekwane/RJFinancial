import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ChevronRightIcon, Download, FileText } from "lucide-react";
import { EntityType } from "@/types";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { format } from "date-fns";

// Extend the EIN application schema with validation rules
const einFormSchema = z.object({
  userId: z.number(),
  // Line 1 - Entity Information
  entityName: z.string().min(2, { message: "Entity name must be at least 2 characters." }),
  entityType: z.string({ required_error: "Please select an entity type." }),
  tradeName: z.string().optional(),
  
  // Line 3-6 - Mailing Address
  mailingAddress: z.string().min(5, { message: "Mailing address is required." }),
  mailingCity: z.string().min(2, { message: "City is required." }),
  mailingState: z.string().min(2, { message: "State is required." }),
  mailingZip: z.string().min(5, { message: "ZIP code is required." }),
  
  // Line 7 - Physical Address (if different)
  physicalAddressDifferent: z.boolean().default(false),
  physicalAddress: z.string().optional(),
  physicalCity: z.string().optional(),
  physicalState: z.string().optional(),
  physicalZip: z.string().optional(),
  
  // Line 7b - County and State
  county: z.string().min(2, { message: "County is required." }),
  
  // Line 8a/8b - Responsible Party
  responsibleParty: z.string().min(2, { message: "Responsible party name is required." }),
  responsiblePartySSN: z.string()
    .min(9, { message: "SSN must be 9 digits." })
    .max(11, { message: "SSN cannot exceed 11 characters." })
    .optional(),
    
  // Line 9a - Entity Type 
  // (more detailed than the basic entityType field - specific IRS classifications)
  irsEntityType: z.string({ required_error: "Please select an IRS entity type." }),
  
  // Line 10 - Reason for Applying
  reasonForEIN: z.string({ required_error: "Please select a reason for applying." }),
  
  // Line 11 - Date Business Started
  startDate: z.string().min(8, { message: "Please enter a valid date." }),
  
  // Line 12 - Closing Month of Accounting Year
  accountingMonth: z.string().optional(),
  
  // Line 13 - Highest Number of Employees
  employeeCount: z.string().optional(),
  
  // Line 14 - Trust-Specific Information
  isTrust: z.boolean().default(false),
  trustType: z.string().optional(),
  trustDocumentation: z.boolean().default(false),
  
  // Line 16 - Principal Business Activity
  businessActivity: z.string().min(2, { message: "Business activity is required." }),
  
  // Line 18 - Has the applicant entity applied for an EIN before?
  appliedBefore: z.boolean().default(false),
  previousEIN: z.string().optional(),
  
  // System fields
  applicationStatus: z.string().default("Draft"),
  
  // Third-party designee
  useThirdParty: z.boolean().default(false),
  thirdPartyName: z.string().optional(),
  thirdPartyPhone: z.string().optional(),
  thirdPartyPin: z.string().optional(),
});

type EINFormValues = z.infer<typeof einFormSchema>;

interface EINFormProps {
  onSuccess?: () => void;
}

export function EINForm({ onSuccess }: EINFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formStep, setFormStep] = useState(0);

  // Default values for the form
  const defaultValues: Partial<EINFormValues> = {
    userId: 1, // In a real app, this would come from auth context
    applicationStatus: "Draft",
    physicalAddressDifferent: false,
    isTrust: false,
    trustDocumentation: false,
    appliedBefore: false,
    useThirdParty: false,
    entityType: "Trust", // Default to Trust as this is primarily a trust tool
  };

  const form = useForm<EINFormValues>({
    resolver: zodResolver(einFormSchema),
    defaultValues,
  });

  const createEINMutation = useMutation({
    mutationFn: (data: EINFormValues) =>
      apiRequest("/api/ein-applications", "POST", data),
    onSuccess: async () => {
      toast({
        title: "EIN Application Created",
        description: "Your EIN application has been created successfully.",
      });
      
      // Invalidate EIN applications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/ein-applications'] });
      
      form.reset(defaultValues);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create EIN application: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Function to generate a filled Form SS-4 PDF
  const generateSS4PDF = async () => {
    try {
      const formData = form.getValues();
      
      // Fetch the SS-4 form template (this would be a base64 encoded PDF in production)
      // For demo purposes, we'll simulate generating a simple PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([850, 1100]); // Letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add title
      page.drawText('Form SS-4: Application for Employer Identification Number', {
        x: 50,
        y: 1050,
        size: 16,
        font: boldFont
      });
      
      page.drawText('Internal Revenue Service', {
        x: 50,
        y: 1030,
        size: 12,
        font: font
      });
      
      // Add form fields with user data
      const drawFormField = (label: string, value: string, x: number, y: number) => {
        page.drawText(label + ':', {
          x,
          y,
          size: 10,
          font: boldFont
        });
        
        page.drawText(value || 'N/A', {
          x: x + 200,
          y,
          size: 10,
          font: font
        });
      };
      
      // Draw form fields
      let y = 980;
      const fieldSpacing = 25;
      
      drawFormField('1. Legal name of entity', formData.entityName, 50, y);
      y -= fieldSpacing;
      
      drawFormField('2. Trade name (if different)', formData.tradeName || 'N/A', 50, y);
      y -= fieldSpacing;
      
      drawFormField('3. Mailing address', formData.mailingAddress, 50, y);
      y -= fieldSpacing;
      
      drawFormField('City, state, ZIP', `${formData.mailingCity}, ${formData.mailingState} ${formData.mailingZip}`, 50, y);
      y -= fieldSpacing;
      
      if (formData.physicalAddressDifferent) {
        drawFormField('7a. Physical address', formData.physicalAddress || '', 50, y);
        y -= fieldSpacing;
        
        if (formData.physicalAddress) {
          drawFormField('City, state, ZIP', `${formData.physicalCity}, ${formData.physicalState} ${formData.physicalZip}`, 50, y);
          y -= fieldSpacing;
        }
      }
      
      drawFormField('7b. County and state', formData.county, 50, y);
      y -= fieldSpacing;
      
      drawFormField('8a. Responsible party', formData.responsibleParty, 50, y);
      y -= fieldSpacing;
      
      if (formData.responsiblePartySSN) {
        drawFormField('8b. SSN, ITIN, or EIN', formData.responsiblePartySSN, 50, y);
        y -= fieldSpacing;
      }
      
      drawFormField('9a. Entity type', formData.irsEntityType, 50, y);
      y -= fieldSpacing;
      
      drawFormField('10. Reason for applying', formData.reasonForEIN, 50, y);
      y -= fieldSpacing;
      
      drawFormField('11. Date business started', formData.startDate, 50, y);
      y -= fieldSpacing;
      
      drawFormField('12. Closing month of accounting year', formData.accountingMonth || 'December', 50, y);
      y -= fieldSpacing;
      
      drawFormField('13. Highest number of employees', formData.employeeCount || '0', 50, y);
      y -= fieldSpacing;
      
      if (formData.isTrust) {
        drawFormField('14. Is this application for a trust?', 'Yes', 50, y);
        y -= fieldSpacing;
        
        if (formData.trustType) {
          drawFormField('Type of trust', formData.trustType, 70, y);
          y -= fieldSpacing;
        }
      }
      
      drawFormField('16. Principal business activity', formData.businessActivity, 50, y);
      y -= fieldSpacing;
      
      drawFormField('18. Has the applicant applied for an EIN before?', formData.appliedBefore ? 'Yes' : 'No', 50, y);
      y -= fieldSpacing;
      
      if (formData.appliedBefore && formData.previousEIN) {
        drawFormField('Previous EIN', formData.previousEIN, 70, y);
        y -= fieldSpacing;
      }
      
      // Add Third Party Designee information if provided
      if (formData.useThirdParty) {
        y -= fieldSpacing;
        page.drawText('Third Party Designee', {
          x: 50,
          y,
          size: 12,
          font: boldFont
        });
        y -= fieldSpacing;
        
        if (formData.thirdPartyName) {
          drawFormField('Name', formData.thirdPartyName, 50, y);
          y -= fieldSpacing;
        }
        
        if (formData.thirdPartyPhone) {
          drawFormField('Phone', formData.thirdPartyPhone, 50, y);
          y -= fieldSpacing;
        }
        
        if (formData.thirdPartyPin) {
          drawFormField('PIN', formData.thirdPartyPin, 50, y);
          y -= fieldSpacing;
        }
      }
      
      // Add signature line
      y -= 50;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 300, y },
        thickness: 1,
      });
      
      y -= 20;
      page.drawText('Signature of applicant', {
        x: 50,
        y,
        size: 10,
        font: font
      });
      
      page.drawText(format(new Date(), 'MM/dd/yyyy'), {
        x: 350,
        y,
        size: 10,
        font: font
      });
      
      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob and save the file
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const fileName = `SS-4_Application_${formData.entityName.replace(/\s+/g, '_')}.pdf`;
      saveAs(blob, fileName);
      
      toast({
        title: "PDF Generated",
        description: "Your Form SS-4 has been downloaded. Please review before submitting to the IRS.",
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate Form SS-4 PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  function onSubmit(data: EINFormValues) {
    createEINMutation.mutate(data);
  }

  const nextFormStep = () => {
    const fieldsToValidate = formStep === 0 
      ? ['entityName', 'entityType']
      : ['responsibleParty'];

    form.trigger(fieldsToValidate as any).then(isValid => {
      if (isValid) {
        setFormStep(current => current + 1);
      }
    });
  };

  const prevFormStep = () => {
    setFormStep(current => current - 1);
  };

  // Define the steps for the EIN application
  const formSteps = [
    {
      id: 'entity-info',
      title: 'Entity Information',
      description: 'Provide details about the entity requesting an EIN.',
      fields: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="entityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity Name (Line 1)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full legal name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The official name of your trust, LLC, or corporation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Name (Line 2)</FormLabel>
                  <FormControl>
                    <Input placeholder="Doing business as (if any)" {...field} />
                  </FormControl>
                  <FormDescription>
                    The doing business as (DBA) name, if different from legal name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Entity Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of entity requiring an Employer Identification Number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="irsEntityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IRS Entity Classification (Line 9a)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select IRS entity classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="estate">Estate</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="s-corporation">S Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">Limited Liability Company</SelectItem>
                    <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                    <SelectItem value="personal-service-corp">Personal Service Corporation</SelectItem>
                    <SelectItem value="church-organization">Church Organization</SelectItem>
                    <SelectItem value="nonprofit">Other Nonprofit Organization</SelectItem>
                    <SelectItem value="farmers-cooperative">Farmers' Cooperative</SelectItem>
                    <SelectItem value="remic">REMIC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How the entity will be classified for federal tax purposes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reasonForEIN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Applying (Line 10)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason for applying" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new-business">Started new business</SelectItem>
                    <SelectItem value="banking-purpose">Banking purpose</SelectItem>
                    <SelectItem value="hired-employees">Hired employees</SelectItem>
                    <SelectItem value="created-trust">Created a trust</SelectItem>
                    <SelectItem value="pension-plan">Created a pension plan</SelectItem>
                    <SelectItem value="irs-withholding">Compliance with IRS withholding</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Why you need an Employer Identification Number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Business Started (Line 11)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="MM/DD/YYYY" {...field} />
                  </FormControl>
                  <FormDescription>
                    Date the business or trust was created.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountingMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Month of Accounting Year (Line 12)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="february">February</SelectItem>
                      <SelectItem value="march">March</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="may">May</SelectItem>
                      <SelectItem value="june">June</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="august">August</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                      <SelectItem value="november">November</SelectItem>
                      <SelectItem value="december">December</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Last month of your accounting year or tax year.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Number of Employees (Line 13)</FormLabel>
                  <FormControl>
                    <Input placeholder="0 if none" {...field} />
                  </FormControl>
                  <FormDescription>
                    Expected highest number of employees in the next 12 months.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="businessActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Business Activity (Line 16)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., asset management, investments" {...field} />
                  </FormControl>
                  <FormDescription>
                    Main economic activity of the entity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )
    },
    {
      id: 'mailing-address',
      title: 'Mailing & Physical Address',
      description: 'Enter the mailing and physical address information.',
      fields: (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Mailing Address (Lines 3-6)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mailingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County (Line 7b)</FormLabel>
                  <FormControl>
                    <Input placeholder="County name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="mailingCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mailingState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mailingZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="physicalAddressDifferent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Physical location address is different from mailing address
                  </FormLabel>
                  <FormDescription>
                    Check if the entity's physical location differs from the mailing address.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('physicalAddressDifferent') && (
            <>
              <h3 className="text-lg font-medium">Physical Address (Line 7a)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="physicalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="physicalCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="physicalState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="physicalZip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </div>
      )
    },
    {
      id: 'responsible-party',
      title: 'Responsible Party & Trust Information',
      description: 'Identify the person who controls, manages, or directs the entity and trust-specific information.',
      fields: (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Responsible Party (Lines 8a-8b)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="responsibleParty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsible Party Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full legal name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Person who controls, manages, or directs the entity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responsiblePartySSN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSN / ITIN (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="XXX-XX-XXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Social Security Number or Individual Taxpayer ID of responsible party.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="isTrust"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    This application is for a Trust (Line 14)
                  </FormLabel>
                  <FormDescription>
                    Check if you are applying for an EIN for a trust.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('isTrust') && (
            <>
              <FormField
                control={form.control}
                name="trustType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Trust</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trust type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="living-trust">Living Trust</SelectItem>
                        <SelectItem value="revocable-trust">Revocable Trust</SelectItem>
                        <SelectItem value="irrevocable-trust">Irrevocable Trust</SelectItem>
                        <SelectItem value="family-trust">Family Trust</SelectItem>
                        <SelectItem value="business-trust">Business Trust</SelectItem>
                        <SelectItem value="land-trust">Land Trust</SelectItem>
                        <SelectItem value="asset-protection-trust">Asset Protection Trust</SelectItem>
                        <SelectItem value="statutory-trust">Statutory Trust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trustDocumentation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I have the trust documentation
                      </FormLabel>
                      <FormDescription>
                        Check to confirm you have a properly executed trust document.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}
          
          <FormField
            control={form.control}
            name="appliedBefore"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Has the applicant entity applied for an EIN before? (Line 18)
                  </FormLabel>
                  <FormDescription>
                    Check if this entity previously applied for an EIN.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('appliedBefore') && (
            <FormField
              control={form.control}
              name="previousEIN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous EIN</FormLabel>
                  <FormControl>
                    <Input placeholder="XX-XXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the previously assigned EIN if known.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )
    },
    {
      id: 'third-party',
      title: 'Third Party Designee',
      description: 'Optionally authorize a third party to receive the EIN and answer questions about the application.',
      fields: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="useThirdParty"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Designate Third Party
                  </FormLabel>
                  <FormDescription>
                    Check if you want to authorize another person to receive the EIN and answer questions about this application.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('useThirdParty') && (
            <>
              <FormField
                control={form.control}
                name="thirdPartyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designee's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="thirdPartyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designee's Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(XXX) XXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="thirdPartyPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Identification Number (PIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="5-digit PIN" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a 5-digit PIN for the third party designee.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </div>
      )
    },
    {
      id: 'review',
      title: 'Review & Generate Form SS-4',
      description: 'Review your information and generate the Form SS-4 for submission to the IRS.',
      fields: (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-4">Entity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Legal Name</p>
                <p className="text-base">{form.watch('entityName') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trade Name</p>
                <p className="text-base">{form.watch('tradeName') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Entity Type</p>
                <p className="text-base">{form.watch('entityType') || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">IRS Classification</p>
                <p className="text-base">{form.watch('irsEntityType') || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Business Started</p>
                <p className="text-base">{form.watch('startDate') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Accounting Month</p>
                <p className="text-base">{form.watch('accountingMonth') || 'December'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Mailing Address</p>
                <p className="text-base">
                  {form.watch('mailingAddress')}, {form.watch('mailingCity')}, {form.watch('mailingState')} {form.watch('mailingZip')}
                </p>
              </div>
              {form.watch('physicalAddressDifferent') && form.watch('physicalAddress') && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Physical Address</p>
                  <p className="text-base">
                    {form.watch('physicalAddress')}, {form.watch('physicalCity')}, {form.watch('physicalState')} {form.watch('physicalZip')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">County</p>
                <p className="text-base">{form.watch('county') || 'Not provided'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-4">Responsible Party</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base">{form.watch('responsibleParty') || 'Not provided'}</p>
              </div>
              {form.watch('responsiblePartySSN') && (
                <div>
                  <p className="text-sm font-medium text-gray-500">SSN/ITIN</p>
                  <p className="text-base">***-**-{form.watch('responsiblePartySSN')?.slice(-4) || '****'}</p>
                </div>
              )}
            </div>
            
            {form.watch('isTrust') && (
              <>
                <h3 className="text-lg font-medium mt-6 mb-4">Trust Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Trust Type</p>
                    <p className="text-base">{form.watch('trustType') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Documentation</p>
                    <p className="text-base">{form.watch('trustDocumentation') ? 'Available' : 'Not available'}</p>
                  </div>
                </div>
              </>
            )}
            
            {form.watch('useThirdParty') && form.watch('thirdPartyName') && (
              <>
                <h3 className="text-lg font-medium mt-6 mb-4">Third Party Designee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-base">{form.watch('thirdPartyName')}</p>
                  </div>
                  {form.watch('thirdPartyPhone') && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base">{form.watch('thirdPartyPhone')}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-blue-800">
                  Click the "Generate Form SS-4" button below to create a filled-out PDF that you can print, sign, and submit to the IRS. 
                  You can also save this application in our system.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={generateSS4PDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Form SS-4 PDF
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            By submitting this application, you authorize our service to prepare and store 
            an EIN application with your provided information. For final submission to the IRS, 
            you will need to sign the generated form and submit it according to IRS instructions.
          </p>
        </div>
      )
    }
  ];

  const currentStep = formSteps[formStep];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Apply for an EIN</CardTitle>
            <CardDescription>
              Obtain an Employer Identification Number (EIN) from the IRS for your trust or business entity.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {formSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    index === formStep 
                      ? 'bg-primary text-white' 
                      : index < formStep 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index < formStep ? <CheckIcon className="h-3 w-3" /> : index + 1}
                </div>
                {index < formSteps.length - 1 && (
                  <ChevronRightIcon className="h-4 w-4 mx-1 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium">{currentStep.title}</h3>
          <p className="text-gray-600 text-sm">{currentStep.description}</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep.fields}
            <input type="hidden" {...form.register("userId")} />
            <input type="hidden" {...form.register("applicationStatus")} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {formStep > 0 && (
          <Button variant="outline" onClick={prevFormStep} disabled={createEINMutation.isPending}>
            Previous
          </Button>
        )}
        {formStep < formSteps.length - 1 ? (
          <Button 
            onClick={nextFormStep}
            className="ml-auto"
            disabled={createEINMutation.isPending}
          >
            Next
          </Button>
        ) : (
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            className="ml-auto"
            disabled={createEINMutation.isPending}
          >
            {createEINMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
