import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CreditRepair from "@/pages/CreditRepair";
import TrustDocuments from "@/pages/TrustDocuments";
import TrafficTicketRemedies from "@/pages/TrafficTicketRemedies";
import EINApplication from "@/pages/EINApplication";
import StockInvestment from "@/pages/StockInvestment";
import Documents from "@/pages/Documents";
import FinancialNews from "@/pages/FinancialNews";
import NotificationsPage from "@/pages/NotificationsPage";
import DisputeLettersPage from "@/pages/DisputeLettersPage";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const isAuthRoute = location === "/login" || location === "/register";

  return (
    <>
      {!isAuthRoute && <Header />}
      <div className="flex flex-1 overflow-hidden">
        {!isAuthRoute && <Sidebar />}
        <main className={!isAuthRoute ? "flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6" : ""}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/credit-repair" component={CreditRepair} />
            <Route path="/dispute-letters" component={DisputeLettersPage} />
            <Route path="/credit-tips" component={CreditRepair} />
            <Route path="/trust" component={TrustDocuments} />
            <Route path="/traffic-tickets" component={TrafficTicketRemedies} />
            <Route path="/ein" component={EINApplication} />
            <Route path="/stocks" component={StockInvestment} />
            <Route path="/watchlist" component={StockInvestment} />
            <Route path="/documents" component={Documents} />
            <Route path="/news" component={FinancialNews} />
            <Route path="/notifications" component={NotificationsPage} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      {!isAuthRoute && (
        <div id="mobile-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden hidden"></div>
      )}
    </>
  );
}

function App() {
  // Add this hook to ensure mobile navigation closes when route changes
  const [location] = useLocation();

  useEffect(() => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
