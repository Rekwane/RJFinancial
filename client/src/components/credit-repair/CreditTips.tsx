import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Lightbulb } from "lucide-react";
import { creditTips } from "@/lib/credit-templates";
import { Button } from "@/components/ui/button";

export function CreditTips() {
  // Additional detailed tips for UCC disputes
  const uccTips = [
    {
      title: "Understanding UCC Article 8",
      content: "UCC Article 8 governs investment securities. When applying this to credit disputes, focus on the fact that many debts are often securitized and sold as investment products. This means the original agreement has been fundamentally altered, potentially invalidating the debt obligation as it was originally constituted.",
    },
    {
      title: "Applying UCC Article 9 Effectively",
      content: "UCC Article 9 covers secured transactions. For credit disputes, focus on whether the creditor can demonstrate proper perfection of their security interest. If they cannot produce a properly filed UCC-1 financing statement or other required documentation, their claim may be challengeable.",
    },
    {
      title: "Documentation Requirements",
      content: "Always request complete documentation from creditors, including the original credit agreement, all assignments or transfers of the debt, and evidence of proper notification of these transfers. Under UCC provisions, failure to maintain proper chain of title documentation can be grounds for dispute.",
    },
    {
      title: "Strategic Dispute Timeline",
      content: "Space out your disputes strategically. Don't file all disputes simultaneously. Instead, start with 1-2 accounts, resolve those, then move to others. This approach is often more effective than attempting to dispute everything at once.",
    },
    {
      title: "Following Up Effectively",
      content: "If you don't receive a response within 30 days (the time period mandated by the FCRA), send a follow-up letter referencing your original dispute and noting the failure to respond within the legally required timeframe. This creates a paper trail for potential future legal action.",
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          Credit Repair Tips & Strategies
        </CardTitle>
        <CardDescription>
          Expert guidance to help you effectively repair your credit using UCC code provisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {uccTips.map((tip, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-medium">
                {tip.title}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="leading-relaxed">{tip.content}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {creditTips.map((tip, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">{tip.title}</h3>
                <p className="text-gray-600 mb-4">{tip.content}</p>
                <Button variant="link" className="p-0 h-auto text-primary font-medium flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
