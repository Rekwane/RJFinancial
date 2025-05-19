import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { News } from "@/types";
import { Link } from "wouter";

export function NewsFeed() {
  const { data: newsArticles = [], isLoading } = useQuery<News[]>({
    queryKey: ['/api/news'],
  });
  
  // Sample news for initial UI (will be replaced by API data)
  const sampleNews = [
    {
      id: 1,
      title: "New UCC Regulations May Impact Credit Dispute Process",
      content: "Recent changes to UCC regulations could affect how credit disputes are handled. Learn what this means for your credit repair journey.",
      category: "Financial Regulation",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-15",
      source: "Financial Times"
    },
    {
      id: 2,
      title: "IRS Updates EIN Application Process for Trusts",
      content: "The Internal Revenue Service has streamlined the process for obtaining Employer Identification Numbers for trusts and other legal entities.",
      category: "Legal Updates",
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-12",
      source: "IRS.gov"
    },
    {
      id: 3,
      title: "Financial Markets Responding to New Federal Reserve Policies",
      content: "Recent Federal Reserve announcements have caused significant movements in financial markets. Here's what investors should know.",
      category: "Market News",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-10",
      source: "Wall Street Journal"
    }
  ];
  
  const displayNews = newsArticles.length ? newsArticles : sampleNews;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Financial News & Updates</h2>
        <Link href="/news">
          <Button variant="link" className="flex items-center text-primary text-sm font-medium">
            <span>View all news</span>
            <i className="fas fa-chevron-right ml-1 text-xs"></i>
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 place-items-center py-8">
          <p className="text-gray-500">Loading news articles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayNews.map(article => (
            <Card key={article.id} className="overflow-hidden">
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-48 object-cover" 
                />
              )}
              <CardContent className="p-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <span>{article.category}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(article.publishDate)}</span>
                </div>
                <h3 className="font-semibold mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{article.content}</p>
                <Link href={`/news/${article.id}`}>
                  <Button variant="link" className="text-primary text-sm font-medium hover:underline p-0">Read more</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
