import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Award, 
  Shield, 
  CreditCard, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Lightbulb,
  BookOpen,
  Share2,
  CheckCircle,
  PlayCircle
} from "lucide-react";

// Define our credit tips categories
interface CreditTipCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Define tip interface
interface CreditTip {
  id: string;
  category: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  timeToImplement: string;
  potentialPointsGain: string;
  source?: string;
  isUCCRelated?: boolean;
}

// Define categories
const categories: CreditTipCategory[] = [
  {
    id: "fundamentals",
    name: "Credit Fundamentals",
    description: "Master the basics of credit building and maintenance",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    id: "repair",
    name: "Rapid Repair",
    description: "Fast-track techniques to improve your score",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-emerald-500"
  },
  {
    id: "advanced",
    name: "Advanced Strategies",
    description: "Expert-level tactics for optimal results",
    icon: <Award className="w-5 h-5" />,
    color: "bg-purple-500"
  },
  {
    id: "protection",
    name: "Identity Protection",
    description: "Safeguard your credit and personal information",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-amber-500"
  },
  {
    id: "ucc",
    name: "UCC Strategies",
    description: "Leveraging UCC Articles 8 & 9 for credit improvement",
    icon: <CreditCard className="w-5 h-5" />,
    color: "bg-red-500"
  }
];

