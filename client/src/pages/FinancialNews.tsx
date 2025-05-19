import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { News, NewsCategory } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, Clock, Globe, ArrowRight, RefreshCw } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinancialNews() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  
  // Query for news articles
  const { data: newsArticles = [], isLoading, refetch } = useQuery<News[]>({
    queryKey: ['/api/news'],
  });
  
  // Sample news articles for UI display
  const sampleNews = [
    {
      id: 1,
      title: "New UCC Regulations May Impact Credit Dispute Process",
      content: "Recent changes to UCC regulations could affect how credit disputes are handled. Learn what this means for your credit repair journey.\n\nThe Uniform Commercial Code (UCC) serves as a standardized set of laws governing commercial transactions across the United States. Recent amendments to Articles 8 and 9 of the UCC have introduced significant changes to how creditors must document and verify debt ownership.\n\nThese changes are particularly important for individuals engaged in credit repair, as they provide new avenues for challenging inaccurate or unverifiable debts. Under the updated regulations, creditors must maintain a complete chain of title documentation for debts that have been sold or transferred between financial institutions.\n\nExperts suggest that these changes could potentially increase the success rate of properly structured dispute letters that specifically reference these UCC provisions. When a creditor cannot produce the required documentation, they may be required to remove the disputed item from credit reports.\n\n\"This represents a significant opportunity for consumers who have been dealing with inaccurate credit reporting,\" says financial attorney Sarah Johnson. \"Many creditors are still catching up to these regulatory changes, creating a window where well-informed consumers can effectively advocate for their rights.\"\n\nFinancialAI users are encouraged to review the dispute letter templates in the platform, which have been updated to incorporate references to these new UCC provisions.",
      category: "Financial Regulation",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-15",
      source: "Financial Times"
    },
    {
      id: 2,
      title: "IRS Updates EIN Application Process for Trusts",
      content: "The Internal Revenue Service has streamlined the process for obtaining Employer Identification Numbers for trusts and other legal entities.\n\nIn a move designed to reduce paperwork and processing times, the Internal Revenue Service (IRS) has announced significant updates to the Employer Identification Number (EIN) application process for trusts and other legal entities.\n\nEffective immediately, trust creators and trustees can utilize an enhanced online application system that provides real-time validation and immediate EIN issuance in most cases. The previous system often resulted in processing delays of several weeks, particularly for paper applications.\n\n\"This modernization effort reflects our commitment to improving service while maintaining the security and integrity of the EIN issuance process,\" said IRS Commissioner Maria Sanchez in a statement released yesterday.\n\nKey improvements include:\n\n1. Expanded online capabilities for all trust types, including revocable, irrevocable, and grantor trusts\n2. Enhanced identity verification processes that reduce the risk of fraudulent applications\n3. Streamlined documentation requirements that clarify exactly what supporting documents are needed\n4. Real-time application status tracking\n\nFor users of financial management platforms, including FinancialAI, these changes mean faster trust establishment and reduced administrative burden. The platform has already updated its guided EIN application workflow to incorporate these new streamlined procedures.\n\nFinancial advisors recommend that individuals considering trust formation take advantage of these improvements, as the reduced friction in obtaining an EIN removes one of the common barriers to establishing proper trust structures for asset protection.\n\n\"This is a welcome change that will benefit anyone involved in estate planning or asset protection strategies,\" noted estate planning attorney Michael Roberts. \"The ability to obtain an EIN immediately rather than waiting weeks significantly accelerates the trust formation process.\"",
      category: "Legal Updates",
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-12",
      source: "IRS.gov"
    },
    {
      id: 3,
      title: "Financial Markets Responding to New Federal Reserve Policies",
      content: "Recent Federal Reserve announcements have caused significant movements in financial markets. Here's what investors should know.\n\nFinancial markets experienced notable volatility following yesterday's Federal Reserve announcement regarding interest rate policy and inflation management strategies.\n\nThe Fed indicated it plans to maintain its current rate policy through the third quarter of 2025, contradicting earlier market expectations of potential rate cuts. This announcement triggered immediate reactions across equity, bond, and currency markets.\n\nMajor stock indices initially dropped on the news, with the S&P 500 declining 1.2% before recovering slightly to close down 0.8%. Technology stocks were particularly affected, with the Nasdaq composite falling 1.5%. Bond yields rose sharply, with the 10-year Treasury yield climbing 15 basis points to 3.95%.\n\n\"The Fed's messaging suggests a more hawkish stance than many investors anticipated,\" explained Maria Rodriguez, chief economist at Capital Investments. \"The commitment to keeping rates higher for longer signals continued concerns about inflationary pressures despite recent encouraging data.\"\n\nFor individual investors, these developments have several implications:\n\n1. Mortgage rates may continue rising in the near term, affecting housing affordability\n2. Fixed income investments face continued pressure as yields adjust\n3. Value stocks may outperform growth stocks in this environment\n4. Dollar strength could impact international investments\n\nFinancial advisors recommend investors review their portfolio allocations in light of these developments, particularly examining their exposure to interest-rate sensitive sectors.\n\n\"This isn't a time for panic, but rather for thoughtful reassessment,\" noted portfolio manager James Wilson. \"Ensuring your investment strategy aligns with this potentially extended high-rate environment is prudent.\"\n\nThe Fed's next meeting is scheduled for July 28-29, where further clarification of policy direction is expected.",
      category: "Market News",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-10",
      source: "Wall Street Journal"
    },
    {
      id: 4,
      title: "Credit Bureau Reforms Enhance Consumer Dispute Rights",
      content: "Recent legislative changes have strengthened consumer rights when disputing inaccuracies on credit reports.\n\nA series of regulatory reforms targeting credit reporting agencies has significantly expanded consumer rights regarding credit dispute processes. These changes, which took effect last month, provide stronger protections for individuals challenging errors on their credit reports.\n\nThe reforms require credit bureaus to conduct more thorough investigations of disputed items, with stricter timelines and documentation requirements. Additionally, the burden of proof has shifted more decisively toward creditors and credit bureaus rather than consumers.\n\n\"These are the most substantial improvements to the dispute process in over a decade,\" said consumer advocate Maria Johnson. \"Consumers now have more leverage when challenging inaccurate information.\"\n\nKey changes include:\n\n1. Extended dispute resolution deadline from 30 to 45 days\n2. Requirement for bureaus to provide specific reasons for dispute rejections\n3. Mandatory review of all consumer-submitted documentation\n4. Stricter penalties for bureaus that fail to remove unverified information\n\nFinancial experts recommend that consumers take advantage of these enhanced protections by being thorough and specific when submitting disputes. Providing detailed documentation and citing relevant regulations can significantly improve outcomes.\n\nFor those using credit repair services or software, these platforms are updating their dispute letter templates to incorporate references to the new regulations, potentially increasing effectiveness.\n\n\"This represents a meaningful shift in power toward consumers,\" noted credit attorney Robert Smith. \"We're already seeing improved response rates and more favorable outcomes in disputes filed under these new rules.\"",
      category: "Financial Regulation",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-08",
      source: "Consumer Finance"
    },
    {
      id: 5,
      title: "Asset Protection Strategies Evolving Under New Tax Framework",
      content: "Changes to estate tax laws are prompting revisions to trust structures and asset protection strategies.\n\nRecent modifications to federal estate and gift tax provisions are driving substantial changes in wealth preservation and asset protection approaches. Financial advisors and estate attorneys are guiding clients toward updated strategies that accommodate these regulatory developments.\n\nThe revised tax framework includes adjustments to lifetime exemption amounts, changes to grantor trust treatment, and new restrictions on certain valuation discounts previously used in estate planning.\n\n\"We're witnessing a significant shift in how high-net-worth individuals and families need to approach trust formation and asset protection,\" explained estate planning attorney Jennifer Martinez. \"Structures that were optimal just a year ago may now be less advantageous under the new rules.\"\n\nSeveral trust types receiving renewed attention include:\n\n1. Spousal Lifetime Access Trusts (SLATs) with modified provisions\n2. Charitable Remainder Trusts with updated distribution calculations\n3. Dynasty Trusts in jurisdictions with favorable rule against perpetuities laws\n4. Domestic Asset Protection Trusts with enhanced creditor protection features\n\nFinancial experts emphasize that existing trusts may need review and potentially modification to ensure alignment with the new tax environment.\n\n\"This isn't just about tax minimization, but about ensuring that asset protection structures continue to serve their intended purposes,\" noted certified financial planner Michael Chen. \"Many clients are finding that their existing arrangements require thoughtful adjustments to optimize benefits under the current framework.\"\n\nFor individuals considering establishing new trusts or modifying existing ones, seeking specialized legal counsel is increasingly important given the technical complexity of the new provisions.",
      category: "Legal Updates",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-05",
      source: "Financial Planning"
    },
    {
      id: 6,
      title: "Stock Market Rotation Accelerates as Economy Shifts",
      content: "Investors are rapidly shifting assets between sectors as economic indicators suggest changing growth patterns.\n\nA significant rotation between market sectors is underway as investors respond to shifting economic signals and revised growth forecasts. Traditional growth sectors are experiencing outflows while previously overlooked value sectors attract renewed interest.\n\nThis rotation follows recent economic data suggesting a more balanced growth pattern emerging across various industries, contrasting with the technology-dominated expansion of recent years.\n\n\"We're seeing a classic sector rotation play out in real time,\" observed market strategist Thomas Wu. \"Funds are flowing from high-multiple growth names into sectors with more attractive valuations that stand to benefit from the evolving economic landscape.\"\n\nSectors experiencing notable inflows include:\n\n1. Financial services, benefiting from the stable interest rate environment\n2. Healthcare, particularly companies focused on innovative treatments\n3. Infrastructure-related industries aligned with public spending initiatives\n4. Select consumer staples with strong international exposure\n\nConversely, segments of technology, premium consumer discretionary, and companies with elevated debt levels are experiencing pressure.\n\n\"This rotation doesn't necessarily indicate pessimism about the overall market,\" explained portfolio manager Sarah Johnson. \"Rather, it reflects a maturation of the current economic cycle and a more discerning approach to valuation.\"\n\nFor individual investors, financial advisors suggest reviewing portfolio allocations to ensure alignment with these evolving trends, particularly for those who may have significant concentration in recently outperforming sectors.\n\n\"Maintaining diversification becomes even more important during these transition periods,\" noted certified financial planner Robert Chen. \"The companies leading the next phase of market growth may differ significantly from those that led the last.\"",
      category: "Market News",
      imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      publishDate: "2025-05-03",
      source: "Bloomberg"
    }
  ];
  
  const displayNews = newsArticles.length ? newsArticles : sampleNews;
  
  // Filter news based on category and search query
  const filteredNews = displayNews.filter(article => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Group news by date
  const groupNewsByDate = () => {
    const groups: Record<string, News[]> = {};
    
    filteredNews.forEach(article => {
      const date = new Date(article.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(article);
    });
    
    return groups;
  };
  
  const groupedNews = groupNewsByDate();
  
  // Format publication date
  const formatPublicationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate time since publication
  const getTimeSincePublication = (dateString: string) => {
    const publicationDate = new Date(dateString);
    const now = new Date();
    const differenceInTime = now.getTime() - publicationDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    
    if (differenceInDays === 0) {
      const differenceInHours = Math.floor(differenceInTime / (1000 * 3600));
      if (differenceInHours === 0) {
        const differenceInMinutes = Math.floor(differenceInTime / (1000 * 60));
        return `${differenceInMinutes} minute${differenceInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${differenceInHours} hour${differenceInHours !== 1 ? 's' : ''} ago`;
    } else if (differenceInDays < 7) {
      return `${differenceInDays} day${differenceInDays !== 1 ? 's' : ''} ago`;
    } else if (differenceInDays < 30) {
      const differenceInWeeks = Math.floor(differenceInDays / 7);
      return `${differenceInWeeks} week${differenceInWeeks !== 1 ? 's' : ''} ago`;
    } else {
      return formatPublicationDate(dateString);
    }
  };
  
  // Get category badge styling
  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Financial Regulation':
        return 'bg-blue-100 text-blue-800';
      case 'Legal Updates':
        return 'bg-purple-100 text-purple-800';
      case 'Market News':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Financial Times':
        return 'FT';
      case 'Wall Street Journal':
        return 'WSJ';
      case 'Bloomberg':
        return 'BB';
      case 'IRS.gov':
        return 'IRS';
      default:
        return source.substring(0, 2).toUpperCase();
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial News & Updates</h1>
        <p className="text-gray-600 mt-1">Stay informed about the latest developments in the financial world.</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Input
            className="pl-10"
            placeholder="Search news articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex space-x-2">
          <Select 
            value={activeCategory} 
            onValueChange={(value) => setActiveCategory(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Financial Regulation">Financial Regulation</SelectItem>
              <SelectItem value="Legal Updates">Legal Updates</SelectItem>
              <SelectItem value="Market News">Market News</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-12 w-12 animate-spin text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Loading news...</h3>
              </CardContent>
            </Card>
          ) : filteredNews.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedNews).map(([date, articles]) => (
                <div key={date}>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">{date}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {articles.map(article => (
                      <Card key={article.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          {article.imageUrl && (
                            <div className="md:w-1/3">
                              <img 
                                src={article.imageUrl} 
                                alt={article.title} 
                                className="h-48 md:h-full w-full object-cover" 
                              />
                            </div>
                          )}
                          <div className={`p-5 flex flex-col ${article.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                            <div className="flex items-center mb-2">
                              <Badge 
                                variant="outline" 
                                className={`mr-2 ${getCategoryBadgeStyle(article.category)}`}
                              >
                                {article.category}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {getTimeSincePublication(article.publishDate)}
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {article.content.split('\n\n')[0]}
                            </p>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getSourceIcon(article.source)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">{article.source}</span>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary"
                                onClick={() => setSelectedArticle(article)}
                              >
                                Read more <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">No news articles found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms or category filter." 
                    : "There are currently no news articles in this category."}
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Explore news by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant={activeCategory === "all" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveCategory("all")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  All News
                  <Badge className="ml-auto">{displayNews.length}</Badge>
                </Button>
                
                <Button 
                  variant={activeCategory === "Financial Regulation" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveCategory("Financial Regulation")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Financial Regulation
                  <Badge className="ml-auto">
                    {displayNews.filter(a => a.category === "Financial Regulation").length}
                  </Badge>
                </Button>
                
                <Button 
                  variant={activeCategory === "Legal Updates" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveCategory("Legal Updates")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Legal Updates
                  <Badge className="ml-auto">
                    {displayNews.filter(a => a.category === "Legal Updates").length}
                  </Badge>
                </Button>
                
                <Button 
                  variant={activeCategory === "Market News" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveCategory("Market News")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Market News
                  <Badge className="ml-auto">
                    {displayNews.filter(a => a.category === "Market News").length}
                  </Badge>
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-base font-medium mb-4">Latest Updates</h3>
                <div className="space-y-4">
                  {displayNews.slice(0, 3).map(article => (
                    <div key={article.id} className="flex items-start">
                      <div 
                        className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
                          article.category === "Financial Regulation" ? "bg-blue-500" :
                          article.category === "Legal Updates" ? "bg-purple-500" :
                          "bg-green-500"
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeSincePublication(article.publishDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Article Detail Dialog */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className={`mr-2 ${getCategoryBadgeStyle(selectedArticle.category)}`}
                  >
                    {selectedArticle.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatPublicationDate(selectedArticle.publishDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">{selectedArticle.source}</span>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            {selectedArticle.imageUrl && (
              <div className="my-4">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title} 
                  className="w-full h-64 object-cover rounded-lg" 
                />
              </div>
            )}
            
            <div className="mt-2 space-y-4 text-gray-700">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Article
              </Button>
              
              <Button>
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
