import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, DollarSign, Clock, User, Hash, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEndedSessions } from "@/hooks/useEndedSessions";
import { usePendingPayments } from "@/hooks/usePendingPayments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";

const Revenue = () => {
  const { endedSessions, loading: endedLoading } = useEndedSessions();
  const { pendingPayments, loading: pendingLoading } = usePendingPayments();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Update last updated timestamp whenever data changes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [endedSessions, pendingPayments]);

  // Combine all customer sessions (both paid and pending)
  const allCustomerSessions = [
    ...endedSessions.map(session => ({ ...session, sessionType: 'completed' as const })),
    ...pendingPayments.map(payment => ({
      ...payment,
      sessionType: 'pending' as const,
      endTime: payment.endTime || 'Pending',
      endTimestamp: payment.endTimestamp
    }))
  ].sort((a, b) => (b.endTimestamp || 0) - (a.endTimestamp || 0));

  const totalRevenue = endedSessions.reduce((sum, session) => sum + (session.paidAmount || session.totalAmount), 0);
  const totalCustomers = allCustomerSessions.length;
  const loading = endedLoading || pendingLoading;


  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <Link to="/" className="block sm:inline-block">
          <Button variant="secondary" className="w-full sm:w-auto mb-4 sm:mb-2 hover:bg-secondary/80 transition-colors min-h-[44px] text-sm sm:text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent leading-tight">
                Revenue Analytics
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Track your club's financial performance with detailed insights
              </p>
            </div>
            <Button className="w-full sm:w-auto bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow hover:shadow-xl transition-all duration-200 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-medium">
              <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Export Report
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live • Updated: {lastUpdated.toLocaleTimeString()}
          </div>
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



        <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Customer Sessions</h2>
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
              {allCustomerSessions.length} sessions ({endedSessions.length} completed, {pendingPayments.length} pending)
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading sessions...</div>
            </div>
          ) : allCustomerSessions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customer sessions yet.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">Table</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm hidden sm:table-cell">Start Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm hidden md:table-cell">End Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">Duration</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm hidden lg:table-cell">Items</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm hidden md:table-cell">Payment Mode</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCustomerSessions.map((session) => (
                    <TableRow key={session.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground text-xs sm:text-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1 sm:p-1.5 rounded-md bg-primary/10">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <span className="truncate max-w-[80px] sm:max-w-none">{session.player}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium text-xs sm:text-sm">{session.table}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{session.startTime}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{session.endTime}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {session.duration}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                        {(session.items && session.items.length > 0) ? (
                          <div className="space-y-1">
                            {session.items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs">No items</span>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground text-xs sm:text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 sm:gap-2 font-semibold">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                            ₹{session.totalAmount}
                          </div>
                          {session.sessionType === 'pending' && (
                            <div className="text-xs text-red-600">
                              Pending: ₹{session.pendingAmount}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                        {session.paymentMode ? session.paymentMode.toUpperCase() : 'CASH'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          session.sessionType === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : session.paymentStatus === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {session.sessionType === 'completed' ? 'Completed' :
                           session.paymentStatus === 'overdue' ? 'Overdue' : 'Pending'}
                        </span>
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