// Credit tips data
const creditTips: CreditTip[] = [
  {
    id: "1",
    category: "fundamentals",
    title: "Payment History: The 35% Golden Rule",
    content: "Payment history accounts for 35% of your FICO score. Set up automatic payments for at least the minimum due to ensure you never miss a deadline. Even a single 30-day late payment can drop your score by 80-110 points and stay on your report for 7 years. If you've had a perfect payment history for several years and miss a payment due to extraordinary circumstances, contact your creditor immediately to request a goodwill adjustment.",
    difficulty: "easy",
    timeToImplement: "1 day",
    potentialPointsGain: "Up to 100+ points (if recovering from late payments)"
  },
  {
    id: "2",
    category: "fundamentals",
    title: "Credit Utilization: The 30% Threshold",
    content: "Credit utilization accounts for 30% of your score. Keep your total credit card balances below 30% of your total available credit for good scores, but aim for 10% or less for excellent scores. Pro tip: Ask for credit limit increases every 6-12 months without hard inquiries, and consider paying balances before statement closing dates rather than due dates to report lower utilization.",
    difficulty: "easy",
    timeToImplement: "Immediate",
    potentialPointsGain: "20-50 points"
  },
  {
    id: "3",
    category: "repair",
    title: "Rapid Rescore After Debt Payoff",
    content: "After paying down significant debt, request a rapid rescore through your mortgage lender or loan officer. This expedites the updating of your credit report and can show improvements in as little as 2-3 days instead of waiting for the standard 30-45 day reporting cycle. The rapid rescore service typically costs $25-75 per account per bureau but can be worth it if you're in the middle of a loan application process and need a score boost fast.",
    difficulty: "medium",
    timeToImplement: "2-5 days",
    potentialPointsGain: "20-40 points"
  },
  {
    id: "4",
    category: "repair",
    title: "The 'Debt Validation' Power Move",
    content: "Under the Fair Debt Collection Practices Act (FDCPA), you have the right to request debt validation within 30 days of being contacted by a collector. Send a debt validation letter requiring them to provide proof that the debt is yours and they have the legal right to collect it. If they can't provide proper documentation (which happens more often than you'd think), they legally can't continue collection efforts or report the account to credit bureaus. Use certified mail with return receipt for proof of your request.",
    difficulty: "medium",
    timeToImplement: "30-60 days",
    potentialPointsGain: "50-150 points (if items are removed)"
  },
  {
    id: "5",
    category: "advanced",
    title: "Strategic 'Authorized User' Piggybacking",
    content: "Become an authorized user on an account with perfect payment history, low utilization, and a long history. The account's full history often appears on your credit report. Family members or trusted friends with excellent credit can add you to their accounts without giving you physical card access. This technique works best when the primary account holder has a higher score than you. Target accounts that are at least 2 years old with no late payments and low utilization.",
    difficulty: "medium",
    timeToImplement: "1-2 billing cycles",
    potentialPointsGain: "30-60 points"
  },
  {
    id: "6",
    category: "advanced",
    title: "The Credit Mix Maximizer",
    content: "Credit mix accounts for 10% of your FICO score. Lenders like to see that you can handle different types of credit responsibly. If you only have credit cards, consider adding a small installment loan like a credit builder loan from Self or a secured loan from your local credit union. Conversely, if you only have installment loans (auto, student, mortgage), adding a secured credit card can boost your mix. Aim to have both revolving accounts (credit cards) and installment loans (auto, mortgage, personal) for the optimal mix.",
    difficulty: "medium",
    timeToImplement: "1-3 months",
    potentialPointsGain: "20-30 points"
  },
  {
    id: "7",
    category: "protection",
    title: "The Credit Freeze Shield",
    content: "Place a security freeze on your credit reports at all three major bureaus (Equifax, Experian, and TransUnion). This prevents new accounts from being opened in your name since potential creditors can't access your credit report. It's free to freeze and unfreeze your credit when needed for legitimate applications. This is the single most effective way to prevent identity theft. For added protection, freeze your reports at Innovis and ChexSystems too, which are smaller bureaus that some lenders check.",
    difficulty: "easy",
    timeToImplement: "15-30 minutes",
    potentialPointsGain: "Not direct score impact, but prevents potential damage"
  },
  {
    id: "8",
    category: "protection",
    title: "Opt Out of Prescreened Offers",
    content: "Visit OptOutPrescreen.com or call 1-888-5-OPT-OUT to remove yourself from prescreened credit and insurance offers for five years or permanently. This reduces opportunities for identity thieves to intercept credit offers from your mail. It also reduces the risk of unnecessary hard inquiries if someone tries to accept these offers in your name. As a bonus, it decreases your carbon footprint by reducing junk mail.",
    difficulty: "easy",
    timeToImplement: "5 minutes",
    potentialPointsGain: "Not direct score impact, but prevents potential damage"
  },
  {
    id: "9",
    category: "ucc",
    title: "UCC Article 9 Secured Party Status",
    content: "Under UCC Article 9, you can establish yourself as a secured party creditor in relation to your own NAME/Strawman by filing a UCC-1 Financing Statement. This creates a security interest in all assets and property of the debtor (your legal name as it appears on government documents). When filing a security agreement, make it specific as to what collateral is being secured, including credit accounts, personal property, and future earnings. Once filed, you can use this secured party status to challenge the validation of debts and credit reporting practices using specific language referring to your rights under UCC §9-210 and §9-625.",
    difficulty: "advanced",
    timeToImplement: "1-3 months",
    potentialPointsGain: "Varies widely",
    isUCCRelated: true
  },
  {
    id: "10",
    category: "ucc",
    title: "UCC Article 8 Investment Securities Approach",
    content: "UCC Article 8 provides a framework for treating certain obligations as investment securities. By properly documenting your relationship with creditors as 'investment securities' under UCC §8-102, you can establish that credit accounts are actually securities transactions rather than simple debtor-creditor relationships. This approach is used to challenge the standing of collection agencies to enforce debts by requiring evidence of proper transfer of the investment security in accordance with UCC §8-301 through §8-307. Success with this approach depends on properly executed documentation and persistence through multiple rounds of correspondence.",
    difficulty: "advanced",
    timeToImplement: "3-6 months",
    potentialPointsGain: "50-200 points (if items are removed)",
    isUCCRelated: true
  },
  {
    id: "11",
    category: "fundamentals",
    title: "FICO Resilience Index: The New Scoring Factor",
    content: "In addition to your FICO score, lenders now use the FICO Resilience Index to assess how well you might weather financial hardships. This score ranges from 1-99, with lower scores being better. To improve this score: maintain multiple accounts in good standing, keep credit card balances low, demonstrate long-term responsibility with credit, and avoid opening too many new accounts in a short period. This score becomes particularly important during economic downturns when lenders tighten approval standards.",
    difficulty: "medium",
    timeToImplement: "6-12 months",
    potentialPointsGain: "Indirect benefit for approval odds"
  },
  {
    id: "12",
    category: "repair",
    title: "The 'Goodwill Saturation' Method",
    content: "For accounts with late payments but otherwise good history, implement the 'goodwill saturation' approach. Instead of sending a single goodwill letter, send one every 30 days for 3-4 months to different addresses at the creditor: customer service, executive offices, and even the CEO (email addresses can often be found online). Include your story, loyalty as a customer, and how the late payment is affecting your life goals. Success rates increase with persistence. Target accounts where you've had at least 12 on-time payments since the late payment occurred.",
    difficulty: "medium",
    timeToImplement: "3-4 months",
    potentialPointsGain: "Up to 110 points per late payment removed"
  }
];

