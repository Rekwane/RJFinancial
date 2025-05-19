import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { DownloadIcon, Printer, Copy } from "lucide-react";

interface DisputeLetterTemplateProps {
  template: string;
  formData?: {
    creditorName?: string;
    accountNumber?: string;
    disputeType?: string;
    reason?: string;
  };
  onClose?: () => void;
  onSave?: (content: string) => void;
}

export function DisputeLetterTemplate({ 
  template, 
  formData, 
  onClose,
  onSave
}: DisputeLetterTemplateProps) {
  const { toast } = useToast();
  const [letterContent, setLetterContent] = useState(template);

  useEffect(() => {
    if (formData) {
      let updatedContent = template;
      
      if (formData.creditorName) {
        updatedContent = updatedContent.replace(/\[CREDITOR_NAME\]/g, formData.creditorName);
      }
      
      if (formData.accountNumber) {
        updatedContent = updatedContent.replace(/\[ACCOUNT_NUMBER\]/g, formData.accountNumber);
      } else {
        updatedContent = updatedContent.replace(/\[ACCOUNT_NUMBER\]/g, "N/A");
      }
      
      updatedContent = updatedContent.replace(/\[REPORTED_BALANCE\]/g, "$0.00");
      updatedContent = updatedContent.replace(/\[DATE\]/g, new Date().toLocaleDateString());
      updatedContent = updatedContent.replace(/\[MONTH\]/g, new Date().toLocaleString('default', { month: 'long' }));
      updatedContent = updatedContent.replace(/\[YEAR\]/g, new Date().getFullYear().toString());
      
      // Add the dispute reason if available
      if (formData.reason) {
        updatedContent = updatedContent.replace(/\[REASON\]/g, formData.reason);
      }
      
      setLetterContent(updatedContent);
    }
  }, [template, formData]);

  const handleSaveDocument = () => {
    if (onSave) {
      onSave(letterContent);
    } else {
      // Default save behavior
      toast({
        title: "Document Saved",
        description: "Your dispute letter has been saved successfully.",
      });
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(letterContent);
    toast({
      title: "Copied to Clipboard",
      description: "The letter content has been copied to clipboard.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Dispute Letter</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.5;
                margin: 40px;
              }
              pre {
                white-space: pre-wrap;
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>
            <pre>${letterContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      toast({
        title: "Print Failed",
        description: "Your browser blocked the popup. Please allow popups to print.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dispute-letter.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your dispute letter is downloading.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UCC Dispute Letter Template</CardTitle>
        <CardDescription>
          Customize this template before sending it to the credit bureau or creditor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={letterContent}
          onChange={(e) => setLetterContent(e.target.value)}
          className="font-mono min-h-[500px] text-sm"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSaveDocument}>
            Save Document
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
