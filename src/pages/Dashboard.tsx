import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActiveSessionsTable } from "@/components/dashboard/ActiveSessionsTable";
import { AddItemDialog } from "@/components/dashboard/AddItemDialog";
import { EditItemDialog } from "@/components/dashboard/EditItemDialog";
import { OwnerPasswordDialog } from "@/components/dashboard/OwnerPasswordDialog";
import PaymentDialog from "@/components/dashboard/PaymentDialog";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";
import { useCategories } from "@/hooks/useCategories";
import { useEndedSessions } from "@/hooks/useEndedSessions";
import { usePendingPayments } from "@/hooks/usePendingPayments";

interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

interface Session {
  id: string;
  table: string;
  player: string;
  phoneNumber?: string;
  startTime: string;
  startTimestamp?: number;
  duration: string;
  tableAmount: number;
  items: SessionItem[];
  totalAmount: number;
  paidAmount?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'overdue';
  ratePerMinute?: number;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { sessions: activeSessions, updateSession, deleteSession } = useSessions();
    const { categories, updateCategory } = useCategories();
    const { endedSessions, addEndedSession } = useEndedSessions();
    const { addPendingPayment } = usePendingPayments();

   const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
   const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
   const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
   const [selectedItem, setSelectedItem] = useState<{ sessionId: string; itemIndex: number; item: SessionItem } | null>(null);
   const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
   const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
   const [selectedSessionForPayment, setSelectedSessionForPayment] = useState<Session | null>(null);

  const handleEndSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSessionForPayment(session);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async (paidAmount: number) => {
    if (!selectedSessionForPayment) return;

    try {
      const endTimestamp = Date.now();
      const endTime = new Date(endTimestamp).toLocaleString();
      const session = selectedSessionForPayment;

      // Calculate real-time total bill: table amount + items total
      const elapsedMinutes = session.startTimestamp ?
        Math.floor((Date.now() - session.startTimestamp) / 60000) : 0;
      const tableAmount = elapsedMinutes * (session.ratePerMinute || 5);
      const itemsTotal = session.items ? session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
      const totalBill = tableAmount + itemsTotal;

      // Calculate exact duration at end time
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = elapsedMinutes % 60;
      const seconds = Math.floor(((Date.now() - session.startTimestamp) % 60000) / 1000);
      const exactDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (paidAmount >= totalBill) {
        // Full payment - move to ended sessions
        await addEndedSession({
          ...session,
          endTime,
          endTimestamp,
          duration: exactDuration,
          tableAmount,
          totalAmount: totalBill,
          paidAmount: totalBill,
          pendingAmount: 0,
          paymentStatus: 'paid'
        });
        toast.success(`Session completed for ${session.player} - Full payment received: ₹${totalBill}`);
      } else {
        // Partial payment - create pending payment
        const pendingAmount = totalBill - paidAmount;
        await addPendingPayment({
          table: session.table,
          player: session.player,
          phoneNumber: session.phoneNumber || '',
          startTime: session.startTime,
          startTimestamp: session.startTimestamp,
          endTime,
          endTimestamp,
          duration: exactDuration,
          tableAmount,
          items: session.items,
          totalAmount: totalBill,
          paidAmount,
          pendingAmount,
          paymentStatus: 'partial',
          ratePerMinute: session.ratePerMinute
        });
        toast.success(`Session ended for ${session.player} - Paid: ₹${paidAmount}, Pending: ₹${pendingAmount}`);
      }

      // Remove from active sessions
      await deleteSession(session.id);
    } catch (error) {
      toast.error("Failed to process payment: " + (error as Error).message);
    }
  };