export default function CreditTipsPage() {
  const [category, setCategory] = useState("fundamentals");
  
  const filteredTips = creditTips.filter(tip => tip.category === category);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80
      }
    }
  };
  
  // Difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "easy": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Next-Level Credit Tips
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          These aren't your average credit tips. Discover advanced strategies, insider techniques, and proven methods that most financial advisors won't tell you about.
        </p>
      </div>
      
      {/* Featured Tip */}
      <div className="mb-12 relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 p-8 md:p-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Featured Tip</Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">The UCC Advantage: Beyond Traditional Credit Repair</h2>
              <p className="text-gray-700 mb-6">
                While most focus on dispute letters alone, the strategic application of UCC Articles 8 and 9 
                creates a legal framework that can fundamentally change your relationship with creditors. 
                Our exclusive UCC-based approach has helped clients achieve removals where traditional methods failed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Tutorial
                </Button>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Explore UCC Strategies
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                  <TrendingUp className="w-20 h-20 md:w-24 md:h-24 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xl">
                  New
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <Tabs defaultValue="fundamentals" value={category} onValueChange={setCategory} className="mb-8">
        <TabsList className="mb-2 w-full flex flex-nowrap overflow-x-auto pb-1 justify-start">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center">
              <span className={`w-6 h-6 rounded-full ${cat.color} flex items-center justify-center mr-2 text-white`}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{cat.name}</h2>
                <p className="text-gray-600">{cat.description}</p>
              </div>
              {cat.id === 'ucc' && (
                <Badge className="bg-blue-100 text-blue-800">UCC-Based Strategies</Badge>
              )}
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {filteredTips.map(tip => (
                <motion.div key={tip.id} variants={itemVariants}>
                  <Card className="overflow-hidden border-t-4 hover:shadow-lg transition-all duration-300">
                    <div className={`absolute h-1 top-0 inset-x-0 ${tip.isUCCRelated ? "bg-red-500" : "bg-blue-500"}`}></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{tip.title}</CardTitle>
                        <Badge className={getDifficultyColor(tip.difficulty)}>
                          {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {tip.isUCCRelated && (
                          <span className="inline-flex items-center text-red-600 font-medium mb-1">
                            <CreditCard className="mr-1 h-3 w-3" /> UCC-Based Strategy
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">
                        {tip.content}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-4 w-4 text-blue-500" />
                          <span>Time: {tip.timeToImplement}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                          <span>Potential Gain: {tip.potentialPointsGain}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <Share2 className="mr-1 h-4 w-4" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <BookOpen className="mr-1 h-4 w-4" />
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Quick Tips Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Lightbulb className="mr-2 h-6 w-6 text-amber-500" />
          Quick Impact Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">The 7-Year Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Most negative items fall off your report after 7 years. Chapter 7 bankruptcies last 10 years. Hard inquiries only impact your score for 12 months but remain visible for 2 years.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">The All-Cash Month</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Try using only cash for non-fixed expenses for one month. Studies show people spend 12-18% less when using cash versus cards, helping to reduce debt faster.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-lg">Credit Repair Scam Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Avoid companies promising a "new credit identity" or suggesting you dispute everything on your report regardless of accuracy. These are illegal practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quote/Testimonial */}
      <div className="my-16 bg-gray-50 rounded-xl p-8 relative">
        <div className="absolute -top-5 left-8">
          <span className="text-6xl text-purple-300">"</span>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xl italic text-gray-700 mb-4">
            I went from a 590 to a 720 in 9 months using the UCC strategies outlined here. The difference in interest rates saved me over $40,000 on my mortgage.
          </p>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              JM
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium">James M.</p>
              <p className="text-sm text-gray-500">Dallas, TX</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Credit?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our exclusive UCC-based dispute system has helped thousands improve their scores by an average of 83 points in the first 60 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <CheckCircle className="mr-2 h-5 w-5" />
              Get Your Free Credit Analysis
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}