import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GavelIcon, BookOpen, FileText, AlertTriangle, Info, Shield } from "lucide-react";

export default function TrafficTicketRemedies() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample traffic ticket remedies content from the provided PDF
  const courtBasics = [
    {
      title: "The Three Branches of Government",
      content: `
        <p>To understand traffic court proceedings, it's important to understand the separation of powers:</p>
        <ul>
          <li><strong>Legislative Branch</strong>: The authority to create laws</li>
          <li><strong>Executive Branch</strong>: The authority to enforce the laws that were created</li>
          <li><strong>Judicial Branch</strong>: The authority to decide the meaning of the law and how to apply them in real life situations/cases</li>
        </ul>
        <p>When dealing with traffic tickets, you're often navigating a system where these distinctions have become blurred.</p>
      `
    },
    {
      title: "Traffic Court Jurisdiction",
      content: `
        <p>Traffic Court operates under specific jurisdictions:</p>
        <ul>
          <li>Traffic Court functions under administrative law, not common law</li>
          <li>It primarily deals with "breach of contract/trust" allegations</li>
          <li>Understanding jurisdiction is crucial for successful remedy strategies</li>
        </ul>
        <p>Knowing which jurisdiction applies to your case is fundamental to building an effective defense strategy.</p>
      `
    },
    {
      title: "12 Presumptions of Court",
      content: `
        <p>Courts operate under several key presumptions that you should be aware of:</p>
        <ul>
          <li>Presumption that you're appearing as a legal entity rather than a living person</li>
          <li>Presumption of public record</li>
          <li>Presumption of public service</li>
          <li>Presumption of oath</li>
          <li>Presumption of immunity</li>
          <li>Presumption of court registry</li>
          <li>Presumption of custody</li>
          <li>And several others that affect how your case is handled</li>
        </ul>
        <p>Understanding and addressing these presumptions can be key to challenging traffic tickets effectively.</p>
      `
    }
  ];

  const remedyStrategies = [
    {
      title: "Right of Rescission",
      content: `
        <p>The right of rescission is a legal right that allows a person to cancel certain legal contracts within a specific time period:</p>
        <ul>
          <li>Can be used to rescind your signature on traffic tickets under certain conditions</li>
          <li>Must be exercised within a specific timeframe (typically 3 business days)</li>
          <li>Requires proper documentation and notice</li>
        </ul>
        <p>When properly executed, this can effectively void the contract created when you received a traffic ticket.</p>
      `
    },
    {
      title: "Name Correction",
      content: `
        <p>There's a legal distinction between your given name and the all-caps name that appears on legal documents:</p>
        <ul>
          <li>The all-caps name (e.g., JOHN DOE) is a legal fiction separate from you as a living being</li>
          <li>Filing a proper name correction can separate you from this legal entity</li>
          <li>This distinction can be used to challenge jurisdiction in traffic cases</li>
        </ul>
        <p>Understanding the difference between your proper name and your legal name is crucial for certain traffic ticket defenses.</p>
      `
    },
    {
      title: "Noticing the Postmaster",
      content: `
        <p>This strategy involves formally notifying postal authorities about your proper name and status:</p>
        <ul>
          <li>Establishes your standing as separate from the legal fiction</li>
          <li>Creates a public record of your status declaration</li>
          <li>Can create a foundation for challenging jurisdictional claims</li>
        </ul>
        <p>This is an advanced strategy that requires careful execution and proper documentation.</p>
      `
    },
    {
      title: "Challenging Contract Breaches - 15 USC 1692",
      content: `
        <p>Since traffic tickets fundamentally represent alleged contract breaches, debt collection laws can be relevant:</p>
        <ul>
          <li>Request verification of the debt (the fine) under Fair Debt Collection Practices Act</li>
          <li>Require proper substantiation of claims against you</li>
          <li>Establish time limits for response under the law</li>
        </ul>
        <p>This approach treats the ticket as a commercial claim that must be properly validated.</p>
      `
    },
    {
      title: "Quo Warranto (By What Authority)",
      content: `
        <p>This legal concept challenges the authority of officials to act against you:</p>
        <ul>
          <li>Formally questions the jurisdiction and authority of the court/officer</li>
          <li>Requires the plaintiff to prove their authority</li>
          <li>Shifts the burden of proof to the state</li>
        </ul>
        <p>This is a formal challenge to the very foundation of the case against you.</p>
      `
    }
  ];

  const legalForms = [
    { 
      name: "Right of Rescission Notice", 
      description: "Template for rescinding your signature on traffic documents",
      category: "Administrative"
    },
    { 
      name: "Name Correction Affidavit", 
      description: "Document to establish proper name status",
      category: "Administrative"
    },
    { 
      name: "Debt Validation Letter", 
      description: "Request for validation of the alleged debt under 15 USC 1692g",
      category: "Dispute"
    },
    { 
      name: "Notice of Status and Jurisdiction", 
      description: "Formal declaration of your status and challenge to jurisdiction",
      category: "Administrative"
    },
    { 
      name: "Administrative Remedy Demand", 
      description: "Formal request for administrative remedy prior to court action",
      category: "Dispute"
    },
    { 
      name: "Abatement Notice", 
      description: "Notice demanding abatement of proceedings due to procedural errors",
      category: "Court"
    },
    { 
      name: "Quo Warranto Challenge", 
      description: "Formal challenge to the authority of the court/officer",
      category: "Court"
    }
  ];

  const legalConcepts = [
    {
      title: "Suretyship",
      content: `
        <p>Suretyship is a legal concept where one party (the surety) agrees to be responsible for the debt of another:</p>
        <ul>
          <li>In traffic court cases, you may unknowingly become the surety for a legal fiction (your NAME in all caps)</li>
          <li>Understanding this relationship allows you to separate yourself from the legal entity being charged</li>
          <li>This concept is foundational to many advanced traffic ticket remedies</li>
        </ul>
      `
    },
    {
      title: "Abatement",
      content: `
        <p>Abatement is a legal procedure that suspends court proceedings due to defects in the process:</p>
        <ul>
          <li>Can be used when proper procedures haven't been followed</li>
          <li>Challenges jurisdictional errors or procedural defects</li>
          <li>Can effectively pause or dismiss a case when properly executed</li>
        </ul>
      `
    },
    {
      title: "Estate Concepts",
      content: `
        <p>Understanding how you and your estate relate in law is crucial:</p>
        <ul>
          <li>Your estate includes everything of value that you own</li>
          <li>The legal system often treats your NAME as a separate entity from you as a living being</li>
          <li>Learning to operate as the executor of your estate rather than the surety can change your legal standing</li>
        </ul>
      `
    }
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Traffic Ticket Remedies</h1>
        <p className="text-gray-600 mt-1">
          Learn about effective strategies for addressing traffic tickets and navigating the court system.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Remedy Strategies</TabsTrigger>
          <TabsTrigger value="documents">Legal Documents</TabsTrigger>
          <TabsTrigger value="concepts">Legal Concepts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GavelIcon className="mr-2 h-5 w-5" />
                Understanding Traffic Tickets & Court Proceedings
              </CardTitle>
              <CardDescription>
                Learn the fundamentals of traffic court jurisdiction and legal standing to better address traffic tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="mt-1 mr-3 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium text-amber-800">Disclaimer</h4>
                    <p className="text-sm text-amber-700">
                      This information is provided for educational purposes only and is not legal advice. 
                      If you need specific legal guidance, please consult with a qualified attorney.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">The Legal Framework of Traffic Tickets</h3>
                <p className="text-gray-700 mb-4">
                  Traffic tickets are often treated as simple violations, but they actually represent complex legal 
                  interactions involving contract law, administrative procedures, and jurisdictional questions. 
                  Understanding this framework is the first step toward effective remedies.
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  {courtBasics.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div dangerouslySetInnerHTML={{ __html: item.content }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">When You Receive a Traffic Ticket</h3>
                <p className="text-gray-700 mb-4">
                  The moment you're issued a traffic ticket, several legal presumptions are activated. Learning to 
                  recognize and address these early can significantly impact the outcome of your case:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">What Really Happens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        When you're issued a ticket, a human being holding an "office" (title) has made a "claim" 
                        that your act either injured persons, damaged property, or breached a contract/trust. 
                        Most traffic tickets fall under the "breach of contract" category.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">The Contract Presumption</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        The system presumes you've entered into a contract by using public roads and 
                        having a driver's license. Your signature on a ticket is treated as an admission 
                        of breach and a promise to remedy the breach (pay the fine or appear in court).
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Traffic Ticket Remedy Strategies
              </CardTitle>
              <CardDescription>
                Effective approaches to address traffic tickets based on administrative and legal principles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="mt-1 mr-3 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium text-amber-800">Important Notice</h4>
                    <p className="text-sm text-amber-700">
                      These strategies require careful implementation and proper timing. Results may vary based on 
                      jurisdiction and specific circumstances. Study each approach thoroughly before attempting.
                    </p>
                  </div>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {remedyStrategies.map((strategy, index) => (
                  <AccordionItem key={index} value={`strategy-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {strategy.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div dangerouslySetInnerHTML={{ __html: strategy.content }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recommended Approach</h3>
                <p className="text-gray-700 mb-4">
                  While each case is unique, a general approach to traffic tickets often follows these steps:
                </p>
                
                <ol className="space-y-3 text-gray-700 ml-5 list-decimal">
                  <li>
                    <strong>Immediate response</strong> - Consider using right of rescission within 3 business days 
                    if applicable to your situation.
                  </li>
                  <li>
                    <strong>Document everything</strong> - Keep copies of all tickets, correspondence, and your responses.
                  </li>
                  <li>
                    <strong>Request verification</strong> - Send a formal debt validation letter under 15 USC 1692g.
                  </li>
                  <li>
                    <strong>Challenge jurisdiction</strong> - If the verification is inadequate, challenge the jurisdiction 
                    and authority of the court.
                  </li>
                  <li>
                    <strong>Administrative remedy</strong> - Exhaust all administrative remedies before court appearances.
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal Documents & Templates
              </CardTitle>
              <CardDescription>
                Essential documents for implementing traffic ticket remedies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4">
                <p className="text-gray-700">
                  The following documents can be used as part of your traffic ticket remedy strategy. 
                  Each document serves a specific purpose in the administrative and legal process.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {legalForms.map((form, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{form.name}</CardTitle>
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                          {form.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {form.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        View Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Document Preparation Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Always prepare documents in duplicate or triplicate</li>
                  <li>Consider having critical documents notarized</li>
                  <li>Send important documents via certified mail with return receipt</li>
                  <li>Keep copies of all documents in a well-organized file</li>
                  <li>Follow specific formatting requirements for legal documents in your jurisdiction</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="concepts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Understanding Key Legal Concepts
              </CardTitle>
              <CardDescription>
                Foundational legal concepts that inform effective traffic ticket remedies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <div className="flex items-start">
                  <Info className="mt-1 mr-3 h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-800">Why These Concepts Matter</h4>
                    <p className="text-sm text-blue-700">
                      Understanding these advanced legal concepts provides the foundation for more effective 
                      traffic ticket remedies. They explain the "why" behind many of the strategies and help 
                      you apply remedies more effectively.
                    </p>
                  </div>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {legalConcepts.map((concept, index) => (
                  <AccordionItem key={index} value={`concept-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {concept.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div dangerouslySetInnerHTML={{ __html: concept.content }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>The Private vs. Public Distinction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    A fundamental concept in traffic ticket remedies is understanding the difference between:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 p-4 rounded-md">
                      <h4 className="font-medium text-emerald-800 mb-2">Private Capacity</h4>
                      <ul className="list-disc pl-5 text-sm text-emerald-700 space-y-1">
                        <li>You as a living, breathing human being</li>
                        <li>Your natural rights and standing</li>
                        <li>Common law jurisdiction</li>
                        <li>Subject to natural law</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-md">
                      <h4 className="font-medium text-purple-800 mb-2">Public Capacity</h4>
                      <ul className="list-disc pl-5 text-sm text-purple-700 space-y-1">
                        <li>Your all-caps legal name/fiction</li>
                        <li>Legal privileges and benefits</li>
                        <li>Statutory jurisdiction</li>
                        <li>Subject to administrative rules</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mt-4">
                    Many effective remedies work by properly distinguishing between these two capacities 
                    and ensuring you're operating in the appropriate one for your situation.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}