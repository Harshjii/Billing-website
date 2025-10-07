import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, DollarSign, Clock, User, Hash, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEndedSessions } from "@/hooks/useEndedSessions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Revenue = () => {
  const { endedSessions, loading } = useEndedSessions();
  const isMobile = useIsMobile();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Update last updated timestamp whenever endedSessions changes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [endedSessions]);

  const totalRevenue = endedSessions.reduce((sum, session) => sum + session.totalAmount, 0);
  const totalCustomers = endedSessions.length;

  // Group sessions by day for chart
  const sessionsByDay = endedSessions.reduce((acc, session) => {
    const day = new Date(session.endTimestamp).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[day]) {
      acc[day] = { revenue: 0, customers: 0 };
    }
    acc[day].revenue += session.totalAmount;
    acc[day].customers += 1;
    return acc;
  }, {} as Record<string, { revenue: number; customers: number }>);

  const weeklyData = Object.entries(sessionsByDay).map(([day, data]) => ({
    day,
    revenue: data.revenue,
    customers: data.customers
  }));

  // Calculate category data from items
  const categoryTotals = endedSessions.reduce((acc, session) => {
    // Table bookings
    acc.table += session.tableAmount;
    // Items
    session.items.forEach(item => {
      if (item.name.toLowerCase().includes('food') || item.name.toLowerCase().includes('snack')) {
        acc.food += item.price * item.quantity;
      } else if (item.name.toLowerCase().includes('drink') || item.name.toLowerCase().includes('beverage')) {
        acc.drinks += item.price * item.quantity;
      } else {
        acc.other += item.price * item.quantity;
      }
    });
    return acc;
  }, { table: 0, food: 0, drinks: 0, other: 0 });

  const totalCategorySum = categoryTotals.table + categoryTotals.food + categoryTotals.drinks + categoryTotals.other;
  const categoryData = [
    { name: "Table Bookings", value: totalCategorySum > 0 ? Math.round((categoryTotals.table / totalCategorySum) * 100) : 0, color: "hsl(140, 70%, 45%)" },
    { name: "Food", value: totalCategorySum > 0 ? Math.round((categoryTotals.food / totalCategorySum) * 100) : 0, color: "hsl(45, 100%, 50%)" },
    { name: "Drinks", value: totalCategorySum > 0 ? Math.round((categoryTotals.drinks / totalCategorySum) * 100) : 0, color: "hsl(220, 70%, 50%)" },
    { name: "Other", value: totalCategorySum > 0 ? Math.round((categoryTotals.other / totalCategorySum) * 100) : 0, color: "hsl(280, 70%, 50%)" },
  ].filter(cat => cat.value > 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <Link to="/">
          <Button variant="secondary" className="mb-2 hover:bg-secondary/80 transition-colors min-h-[44px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent leading-tight">
              Revenue Analytics
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Track your club's financial performance with detailed insights
              <span className="ml-3 text-sm text-accent flex items-center gap-2 inline-flex">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live • Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <Button className="w-full sm:w-auto bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow hover:shadow-xl transition-all duration-200 min-h-[48px] text-base font-medium">
            <Download className="mr-2 h-5 w-5" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Weekly Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-success font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +15.3% from last week
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Customers</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalCustomers}</p>
                <p className="text-sm text-success font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  +8 from last week
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Weekly Revenue Breakdown</h2>
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              7 days
            </div>
          </div>
          <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
             <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
               <XAxis
                 dataKey="day"
                 stroke="hsl(var(--muted-foreground))"
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
               />
               <YAxis
                 stroke="hsl(var(--muted-foreground))"
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: "hsl(var(--card))",
                   border: "1px solid hsl(var(--border))",
                   borderRadius: "12px",
                   color: "hsl(var(--foreground))",
                   boxShadow: "0 10px 40px -10px hsl(0 0% 0% / 0.5)",
                   fontSize: "14px",
                 }}
               />
               <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </Card>

       <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Revenue by Category</h2>
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              Breakdown
            </div>
          </div>
          <div className="h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={categoryData}
                 cx="50%"
                 cy="50%"
                 labelLine={false}
                 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                 outerRadius={isMobile ? 100 : 140}
                 innerRadius={isMobile ? 40 : 60}
                 fill="#8884d8"
                 dataKey="value"
                 stroke="hsl(var(--card))"
                 strokeWidth={2}
               >
                 {categoryData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Tooltip
                 contentStyle={{
                   backgroundColor: "hsl(var(--card))",
                   border: "1px solid hsl(var(--border))",
                   borderRadius: "12px",
                   color: "hsl(var(--foreground))",
                   boxShadow: "0 10px 40px -10px hsl(0 0% 0% / 0.5)",
                   fontSize: "14px",
                 }}
               />
             </PieChart>
           </ResponsiveContainer>
         </div>
       </Card>

        <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Customer Sessions</h2>
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {endedSessions.length} sessions
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading sessions...</div>
            </div>
          ) : endedSessions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No ended sessions yet.</p>
              </div>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {endedSessions.map((session) => (
                <Card key={session.id} className="p-4 sm:p-5 border border-border/50 hover:border-border transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-base">{session.player}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            Table {session.table}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-accent">₹{session.totalAmount}</div>
                        <div className="text-xs text-muted-foreground">Total spent</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {session.duration}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                    {(session.items && session.items.length > 0) && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          Items: {session.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                    <TableHead className="text-muted-foreground font-medium">Customer</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Table</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden sm:table-cell">Start Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden md:table-cell">End Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Items</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endedSessions.map((session) => (
                    <TableRow key={session.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {session.player}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">{session.table}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{session.startTime}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{session.endTime}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {session.duration}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {(session.items && session.items.length > 0) ? (
                          <div className="space-y-1">
                            {session.items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.name} x{item.quantity} (₹{item.price * item.quantity})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs">No items</span>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground font-bold text-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-accent" />
                          ₹{session.totalAmount}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Revenue;
