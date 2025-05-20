import { useState, useEffect } from "react";
import { DataCard } from "@/components/ui/data-card";
import { CreditProgress } from "@/components/dashboard/CreditProgress";
import { DocumentManager } from "@/components/dashboard/DocumentManager";
import { StockTracker } from "@/components/dashboard/StockTracker";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { Notifications } from "@/components/dashboard/Notifications";
import { TrendingUp, FileText, Heart, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CreditReport, Dispute } from "@/types";

export default function Dashboard() {
  // In a real app, this would use the authenticated user ID
  const userId = 1; // Placeholder
  
  // Query for credit reports
  const { data: creditReports = [] } = useQuery<CreditReport[]>({
    queryKey: ['/api/credit-reports', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Query for disputes
  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Extract the most recent credit score
  const latestScore = creditReports.length > 0 
    ? Math.max(...creditReports.map(report => report.score))
    : 682; // Default demo value
  
  // Calculate the change from previous month
  const previousMonthScore = creditReports.length > 1
    ? creditReports.sort((a, b) => 
        new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
      )[1].score
    : latestScore - 15; // Default demo value
  
  const scoreChange = latestScore - previousMonthScore;
  
  // Calculate dispute statistics
  const totalDisputes = disputes.length || 8; // Default demo value
  const resolvedDisputes = disputes.filter(d => d.status === "Resolved").length || 6; // Default demo value
  
  return (
    <div className="container mx-auto">
      {/* Dedication Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-1/3 flex justify-center">
            <div className="relative">
              <img 
                src="src/assets/rayjay_dedication.png" 
                alt="In memory of Rayjay" 
                className="rounded-lg shadow-md h-64 object-contain"
              />
              <div className="absolute inset-0 rounded-lg shadow-inner border border-white/20"></div>
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">In Loving Memory of Rayjay</h2>
            <p className="text-gray-700 mb-4">
              RJFinancial was founded in memory of my beloved son, Rayjay. His bright spirit and kind heart continue to inspire us every day. 
              This platform is dedicated to his memory and carries his initials as our company name.
            </p>
            <p className="text-gray-700 mb-4">
              Through RJFinancial, we aim to help thousands of families achieve financial freedom and security.
              Each person we help is a testament to Rayjay's lasting impact on this world.
            </p>
            <p className="text-gray-600 italic">
              "Because of one child, many lives will be changed for the better."
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RJFinancial Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, John! Here's your financial overview.</p>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataCard
          title="Credit Score"
          value={latestScore.toString()}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          iconColor="bg-green-500 rounded-full"
          iconBgColor="bg-green-100"
          trend={{
            value: `+${scoreChange} points from last month`,
            direction: "up"
          }}
          details="68%"
        />
        
        <DataCard
          title="Disputes Filed"
          value={totalDisputes.toString()}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          iconColor="bg-primary rounded-full"
          iconBgColor="bg-blue-100"
          details={`${resolvedDisputes} resolved • ${totalDisputes - resolvedDisputes} in progress`}
        />
        
        <DataCard
          title="Financial Health"
          value="Good"
          icon={<Heart className="h-5 w-5 text-yellow-600" />}
          iconColor="bg-yellow-500 rounded-full"
          iconBgColor="bg-yellow-100"
          details="Debt to income ratio: 31%"
        />
        
        <DataCard
          title="Documents"
          value="12"
          icon={<Folder className="h-5 w-5 text-purple-600" />}
          iconColor="bg-purple-600 rounded-full"
          iconBgColor="bg-purple-100"
          details="5 disputes • 4 trusts • 3 reports"
        />
      </div>

      {/* Credit Repair Progress */}
      <div className="mb-6">
        <CreditProgress />
      </div>

      {/* Document Manager and Credit Tips */}
      <DocumentManager />

      {/* Stock Tracker */}
      <StockTracker />

      {/* Financial News */}
      <NewsFeed />

      {/* Notifications & Alerts */}
      <Notifications />
    </div>
  );
}
