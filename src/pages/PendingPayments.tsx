import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Phone, MessageSquare, CheckCircle, Download, Printer, Eye, DollarSign, Clock, User, CreditCard, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { usePendingPayments, PendingPayment } from "@/hooks/usePendingPayments";
import { useEndedSessions, EndedSession } from "@/hooks/useEndedSessions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateDoc, doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase";

const PendingPayments = () => {
  const { pendingPayments, deletePendingPayment } = usePendingPayments();
  const { addEndedSession } = useEndedSessions();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "high">("all");
  const [sortBy, setSortBy] = useState<"amount" | "date" | "player">("amount");
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [paymentModeDialogOpen, setPaymentModeDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PendingPayment | null>(null);
  const [newPaymentMode, setNewPaymentMode] = useState<'cash' | 'card' | 'upi' | 'other'>('cash');

  // Process pending payments data
  const processedPendingPayments = useMemo(() => {
    const now = Date.now();
    const overdueThreshold = 2 * 60 * 60 * 1000; // 2 hours

    return pendingPayments.map(payment => {
      const isOverdue = payment.endTimestamp && (now - payment.endTimestamp) > overdueThreshold;
      const paymentStatus = isOverdue ? 'overdue' : payment.paymentStatus;

      return {
        id: payment.id,
        player: payment.player,
        phoneNumber: payment.phoneNumber,
        table: payment.table,
        startTime: payment.startTime,
        endTime: payment.endTime,
        startTimestamp: payment.startTimestamp,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        pendingAmount: payment.pendingAmount,
        paymentStatus,
        paymentMode: payment.paymentMode,
        items: payment.items || []
      } as PendingPayment;
    });
  }, [pendingPayments]);

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    const filtered = processedPendingPayments.filter(payment => {
      const matchesSearch = payment.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.table.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filter) {
        case "overdue":
          return payment.paymentStatus === 'overdue';
        case "high":
          return payment.pendingAmount > 500;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.pendingAmount - a.pendingAmount;
        case "date":
          return (b.startTimestamp || 0) - (a.startTimestamp || 0);
        case "player":
          return a.player.localeCompare(b.player);
        default:
          return 0;
      }
    });

    return filtered;
  }, [processedPendingPayments, searchTerm, filter, sortBy]);

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      toast.error("No phone number available");
    }
  };

  const handleRemind = (payment: PendingPayment) => {
    if (payment.phoneNumber) {
      const message = `Hi ${payment.player}, you have a pending payment of ₹${payment.pendingAmount} for your session at Table ${payment.table}. Please settle the amount.`;
      window.open(`sms:${payment.phoneNumber}?body=${encodeURIComponent(message)}`, '_self');
    } else {
      toast.error("No phone number available");
    }
  };

  const handleMarkPaid = async (payment: PendingPayment) => {
    try {
      // Ensure all required fields have valid values
      const validEndTimestamp = payment.endTimestamp || Date.now();
      const validDuration = payment.duration || '';
      const validTableAmount = payment.tableAmount || 0;
      const validItems = payment.items || [];
      const validTotalAmount = payment.totalAmount || 0;

      // Build the ended session object, only including optional fields if they have values
      const endedSessionData: Partial<EndedSession> = {
        table: payment.table || '',
        player: payment.player || '',
        phoneNumber: payment.phoneNumber,
        startTime: payment.startTime || '',
        endTime: payment.endTime || '',
        endTimestamp: validEndTimestamp,
        duration: validDuration,
        tableAmount: validTableAmount,
        items: validItems,
        totalAmount: validTotalAmount,
        paidAmount: validTotalAmount, // Now fully paid
        pendingAmount: 0,
        paymentStatus: 'paid'
      };

      // Only include optional fields if they have valid values
      if (payment.startTimestamp !== undefined) {
        endedSessionData.startTimestamp = payment.startTimestamp;
      }
      if (payment.ratePerMinute !== undefined) {
        endedSessionData.ratePerMinute = payment.ratePerMinute;
      }
      if (payment.paymentMode !== undefined) {
        endedSessionData.paymentMode = payment.paymentMode;
      }

      // Add to ended sessions with full payment
      await addEndedSession(endedSessionData);

      // Remove from pending payments
      await deletePendingPayment(payment.id);
      toast.success(`Payment marked as paid for ${payment.player} - moved to completed sessions`);
    } catch (error) {
      toast.error("Failed to mark payment as paid: " + (error as Error).message);
    }
  };

  const handleUpdatePaymentMode = async () => {
    if (!editingPayment) return;

    try {
      // Update the payment mode in Firebase
      await updateDoc(doc(db, COLLECTIONS.PENDING_PAYMENTS, editingPayment.id), {
        paymentMode: newPaymentMode
      });

      toast.success(`Payment mode updated to ${newPaymentMode.toUpperCase()} for ${editingPayment.player}`);
      setPaymentModeDialogOpen(false);
      setEditingPayment(null);
    } catch (error) {
      toast.error("Failed to update payment mode: " + (error as Error).message);
    }
  };

  const openPaymentModeDialog = (payment: PendingPayment) => {
    setEditingPayment(payment);
    setNewPaymentMode(payment.paymentMode || 'cash');
    setPaymentModeDialogOpen(true);
  };

  const exportCSV = () => {
    const csvContent = [
      ["Player", "Phone", "Table", "Start Time", "End Time", "Total Amount", "Paid Amount", "Pending Amount", "Payment Mode", "Status"],
      ...filteredAndSortedPayments.map(p => [
        p.player,
        p.phoneNumber || "",
        p.table,
        p.startTime,
        p.endTime || "",
        p.totalAmount,
        p.paidAmount,
        p.pendingAmount,
        p.paymentMode || "CASH",
        p.paymentStatus
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pending-payments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPending = filteredAndSortedPayments.reduce((sum, p) => sum + p.pendingAmount, 0);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        <Link to="/">
          <Button variant="secondary" className="mb-2 hover:bg-secondary/80 transition-colors min-h-[44px] w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent leading-tight">
              Pending Payments
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              Track outstanding balances from active sessions
              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-accent flex items-center gap-1 sm:gap-2 inline-flex">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></span>
                {filteredAndSortedPayments.length} pending
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={exportCSV} className="min-h-[44px] flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">CSV</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="min-h-[44px] flex-1 sm:flex-none">
              <Printer className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Print</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Pending</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">₹{totalPending.toLocaleString()}</p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Overdue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {filteredAndSortedPayments.filter(p => p.paymentStatus === 'overdue').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover sm:col-span-2 md:col-span-1">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">High Value</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {filteredAndSortedPayments.filter(p => p.pendingAmount > 500).length}
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/20">
                <User className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by player or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 min-h-[44px] text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filter} onValueChange={(value: "all" | "overdue" | "high") => setFilter(value)}>
                <SelectTrigger className="w-full xs:flex-1 sm:w-[180px] min-h-[44px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pending</SelectItem>
                  <SelectItem value="overdue">Overdue Only</SelectItem>
                  <SelectItem value="high">{">"} ₹500</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: "amount" | "date" | "player") => setSortBy(value)}>
                <SelectTrigger className="w-full xs:flex-1 sm:w-[180px] min-h-[44px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Pending Amount</SelectItem>
                  <SelectItem value="date">Start Date</SelectItem>
                  <SelectItem value="player">Player Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Pending Payments</h2>
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {filteredAndSortedPayments.length} payments
            </div>
          </div>

          {filteredAndSortedPayments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending payments found.</p>
              </div>
            </div>
          ) : isMobile ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredAndSortedPayments.map((payment) => (
                <Card key={payment.id} className="p-3 sm:p-4 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header with player info and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground text-base sm:text-lg block truncate">{payment.player}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">Table {payment.table}</span>
                            <span className="text-xs">•</span>
                            <span className="truncate">{payment.startTime}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(payment.paymentStatus)} flex-shrink-0 text-xs`}>
                        {payment.paymentStatus}
                      </Badge>
                    </div>

                    {/* Amount display */}
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground font-medium">Pending Amount</div>
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold text-red-600">₹{payment.pendingAmount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">of ₹{payment.totalAmount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                        <div className="text-xs text-muted-foreground">Payment Mode</div>
                        <div className="text-sm font-medium">{payment.paymentMode ? payment.paymentMode.toUpperCase() : 'CASH'}</div>
                      </div>
                    </div>

                    {/* Action buttons - improved layout */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCall(payment.phoneNumber)}
                        className="min-h-[44px] text-sm font-medium"
                        disabled={!payment.phoneNumber}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemind(payment)}
                        className="min-h-[44px] text-sm font-medium"
                        disabled={!payment.phoneNumber}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Remind
                      </Button>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayment(payment)}
                            className="min-h-[44px] text-sm font-medium"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {payment.player}
                            </SheetTitle>
                            <SheetDescription>
                              Session details and payment history
                            </SheetDescription>
                          </SheetHeader>
                          {selectedPayment && (
                            <div className="space-y-4 mt-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-muted-foreground">Player</label>
                                  <p className="text-sm font-medium">{selectedPayment.player}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                  <p className="text-sm font-medium">{selectedPayment.phoneNumber || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-muted-foreground">Table</label>
                                  <p className="text-sm font-medium">{selectedPayment.table}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                                  <p className="text-sm font-medium">{selectedPayment.startTime}</p>
                                </div>
                              </div>
                              <div className="border-t pt-4 space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Payment Summary
                                </h4>
                                <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span>Total Bill:</span>
                                    <span className="font-medium">₹{selectedPayment.totalAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Paid:</span>
                                    <span className="font-medium text-green-600">₹{selectedPayment.paidAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                    <span>Pending:</span>
                                    <span className="text-red-600">₹{selectedPayment.pendingAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Payment Mode:</span>
                                    <span className="font-medium">{selectedPayment.paymentMode ? selectedPayment.paymentMode.toUpperCase() : 'CASH'}</span>
                                  </div>
                                </div>
                                {selectedPayment.items.length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="font-semibold flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" />
                                      Items Ordered
                                    </h5>
                                    <div className="space-y-2 bg-muted/30 p-3 rounded-lg max-h-32 overflow-y-auto">
                                      {selectedPayment.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                                          <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPaymentModeDialog(payment)}
                        className="min-h-[44px] text-sm font-medium"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Mode
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(payment)}
                        className="min-h-[44px] text-sm font-medium bg-green-600 hover:bg-green-700 active:bg-green-800"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                    <TableHead className="text-muted-foreground font-medium min-w-[120px]">Player</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[80px]">Table</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[100px] hidden md:table-cell">Start Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[80px] hidden sm:table-cell">Total</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[80px] hidden sm:table-cell">Paid</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[90px]">Pending</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[80px] hidden md:table-cell">Payment Mode</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[80px]">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium min-w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{payment.player}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{payment.startTime}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">{payment.table}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{payment.startTime}</TableCell>
                      <TableCell className="text-foreground hidden sm:table-cell">₹{payment.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground hidden sm:table-cell">₹{payment.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground font-bold text-red-600">₹{payment.pendingAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {payment.paymentMode ? payment.paymentMode.toUpperCase() : 'CASH'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(payment.paymentStatus)} text-xs`}>
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCall(payment.phoneNumber)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:p-2"
                            disabled={!payment.phoneNumber}
                          >
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Call</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemind(payment)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:p-2"
                            disabled={!payment.phoneNumber}
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Remind</span>
                          </Button>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPayment(payment)}
                                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:p-2"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only sm:not-sr-only sm:ml-1">Details</span>
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-md">
                              <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  {payment.player}
                                </SheetTitle>
                                <SheetDescription>
                                  Session details and payment history
                                </SheetDescription>
                              </SheetHeader>
                              {selectedPayment && (
                                <div className="space-y-4 mt-6">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-muted-foreground">Player</label>
                                      <p className="text-sm font-medium">{selectedPayment.player}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                      <p className="text-sm font-medium">{selectedPayment.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-muted-foreground">Table</label>
                                      <p className="text-sm font-medium">{selectedPayment.table}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                                      <p className="text-sm font-medium">{selectedPayment.startTime}</p>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      Payment Summary
                                    </h4>
                                    <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                                      <div className="flex justify-between text-sm">
                                        <span>Total Bill:</span>
                                        <span className="font-medium">₹{selectedPayment.totalAmount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Paid:</span>
                                        <span className="font-medium text-green-600">₹{selectedPayment.paidAmount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                        <span>Pending:</span>
                                        <span className="text-red-600">₹{selectedPayment.pendingAmount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    {selectedPayment.items.length > 0 && (
                                      <div className="space-y-3">
                                        <h5 className="font-semibold flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4" />
                                          Items Ordered
                                        </h5>
                                        <div className="space-y-2 bg-muted/30 p-3 rounded-lg max-h-32 overflow-y-auto">
                                          {selectedPayment.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                                              <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPaymentModeDialog(payment)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:p-2"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Edit Mode</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(payment)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:p-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Mark Paid</span>
                          </Button>
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

      {/* Payment Mode Edit Dialog */}
      <Dialog open={paymentModeDialogOpen} onOpenChange={setPaymentModeDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[400px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base sm:text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Edit Payment Mode
            </DialogTitle>
            <DialogDescription>
              Update the payment mode for {editingPayment?.player}'s pending payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-payment-mode" className="text-foreground text-sm">
                Payment Mode
              </Label>
              <Select value={newPaymentMode} onValueChange={(value: 'cash' | 'card' | 'upi' | 'other') => setNewPaymentMode(value)}>
                <SelectTrigger className="bg-secondary border-border text-foreground min-h-[44px]">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setPaymentModeDialogOpen(false)}
                className="min-h-[40px] px-4 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePaymentMode}
                className="bg-blue-600 hover:bg-blue-700 min-h-[40px] px-4 text-sm"
              >
                Update Mode
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingPayments;