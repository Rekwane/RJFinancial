import { Link, useLocation } from "wouter";
import {
  BarChart, CreditCard, File, FileText, Folder, 
  Heart, IdCard, Lightbulb, Mail, ShieldAlert, TrendingUp, Eye, BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <>
      <aside id="sidebar" className="bg-white border-r border-gray-200 w-64 flex-shrink-0 h-[calc(100vh-60px)] overflow-y-auto transition-all duration-300 transform fixed lg:relative lg:translate-x-0 -translate-x-full z-40">
        <nav className="p-4">
          <div className="space-y-1">
            <NavLink 
              href="/dashboard" 
              icon={<BarChart className="h-5 w-5" />} 
              label="Dashboard" 
              isActive={location === "/dashboard"}
            />

            {/* Business Management Section */}
            <NavSection title="Business Management">
              <NavLink 
                href="/income" 
                icon={<CreditCard className="h-5 w-5" />} 
                label="Income & Expenses" 
                isActive={location === "/income"}
              />
              <NavLink 
                href="/reports" 
                icon={<BarChart className="h-5 w-5" />} 
                label="Financial Reports" 
                isActive={location === "/reports"}
              />
            </NavSection>

            {/* Credit Repair Section */}
            <NavSection title="Credit Repair">
              <NavLink 
                href="/credit-repair" 
                icon={<File className="h-5 w-5" />} 
                label="UCC Disputes" 
                isActive={location === "/credit-repair"}
              />
              <NavLink 
                href="/dispute-letters" 
                icon={<Mail className="h-5 w-5" />} 
                label="Dispute Letters" 
                isActive={location === "/dispute-letters"}
              />
              <NavLink 
                href="/credit-tips" 
                icon={<Lightbulb className="h-5 w-5" />} 
                label="Credit Tips" 
                isActive={location === "/credit-tips"}
              />
            </NavSection>

            {/* Trust & Legal Section */}
            <NavSection title="Trust & Legal">
              <NavLink 
                href="/trust" 
                icon={<ShieldAlert className="h-5 w-5" />} 
                label="Trust Documents" 
                isActive={location === "/trust"}
              />
              <NavLink 
                href="/ein" 
                icon={<IdCard className="h-5 w-5" />} 
                label="EIN Applications" 
                isActive={location === "/ein"}
              />
            </NavSection>

            {/* Investment Section */}
            <NavSection title="Investments">
              <NavLink 
                href="/stocks" 
                icon={<TrendingUp className="h-5 w-5" />} 
                label="Stock Tracker" 
                isActive={location === "/stocks"}
              />
              <NavLink 
                href="/watchlist" 
                icon={<Eye className="h-5 w-5" />} 
                label="Watchlist" 
                isActive={location === "/watchlist"}
              />
            </NavSection>

            {/* Tools Section */}
            <NavSection title="Tools">
              <NavLink 
                href="/documents" 
                icon={<Folder className="h-5 w-5" />} 
                label="Document Manager" 
                isActive={location === "/documents"}
              />
              <NavLink 
                href="/news" 
                icon={<FileText className="h-5 w-5" />} 
                label="Financial News" 
                isActive={location === "/news"}
              />
              <NavLink 
                href="/notifications" 
                icon={<BellRing className="h-5 w-5" />} 
                label="Notifications" 
                isActive={location === "/notifications"}
                badge="3"
              />
            </NavSection>
          </div>
        </nav>
      </aside>
      <div id="mobile-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden hidden" onClick={() => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        if (sidebar && overlay) {
          sidebar.classList.add('-translate-x-full');
          overlay.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }
      }}></div>
    </>
  );
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="mt-6">
      <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: string;
}

function NavLink({ href, icon, label, isActive, badge }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700",
        isActive 
          ? "bg-primary bg-opacity-10 text-primary font-medium" 
          : "hover:bg-gray-100"
      )}>
        {icon}
        <span>{label}</span>
        {badge && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
}
