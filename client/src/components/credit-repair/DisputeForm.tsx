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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisputeTemplate } from "@/lib/credit-templates";
import { DisputeType } from "@/types";

// Extend the dispute schema with validation rules
const disputeFormSchema = z.object({
  userId: z.number(),
  creditorName: z.string().min(2, { message: "Creditor name must be at least 2 characters." }),
  accountNumber: z.string().optional(),
  disputeType: z.string({ required_error: "Please select a dispute type." }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
  status: z.string().default("In Progress"),
});

type DisputeFormValues = z.infer<typeof disputeFormSchema>;

interface DisputeFormProps {
  onSuccess?: () => void;
  onPreview?: (template: string, formData: DisputeFormValues) => void;
}

export function DisputeForm({ onSuccess, onPreview }: DisputeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Default values for the form
  const defaultValues: Partial<DisputeFormValues> = {
    userId: 1, // In a real app, this would come from auth context
    status: "In Progress",
  };

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues,
  });

  const createDisputeMutation = useMutation({
    mutationFn: (data: DisputeFormValues) =>
      apiRequest("POST", "/api/disputes", data),
    onSuccess: async () => {
      toast({
        title: "Dispute Created",
        description: "Your dispute has been created successfully.",
      });
      
      // Invalidate disputes query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      
      form.reset(defaultValues);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create dispute: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: DisputeFormValues) {
    createDisputeMutation.mutate(data);
  }

  function handlePreview() {
    const formData = form.getValues();
    const disputeType = formData.disputeType as DisputeType;
    const template = getDisputeTemplate(disputeType);
    
    if (onPreview) {
      onPreview(template, formData);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create UCC Dispute</CardTitle>
        <CardDescription>
          File a dispute with creditors using UCC Articles 8 & 9 for effective credit repair.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="creditorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creditor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter creditor name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the creditor or financial institution.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormDescription>
                      The account number associated with this dispute.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="disputeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dispute type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UCC Article 8">UCC Article 8 - Investment Securities</SelectItem>
                      <SelectItem value="UCC Article 9">UCC Article 9 - Secured Transactions</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    UCC Article 8 applies to investment securities, while Article 9 applies to secured transactions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this dispute"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about why you're disputing this account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register("userId")} />
            <input type="hidden" {...form.register("status")} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePreview} disabled={createDisputeMutation.isPending}>
          Preview Letter
        </Button>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={createDisputeMutation.isPending}
        >
          {createDisputeMutation.isPending ? "Creating..." : "Create Dispute"}
        </Button>
      </CardFooter>
    </Card>
  );
}
