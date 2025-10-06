import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActiveSessionsTable } from "@/components/dashboard/ActiveSessionsTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AddItemDialog } from "@/components/dashboard/AddItemDialog";
import { OwnerPasswordDialog } from "@/components/dashboard/OwnerPasswordDialog";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";
import { useCategories } from "@/hooks/useCategories";
import { useEndedSessions } from "@/hooks/useEndedSessions";

interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

interface Session {
  id: string;
  table: string;
  player: string;
  startTime: string;
  duration: string;
  tableAmount: number;
  items: SessionItem[];
  totalAmount: number;
}

const Dashboard = () => {
   const navigate = useNavigate();
   const { sessions: activeSessions, updateSession, deleteSession } = useSessions();
   const { categories } = useCategories();
   const { endedSessions, addEndedSession } = useEndedSessions();

   const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
   const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
   const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleEndSession = async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const endTimestamp = Date.now();
      const endTime = new Date(endTimestamp).toLocaleString();

      // Save to ended sessions
      await addEndedSession({
        ...session,
        endTime,
        endTimestamp
      });

      // Remove from active sessions
      await deleteSession(sessionId);
      toast.success(`Session ended for ${session.player} - Total: ₹${session.totalAmount}. Revenue data updated in real-time.`);
    } catch (error) {
      toast.error("Failed to end session: " + (error as Error).message);
    }
  };

  const handleAddItemClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setAddItemDialogOpen(true);
  };

  const handleAddItem = async (categoryId: string, quantity: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !selectedSessionId) return;

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
      await updateSession(selectedSessionId, { items: updatedItems, totalAmount });
      toast.success(`Added ${quantity}x ${category.name} to session`);
    } catch (error) {
      toast.error("Failed to add item: " + (error as Error).message);
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent leading-tight">
              Snooker Club Dashboard
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Manage your club efficiently with real-time insights
              <span className="ml-3 text-sm text-accent flex items-center gap-2 inline-flex">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Dashboard
              </span>
            </p>
          </div>
          <Link to="/new-booking" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-primary shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-200 min-h-[48px] text-base font-medium" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Booking
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Active Sessions & Revenue Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 bg-card border-border shadow-card p-4 sm:p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Active Sessions</h2>
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {activeSessions.length} active
              </div>
            </div>
            <ActiveSessionsTable
              sessions={activeSessions}
              onEndSession={handleEndSession}
              onAddItem={handleAddItemClick}
            />
          </Card>

          <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/new-booking">
                <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow hover:shadow-xl transition-all duration-200 min-h-[48px] text-base font-medium" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Booking
                </Button>
              </Link>
              <Link to="/categories">
                <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg">
                  Manage Categories
                </Button>
              </Link>
              <Button className="w-full min-h-[48px] text-base font-medium hover:bg-secondary/80" variant="secondary" size="lg" onClick={handleViewRevenue}>
                <TrendingUp className="mr-2 h-5 w-5" />
                View Revenue
              </Button>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-card border-border shadow-card p-4 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Revenue Overview</h2>
            <div className="text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full">
              Last 7 days
            </div>
          </div>
          <RevenueChart />
        </Card>
      </div>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        categories={categories}
        onAddItem={handleAddItem}
      />

      {/* Owner Password Dialog */}
      <OwnerPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default Dashboard;
