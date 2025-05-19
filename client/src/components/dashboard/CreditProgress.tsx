import { useMemo } from "react";
import { ProgressCard } from "@/components/ui/progress-card";
import { useQuery } from "@tanstack/react-query";
import { Dispute } from "@/types";
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
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function CreditProgress() {
  const { toast } = useToast();
  
  // In a real app this would use the authenticated user ID
  const userId = 1; // Placeholder
  
  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', { userId }],
    enabled: false, // Disabled until real authentication is implemented
  });
  
  // Calculate progress percentage
  const progress = useMemo(() => {
    if (!disputes.length) return 65; // Default value for demonstration
    
    const resolvedCount = disputes.filter(d => d.status === 'Resolved').length;
    return Math.round((resolvedCount / disputes.length) * 100);
  }, [disputes]);
  
  const handleNewDispute = () => {
    // This would navigate to the dispute creation page
    toast({
      title: "New dispute",
      description: "Dispute creation form would open here",
    });
  };
  
  const handleTemplates = () => {
    // This would open the templates modal/page
    toast({
      title: "Templates",
      description: "Dispute letter templates would open here",
    });
  };
  
  // Mock data for the initial UI
  const sampleDisputes = [
    {
      id: 1,
      creditorName: "Chase Bank",
      disputeType: "UCC Article 8",
      dateFiled: "May 2, 2025",
      status: "Resolved"
    },
    {
      id: 2,
      creditorName: "American Express",
      disputeType: "UCC Article 9",
      dateFiled: "May 10, 2025",
      status: "In Progress"
    },
    {
      id: 3,
      creditorName: "Capital One",
      disputeType: "UCC Article 8",
      dateFiled: "April 28, 2025",
      status: "Resolved"
    }
  ];
  
  const displayDisputes = disputes.length ? disputes : sampleDisputes;
  
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
    <ProgressCard
      title="UCC Dispute Status"
      progress={progress}
      action={{
        text: "New Dispute",
        icon: <i className="fas fa-plus mr-1"></i>,
        onClick: handleNewDispute
      }}
      secondaryAction={{
        text: "Templates",
        icon: <i className="fas fa-file-alt mr-1"></i>,
        onClick: handleTemplates
      }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creditor</TableHead>
              <TableHead>Dispute Type</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading disputes...
                </TableCell>
              </TableRow>
            ) : displayDisputes.length > 0 ? (
              displayDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-medium">
                    {dispute.creditorName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {dispute.disputeType}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {dispute.dateFiled}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={getStatusBadgeColor(dispute.status)}
                      variant="outline"
                    >
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary-dark"
                      asChild
                    >
                      <Link href={`/disputes/${dispute.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No disputes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          variant="link" 
          className="text-primary font-medium text-sm hover:underline"
        >
          Load more disputes
        </Button>
      </div>
    </ProgressCard>
  );
}
