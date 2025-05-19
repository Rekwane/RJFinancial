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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { EntityType } from "@/types";

// Extend the EIN application schema with validation rules
const einFormSchema = z.object({
  userId: z.number(),
  entityName: z.string().min(2, { message: "Entity name must be at least 2 characters." }),
  entityType: z.string({ required_error: "Please select an entity type." }),
  responsibleParty: z.string().min(2, { message: "Responsible party name is required." }),
  applicationStatus: z.string().default("Draft"),
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
  };

  const form = useForm<EINFormValues>({
    resolver: zodResolver(einFormSchema),
    defaultValues,
  });

  const createEINMutation = useMutation({
    mutationFn: (data: EINFormValues) =>
      apiRequest("POST", "/api/ein-applications", data),
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
          <FormField
            control={form.control}
            name="entityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter entity name" {...field} />
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
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Trust">Trust</SelectItem>
                    <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of entity requiring an Employer Identification Number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      id: 'responsible-party',
      title: 'Responsible Party',
      description: 'Identify the person who controls, manages, or directs the entity.',
      fields: (
        <div className="space-y-6">
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
                  This person will be the contact for the IRS regarding this EIN.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your information before submitting the EIN application.',
      fields: (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Entity Name</p>
                <p className="text-base">{form.watch('entityName')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Entity Type</p>
                <p className="text-base">{form.watch('entityType')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Responsible Party</p>
                <p className="text-base">{form.watch('responsibleParty')}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            By submitting this application, you authorize our service to prepare and file 
            an EIN application with the IRS on your behalf. We will guide you through the process
            and notify you once the EIN has been issued.
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
