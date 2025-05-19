import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { getTrustTemplate } from "@/lib/trust-templates";
import { TrustType } from "@/types";
import { Plus, Trash } from "lucide-react";

// Extend the trust document schema with validation rules
const trustFormSchema = z.object({
  userId: z.number(),
  trustName: z.string().min(2, { message: "Trust name must be at least 2 characters." }),
  trustType: z.string({ required_error: "Please select a trust type." }),
  trusteeNames: z.array(
    z.object({
      name: z.string().min(2, { message: "Trustee name must be at least 2 characters." })
    })
  ).min(1, { message: "At least one trustee is required." }),
  beneficiaryNames: z.array(
    z.object({
      name: z.string().min(2, { message: "Beneficiary name must be at least 2 characters." })
    })
  ).min(1, { message: "At least one beneficiary is required." }),
  assetsList: z.array(
    z.object({
      description: z.string().min(2, { message: "Asset description is required." }),
      value: z.string().optional(),
    })
  ).optional(),
});

type TrustFormValues = z.infer<typeof trustFormSchema>;

interface TrustFormProps {
  onSuccess?: () => void;
  onPreview?: (template: string, formData: TrustFormValues) => void;
}

export function TrustForm({ onSuccess, onPreview }: TrustFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default values for the form
  const defaultValues: Partial<TrustFormValues> = {
    userId: 1, // In a real app, this would come from auth context
    trusteeNames: [{ name: "" }],
    beneficiaryNames: [{ name: "" }],
    assetsList: [{ description: "", value: "" }],
  };

  const form = useForm<TrustFormValues>({
    resolver: zodResolver(trustFormSchema),
    defaultValues,
  });

  // Use field arrays for dynamic lists
  const trusteesFieldArray = useFieldArray({
    control: form.control,
    name: "trusteeNames",
  });

  const beneficiariesFieldArray = useFieldArray({
    control: form.control,
    name: "beneficiaryNames",
  });

  const assetsFieldArray = useFieldArray({
    control: form.control,
    name: "assetsList",
  });

  const createTrustMutation = useMutation({
    mutationFn: (data: TrustFormValues) => {
      // Transform the data to match the API expectations
      const apiData = {
        userId: data.userId,
        trustName: data.trustName,
        trustType: data.trustType,
        trusteeNames: data.trusteeNames.map(t => t.name),
        beneficiaryNames: data.beneficiaryNames.map(b => b.name),
        assetsList: data.assetsList?.length 
          ? data.assetsList.reduce((acc, asset) => {
              if (asset.description) {
                acc[asset.description] = asset.value || "N/A";
              }
              return acc;
            }, {} as Record<string, string>)
          : undefined,
      };
      
      return apiRequest("POST", "/api/trust-documents", apiData);
    },
    onSuccess: async () => {
      toast({
        title: "Trust Document Created",
        description: "Your trust document has been created successfully.",
      });
      
      // Invalidate trust documents query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/trust-documents'] });
      
      form.reset(defaultValues);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create trust document: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: TrustFormValues) {
    createTrustMutation.mutate(data);
  }

  function handlePreview() {
    const formData = form.getValues();
    const trustType = formData.trustType as TrustType;
    const template = getTrustTemplate(trustType);
    
    if (onPreview) {
      onPreview(template, formData);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Trust Document</CardTitle>
        <CardDescription>
          Set up a trust to protect your assets and provide financial security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="trustName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trust Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trust name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The official name of your trust.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trustType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trust Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trust type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Living">Living Trust</SelectItem>
                        <SelectItem value="Revocable">Revocable Trust</SelectItem>
                        <SelectItem value="Irrevocable">Irrevocable Trust</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Different trust types offer different benefits and protections.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Trustees Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Trustees</h3>
              <div className="space-y-4">
                {trusteesFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`trusteeNames.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Trustee name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => trusteesFieldArray.remove(index)}
                      disabled={trusteesFieldArray.fields.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => trusteesFieldArray.append({ name: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trustee
                </Button>
              </div>
            </div>
            
            {/* Beneficiaries Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Beneficiaries</h3>
              <div className="space-y-4">
                {beneficiariesFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`beneficiaryNames.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Beneficiary name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => beneficiariesFieldArray.remove(index)}
                      disabled={beneficiariesFieldArray.fields.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => beneficiariesFieldArray.append({ name: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Beneficiary
                </Button>
              </div>
            </div>
            
            {/* Assets Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Assets (Optional)</h3>
              <div className="space-y-4">
                {assetsFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`assetsList.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Asset description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`assetsList.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="w-1/3">
                          <FormControl>
                            <Input placeholder="Estimated value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => assetsFieldArray.remove(index)}
                      disabled={assetsFieldArray.fields.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => assetsFieldArray.append({ description: "", value: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </div>
            
            <input type="hidden" {...form.register("userId")} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePreview} disabled={createTrustMutation.isPending}>
          Preview Document
        </Button>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={createTrustMutation.isPending}
        >
          {createTrustMutation.isPending ? "Creating..." : "Create Trust Document"}
        </Button>
      </CardFooter>
    </Card>
  );
}
