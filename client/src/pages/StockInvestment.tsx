import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Stock } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, PlusCircle, Eye, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Stock form schema
const stockFormSchema = z.object({
  userId: z.number(),
  symbol: z.string().min(1, { message: "Stock symbol is required" }).max(10),
  company: z.string().min(1, { message: "Company name is required" }),
  quantity: z.string().optional().transform(val => val ? Number(val) : undefined),
  purchasePrice: z.string().optional(),
});

type StockFormValues = z.infer<typeof stockFormSchema>;

export default function StockInvestment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("watchlist");
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stock | null,
    direction: 'ascending' | 'descending'
  }>({
    key: null,
    direction: 'ascending'
  });
  
  // In a real app, this would use the authenticated user's ID
  const userId = 1; // Placeholder
  
  // Query for stocks
  const { data: stocks = [], isLoading, refetch } = useQuery<Stock[]>({
    queryKey: ['/api/stocks', { userId }],
    enabled: false, // Disabled until we have real auth
  });
  
  // Sample stocks for UI display
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
    },
    {
      id: 4,
      userId: 1,
      symbol: "AMZN",
      company: "Amazon.com Inc.",
      quantity: 3,
      purchasePrice: "3100.00",
      addedDate: "2025-02-20",
      currentPrice: "3350.25",
      change: "+45.75",
      changePercent: "+1.38%"
    },
    {
      id: 5,
      userId: 1,
      symbol: "TSLA",
      company: "Tesla Inc.",
      quantity: 20,
      purchasePrice: "750.00",
      addedDate: "2025-01-05",
      currentPrice: "805.15",
      change: "-12.45",
      changePercent: "-1.52%"
    }
  ];
  
  const displayStocks = stocks.length ? stocks : sampleStocks;
  
  // Sort the stocks
  const sortedStocks = [...displayStocks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key as keyof Stock];
    let bValue = b[sortConfig.key as keyof Stock];
    
    // Handle numerical comparisons
    if (sortConfig.key === 'quantity') {
      aValue = a.quantity || 0;
      bValue = b.quantity || 0;
    } else if (sortConfig.key === 'currentPrice' || sortConfig.key === 'purchasePrice') {
      aValue = parseFloat(a[sortConfig.key] || '0');
      bValue = parseFloat(b[sortConfig.key] || '0');
    }
    
    if (aValue === bValue) return 0;
    
    const direction = sortConfig.direction === 'ascending' ? 1 : -1;
    return aValue < bValue ? -1 * direction : 1 * direction;
  });
  
  // Form setup for adding stocks
  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      userId: userId,
      symbol: "",
      company: "",
      quantity: "",
      purchasePrice: "",
    },
  });
  
  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: (data: StockFormValues) => 
      apiRequest("POST", "/api/stocks", data),
    onSuccess: () => {
      toast({
        title: "Stock Added",
        description: "The stock has been added to your watchlist.",
      });
      setIsAddStockOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/stocks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add stock: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete stock mutation
  const deleteStockMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/stocks/${id}`),
    onSuccess: () => {
      toast({
        title: "Stock Removed",
        description: "The stock has been removed from your watchlist.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stocks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove stock: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Function to handle sort
  const requestSort = (key: keyof Stock) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Function to get sort direction icon
  const getSortDirectionIcon = (key: keyof Stock) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };
  
  // Submit handler for add stock form
  function onSubmit(data: StockFormValues) {
    addStockMutation.mutate(data);
  }
  
  // Function to calculate portfolio value
  const calculatePortfolioValue = () => {
    return sortedStocks.reduce((total, stock) => {
      if (stock.quantity && stock.currentPrice) {
        return total + (stock.quantity * parseFloat(stock.currentPrice));
      }
      return total;
    }, 0).toFixed(2);
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Investment Tracker</h1>
        <p className="text-gray-600 mt-1">Monitor your stock portfolio and market performance.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-gray-700">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${calculatePortfolioValue()}</div>
            <p className="text-sm text-gray-500 mt-1">Total value of your stock holdings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-gray-700">
              <Eye className="mr-2 h-5 w-5 text-primary" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{sortedStocks.length}</div>
            <p className="text-sm text-gray-500 mt-1">Stocks in your watchlist</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-gray-700">
              <RefreshCw className="mr-2 h-5 w-5 text-primary" />
              Market Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Open</div>
            <p className="text-sm text-gray-500 mt-1">Regular trading hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watchlist" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Stock Watchlist</CardTitle>
                  <CardDescription>Track stocks you're interested in.</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button onClick={() => setIsAddStockOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Stock
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('symbol')}>
                        <div className="flex items-center">
                          Symbol
                          {getSortDirectionIcon('symbol')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('company')}>
                        <div className="flex items-center">
                          Company
                          {getSortDirectionIcon('company')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('currentPrice')}>
                        <div className="flex items-center">
                          Price
                          {getSortDirectionIcon('currentPrice')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('change')}>
                        <div className="flex items-center">
                          Change
                          {getSortDirectionIcon('change')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('changePercent')}>
                        <div className="flex items-center">
                          Change %
                          {getSortDirectionIcon('changePercent')}
                        </div>
                      </TableHead>
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
                    ) : sortedStocks.length > 0 ? (
                      sortedStocks.map(stock => (
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
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => setSelectedStock(stock)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteStockMutation.mutate(stock.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No stocks in your watchlist. Add stocks to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Investment Portfolio</CardTitle>
                  <CardDescription>Your stock holdings and performance.</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>P/L</TableHead>
                      <TableHead>P/L %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading portfolio...
                        </TableCell>
                      </TableRow>
                    ) : sortedStocks.filter(s => s.quantity && s.quantity > 0).length > 0 ? (
                      sortedStocks.filter(s => s.quantity && s.quantity > 0).map(stock => {
                        const currentValue = stock.quantity! * parseFloat(stock.currentPrice || "0");
                        const purchaseValue = stock.quantity! * parseFloat(stock.purchasePrice || "0");
                        const profitLoss = currentValue - purchaseValue;
                        const profitLossPercent = (profitLoss / purchaseValue) * 100;
                        
                        return (
                          <TableRow key={stock.id}>
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell className="text-sm text-gray-600">{stock.company}</TableCell>
                            <TableCell>{stock.quantity}</TableCell>
                            <TableCell>${stock.purchasePrice}</TableCell>
                            <TableCell>${stock.currentPrice}</TableCell>
                            <TableCell>${currentValue.toFixed(2)}</TableCell>
                            <TableCell className={profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                              ${profitLoss.toFixed(2)}
                            </TableCell>
                            <TableCell className={profitLossPercent >= 0 ? "text-green-600" : "text-red-600"}>
                              {profitLossPercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No stocks in your portfolio. Add stocks with quantity to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {sortedStocks.filter(s => s.quantity && s.quantity > 0).length > 0 && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Portfolio Value:</span>
                      <span className="ml-2 text-lg font-bold">${calculatePortfolioValue()}</span>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Export Portfolio</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Stock Dialog */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock to Watchlist</DialogTitle>
            <DialogDescription>
              Enter the stock details to add it to your watchlist.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="AAPL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <input type="hidden" {...form.register("userId")} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStockOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addStockMutation.isPending}>
                  {addStockMutation.isPending ? "Adding..." : "Add Stock"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Stock Details Dialog */}
      {selectedStock && (
        <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedStock.symbol} - {selectedStock.company}</DialogTitle>
              <DialogDescription>
                Stock details and performance information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500 text-sm">Current Price</Label>
                <div className="text-xl font-bold">${selectedStock.currentPrice}</div>
              </div>
              
              <div>
                <Label className="text-gray-500 text-sm">Change</Label>
                <div className={`text-xl font-bold ${
                  selectedStock.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedStock.change} ({selectedStock.changePercent})
                </div>
              </div>
              
              {selectedStock.quantity && (
                <>
                  <div>
                    <Label className="text-gray-500 text-sm">Quantity</Label>
                    <div className="text-xl font-bold">{selectedStock.quantity}</div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Position Value</Label>
                    <div className="text-xl font-bold">
                      ${(selectedStock.quantity * parseFloat(selectedStock.currentPrice || "0")).toFixed(2)}
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label className="text-gray-500 text-sm">Added Date</Label>
                <div className="text-md">
                  {new Date(selectedStock.addedDate).toLocaleDateString()}
                </div>
              </div>
              
              {selectedStock.purchasePrice && (
                <div>
                  <Label className="text-gray-500 text-sm">Purchase Price</Label>
                  <div className="text-md">${selectedStock.purchasePrice}</div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Actions</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">View Chart</Button>
                <Button variant="outline" size="sm">Company News</Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    deleteStockMutation.mutate(selectedStock.id);
                    setSelectedStock(null);
                  }}
                >
                  Remove from Watchlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