  const handleAddItemClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setAddItemDialogOpen(true);
  };

  const handleEditItemClick = (sessionId: string, itemIndex: number) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (session && session.items && session.items[itemIndex]) {
      setSelectedItem({ sessionId, itemIndex, item: session.items[itemIndex] });
      setEditItemDialogOpen(true);
    }
  };

  const handleAddItem = async (categoryId: string, quantity: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !selectedSessionId) return;

    // Check if enough stock is available
    if (category.quantity < quantity) {
      toast.error(`Insufficient stock. Available: ${category.quantity}`);
      return;
    }

    const session = activeSessions.find(s => s.id === selectedSessionId);
    if (!session) return;

    const existingItemIndex = session.items.findIndex(item => item.name === category.name);
    let updatedItems;

    if (existingItemIndex >= 0) {
      updatedItems = [...session.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
    } else {
      updatedItems = [
        ...session.items,
        { name: category.name, price: category.price, quantity }
      ];
    }

    const itemsTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = session.tableAmount + itemsTotal;

    try {
      // Update session with new items
      await updateSession(selectedSessionId, { items: updatedItems, totalAmount });

      // Deduct stock from category
      await updateCategory(categoryId, { quantity: category.quantity - quantity });

      toast.success(`Added ${quantity}x ${category.name} to session. Stock remaining: ${category.quantity - quantity}`);
    } catch (error) {
      toast.error("Failed to add item: " + (error as Error).message);
    }
  };

  const handleEditItem = async (quantity: number) => {
    if (!selectedItem) return;

    const session = activeSessions.find(s => s.id === selectedItem.sessionId);
    if (!session) return;

    const updatedItems = [...session.items];
    updatedItems[selectedItem.itemIndex] = {
      ...updatedItems[selectedItem.itemIndex],
      quantity
    };

    const itemsTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = session.tableAmount + itemsTotal;

    try {
      await updateSession(selectedItem.sessionId, { items: updatedItems, totalAmount });
      toast.success(`Updated ${selectedItem.item.name} quantity to ${quantity}`);
    } catch (error) {
      toast.error("Failed to update item: " + (error as Error).message);
    }
  };

  const handleRemoveItem = async () => {
    if (!selectedItem) return;

    const session = activeSessions.find(s => s.id === selectedItem.sessionId);
    if (!session) return;

    const updatedItems = session.items.filter((_, idx) => idx !== selectedItem.itemIndex);

    const itemsTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = session.tableAmount + itemsTotal;

    try {
      await updateSession(selectedItem.sessionId, { items: updatedItems, totalAmount });
      toast.success(`Removed ${selectedItem.item.name} from session`);
    } catch (error) {
      toast.error("Failed to remove item: " + (error as Error).message);
    }
  };

  const handleEditPlayer = async (sessionId: string, newName: string, newPhoneNumber?: string) => {
    try {
      const updates: any = { player: newName };
      if (newPhoneNumber !== undefined) {
        updates.phoneNumber = newPhoneNumber;
      }
      await updateSession(sessionId, updates);
      toast.success(`Player details updated successfully`);
    } catch (error) {
      toast.error("Failed to update player details: " + (error as Error).message);
    }
  };

  const handleViewRevenue = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordSuccess = () => {
    navigate('/revenue');
  };

  // Calculate real-time stats
  const todayRevenue = endedSessions.reduce((sum, session) => sum + session.totalAmount, 0);
  const activeTables = activeSessions.length;
  const totalTables = 4; // Assuming 4 tables total
  const customersToday = endedSessions.length;
  const avgSessionTime = endedSessions.length > 0
    ? Math.round(endedSessions.reduce((sum, session) => {
        const duration = parseFloat(session.duration.split(' ')[0]) || 0;
        return sum + duration;
      }, 0) / endedSessions.length)
    : 0;

  const stats: Array<{
    title: string;
    value: string;
    icon: typeof DollarSign;
    trend: string;
    color: "accent" | "primary" | "success";
  }> = [
    { title: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, icon: DollarSign, trend: "Real-time", color: "accent" },
    { title: "Active Tables", value: `${activeTables}/${totalTables}`, icon: Clock, trend: `${Math.round((activeTables/totalTables)*100)}% occupied`, color: "primary" },
    { title: "Customers Today", value: customersToday.toString(), icon: Users, trend: "Real-time count", color: "success" },
    { title: "Avg. Session Time", value: `${avgSessionTime} min`, icon: TrendingUp, trend: "Real-time avg", color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent leading-tight">
                One Shot Snooker Dashboard
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Manage your One Shot Snooker efficiently with real-time insights
              </p>
            </div>
            <Link to="/new-booking" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-primary shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-200 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-medium" size="lg">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                New Booking
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Dashboard
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Active Sessions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Active Sessions</h2>
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
                {activeSessions.length} active
              </div>
            </div>
            <ActiveSessionsTable
              sessions={activeSessions}
              onEndSession={handleEndSession}
              onAddItem={handleAddItemClick}
              onEditItem={handleEditItemClick}
              onEditPlayer={handleEditPlayer}
            />
          </Card>

          <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 card-hover">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">Quick Actions</h2>
            <div className="space-y-3 sm:space-y-4">
              <Link to="/new-booking">
                <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow hover:shadow-xl transition-all duration-200 min-h-[48px] text-base font-medium" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Booking
                </Button>
              </Link>
              <Link to="/stock">
                <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg">
                  Manage Stock
                </Button>
              </Link>
              <Link to="/pending-payments">
                <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Pending Payments
                </Button>
              </Link>
              <Link to="/player-accounts">
                <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  Player Accounts
                </Button>
              </Link>
              <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg" onClick={handleViewRevenue}>
                <TrendingUp className="mr-2 h-5 w-5" />
                View Revenue
              </Button>
            </div>
          </Card>
        </div>


      </div>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        categories={categories}
        onAddItem={handleAddItem}
      />

      {/* Edit Item Dialog */}
      <EditItemDialog
        open={editItemDialogOpen}
        onClose={() => setEditItemDialogOpen(false)}
        item={selectedItem?.item || null}
        onEditItem={handleEditItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* Owner Password Dialog */}
      <OwnerPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        session={selectedSessionForPayment}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};

export default Dashboard;
