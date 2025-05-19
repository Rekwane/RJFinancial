import { useState, useEffect } from "react";
import { FileText, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PDFViewerProps {
  url: string;
  title: string;
  onDownload?: () => void;
}

export function PDFViewer({ url, title, onDownload }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setError(null);
    
    // Simulate loading for demo
    // In production, this would be handled by the onload/onerror events
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // For demo, randomly introduce errors occasionally to show error state
      if (Math.random() > 0.9) {
        setError("Could not load PDF document");
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [url]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = url;
      link.download = title.replace(/\s+/g, '_') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error) {
    return (
      <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-lg font-medium">Failed to load document</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-md flex flex-col h-full">
      <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="h-4 w-4 mr-1" />
          <span className="truncate">{title}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownload}
          disabled={isLoading || !!error}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
      
      <div className="flex-grow relative">
        {isLoading ? (
          <div className="p-6 h-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <iframe 
            src={url}
            className="w-full h-full min-h-[500px]"
            title={`PDF Viewer - ${title}`}
          />
        )}
      </div>
    </div>
  );
}