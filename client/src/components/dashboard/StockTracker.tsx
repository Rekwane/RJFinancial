import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Stock } from "@/types";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StockTracker() {
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  const { data: stocks = [], isLoading } = useQuery<Stock[]>({
    queryKey: ['/api/stocks', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Mock stocks for initial UI
  const sampleStocks = [
    {
      id: 1,
      userId: 1,
      symbol: "AAPL",
      company: "Apple Inc.",
      quantity: 10,
      purchasePrice: "150.00",
      addedDate: "2025-01-15",
      currentPrice: "178.42",
      change: "+2.34",
      changePercent: "+1.32%"
    },
    {
      id: 2,
      userId: 1,
      symbol: "MSFT",
      company: "Microsoft Corp.",
      quantity: 5,
      purchasePrice: "300.00",
      addedDate: "2025-02-10",
      currentPrice: "345.67",
      change: "+5.23",
      changePercent: "+1.54%"
    },
    {
      id: 3,
      userId: 1,
      symbol: "GOOGL",
      company: "Alphabet Inc.",
      quantity: 2,
      purchasePrice: "125.00",
      addedDate: "2025-03-05",
      currentPrice: "123.45",
      change: "-1.87",
      changePercent: "-1.52%"
    }
  ];
  
  const displayStocks = stocks.length ? stocks : sampleStocks;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Stock Watchlist</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center text-gray-600 text-sm font-medium border border-gray-300 hover:bg-gray-50">
            <Plus className="mr-1 h-4 w-4" />
            <span>Add Stock</span>
          </Button>
          <Link href="/stocks">
            <Button variant="link" className="flex items-center text-primary text-sm font-medium">
              <span>View all</span>
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Change %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading stocks...
                  </TableCell>
                </TableRow>
              ) : displayStocks.length > 0 ? (
                displayStocks.map(stock => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell className="text-sm text-gray-600">{stock.company}</TableCell>
                    <TableCell className="text-sm text-gray-600">${stock.currentPrice}</TableCell>
                    <TableCell 
                      className={`text-sm ${
                        stock.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stock.change}
                    </TableCell>
                    <TableCell 
                      className={`text-sm ${
                        stock.changePercent?.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stock.changePercent}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" className="text-primary hover:text-primary-dark">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No stocks in your watchlist.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
