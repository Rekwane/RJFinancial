import { DisputeLetterLibrary } from "@/components/credit-repair/DisputeLetterLibrary";

export default function DisputeLettersPage() {
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dispute Letter Templates</h1>
      <p className="text-gray-600 mb-8">
        Access our comprehensive library of professional dispute letter templates,
        organized by category and purpose. These templates can be downloaded,
        customized, and used to address various credit reporting issues.
      </p>
      
      <DisputeLetterLibrary />
    </div>
  );
}