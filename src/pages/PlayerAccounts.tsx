import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, Plus, Search, Eye, Edit, Trash2, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { usePlayerTransactions, Transaction } from "@/hooks/usePlayerTransactions";
import { useTransactions } from "@/hooks/useTransactions";
import { usePendingPayments } from "@/hooks/usePendingPayments";
import { useEndedSessions } from "@/hooks/useEndedSessions";

const PlayerAccounts = () => {
  const { players, loading, addPlayer, updatePlayer, deletePlayer, isPhoneUnique } = usePlayers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.phone.includes(searchTerm) ||
    player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }

    // Check if phone already exists
    if (!isPhoneUnique(formData.phone.trim())) {
      toast.error("Phone number already exists");
      return;
    }

    try {
      await addPlayer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      toast.success("Player created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", phone: "", email: "", notes: "" });
    } catch (error) {
      toast.error("Failed to create player: " + (error as Error).message);
    }
  };

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }

    // Check if phone already exists (excluding current player)
    if (!isPhoneUnique(formData.phone.trim(), selectedPlayer.id)) {
      toast.error("Phone number already exists");
      return;
    }

    try {
      await updatePlayer(selectedPlayer.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      toast.success("Player updated successfully");
      setIsEditDialogOpen(false);
      setSelectedPlayer(null);
    } catch (error) {
      toast.error("Failed to update player: " + (error as Error).message);
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
      try {
        await deletePlayer(player.id);
        toast.success("Player deleted successfully");
      } catch (error) {
        toast.error("Failed to delete player: " + (error as Error).message);
      }
    }
  };

  const openEditDialog = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      phone: player.phone,
      email: player.email || "",
      notes: player.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (player: Player) => {
    setSelectedPlayer(player);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/" className="block sm:inline-block">
          <Button variant="secondary" className="mb-3 sm:mb-4 w-full sm:w-auto min-h-[44px] sm:min-h-[40px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Mobile Header */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                  Players
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage player accounts
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-primary min-h-[44px] px-4"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Player Accounts
              </h1>
              <p className="text-muted-foreground mt-2 text-base">Manage player profiles and view transaction history</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border shadow-card p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
          {/* Search Section - Enhanced Responsive Design */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="search" className="text-foreground flex items-center gap-2 text-sm sm:text-base font-medium">
                <Search className="h-4 w-4 text-primary flex-shrink-0" />
                Search Players
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name, phone, email, or player ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    title="Clear search"
                  >
                    <span className="sr-only">Clear search</span>
                    ×
                  </Button>
                )}
              </div>
            </div>

            {/* Results Counter - Enhanced Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <span className="text-muted-foreground font-medium">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex items-center gap-2">
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="h-8 px-3 text-xs border-border hover:bg-muted"
                  >
                    Clear
                  </Button>
                )}
                <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  Total: {players.length}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="block sm:hidden">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No players found" : "No players yet"}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first player"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Player
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPlayers.map((player) => (
                  <Card key={player.id} className="p-4 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
                    <div className="space-y-3">
                      {/* Player Info Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-primary flex-shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">{player.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{player.phone}</span>
                          </div>
                          {player.email && (
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">{player.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {player.id.slice(-6)}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsDialog(player)}
                          className="flex-1 min-h-[36px]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(player)}
                          className="flex-1 min-h-[36px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlayer(player)}
                          className="min-h-[36px] px-3 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Responsive Table Layout */}
          <div className="hidden sm:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="min-w-[120px] sm:min-w-[140px] font-semibold">Name</TableHead>
                  <TableHead className="min-w-[110px] sm:min-w-[130px] font-semibold">Phone</TableHead>
                  <TableHead className="min-w-[140px] hidden md:table-cell font-semibold">Email</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell font-semibold">Player ID</TableHead>
                  <TableHead className="min-w-[120px] sm:min-w-[140px] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-4xl">👥</div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">
                            {searchTerm ? "No players found" : "No players yet"}
                          </h3>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search terms"
                              : "Get started by adding your first player"
                            }
                          </p>
                        </div>
                        {!searchTerm && (
                          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Player
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="hover:bg-muted/50 transition-colors border-border">
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="truncate font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded-md bg-primary/10 flex-shrink-0">
                            <Phone className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-mono text-sm">{player.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        {player.email ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded-md bg-primary/10 flex-shrink-0">
                              <Mail className="h-3 w-3 text-primary" />
                            </div>
                            <span className="truncate text-sm">{player.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3">
                        <Badge variant="outline" className="text-xs font-mono px-2 py-1">
                          {player.id.slice(-8)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(player)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(player)}
                            className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
                            title="Edit Player"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlayer(player)}
                            className="text-destructive hover:text-destructive hover:bg-red-500/10 h-8 w-8 p-0"
                            title="Delete Player"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Create Player Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-card border-border w-[95vw] sm:max-w-[500px] max-w-[500px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-foreground text-lg sm:text-xl font-semibold">Create Player Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlayer} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Name *
                </Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter player name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone" className="text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone
                </Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-notes" className="text-foreground">
                  Notes
                </Label>
                <Input
                  id="create-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter notes (optional)"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  Create Player
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Player Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border w-[95vw] sm:max-w-[500px] max-w-[500px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-foreground text-lg sm:text-xl font-semibold">Edit Player Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditPlayer} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter player name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-foreground">
                  Notes
                </Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-secondary border-border text-foreground min-h-[44px] text-base"
                  placeholder="Enter notes (optional)"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  Update Player
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Player Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="bg-card border-border w-[98vw] sm:max-w-[900px] max-w-[900px] max-h-[95vh] overflow-y-auto mx-2 sm:mx-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-foreground text-lg sm:text-xl font-semibold">Player Details</DialogTitle>
            </DialogHeader>
            {selectedPlayer && <PlayerDetails player={selectedPlayer} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Player Details Component
const PlayerDetails = ({ player }: { player: Player }) => {
  const { transactions, loading, getTotals, updateTransaction } = usePlayerTransactions(player.name);
  const { addTransaction } = useTransactions(player.id);
  const { pendingPayments, deletePendingPayment } = usePendingPayments();
  const { addEndedSession } = useEndedSessions();
  const { totalSpent, totalPaid, totalPending } = getTotals();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Helper function to calculate table cost vs items cost
  const calculateCostBreakdown = (transaction: Transaction) => {
    if (!transaction.items || transaction.items.length === 0) {
      return {
        tableCost: transaction.amount,
        itemsCost: 0,
        hasItems: false
      };
    }

    const itemsTotal = transaction.items.reduce((sum: number, item: { name: string; price: number; quantity: number }) =>
      sum + (item.price * item.quantity), 0
    );
    const tableCost = transaction.amount - itemsTotal;

    return {
      tableCost: Math.max(0, tableCost), // Ensure non-negative
      itemsCost: itemsTotal,
      hasItems: true
    };
  };

  const playerPendingPayments = pendingPayments.filter(payment =>
    payment.player.toLowerCase() === player.name.toLowerCase()
  );

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== "all" && transaction.status !== statusFilter) return false;

    if (fromDate) {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      if (transactionDate < fromDate) return false;
    }

    if (toDate) {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      if (transactionDate > toDate) return false;
    }

    return true;
  });

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (selectedTransaction) {
      // Payment for specific transaction
      const currentPaid = selectedTransaction.paidAmount || 0;
      const remainingAmount = selectedTransaction.amount - currentPaid;

      if (amount > remainingAmount) {
        toast.error(`Payment amount cannot exceed remaining balance of ₹${remainingAmount}`);
        return;
      }

      const newPaidAmount = currentPaid + amount;
      const newStatus = newPaidAmount >= selectedTransaction.amount ? 'paid' : 'partial';

      updateTransaction(selectedTransaction.id, {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentMethod: paymentMethod || undefined
      });

      toast.success(`Payment of ₹${amount} applied to transaction`);
    } else {
      // General payment - create transaction record
      try {
        await addTransaction({
          playerId: player.id,
          playerName: player.name,
          amount,
          paymentMethod: (paymentMethod as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other') || 'cash',
          description: `Payment received`,
          transactionType: 'payment',
          timestamp: Date.now()
        });
        toast.success(`Payment of ₹${amount} recorded for ${player.name}`);
      } catch (error) {
        toast.error("Failed to record payment: " + (error as Error).message);
      }
    }

    setPaymentDialogOpen(false);
    setPaymentAmount("");
    setPaymentMethod("");
    setSelectedTransaction(null);
  };

  const handleMarkInvoicePaid = async () => {
    if (!selectedPendingPayment) return;

    const payment = playerPendingPayments.find(p => p.id === selectedPendingPayment);
    if (!payment) return;

    try {
      // Move to ended sessions as paid
      await addEndedSession({
        ...payment,
        paidAmount: payment.totalAmount,
        pendingAmount: 0,
        paymentStatus: 'paid'
      });

      // Remove from pending payments
      await deletePendingPayment(selectedPendingPayment);

      toast.success(`Invoice marked as paid for ${player.name}`);
      setMarkPaidDialogOpen(false);
      setSelectedPendingPayment(null);
    } catch (error) {
      toast.error("Failed to mark invoice as paid: " + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Player Header - Ultra Mobile Optimized */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 md:p-6">
        {/* Mobile: Compact single column */}
        <div className="block sm:hidden space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-foreground font-semibold text-base truncate">{player.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                <p className="text-foreground text-sm">{player.phone}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-orange-600 font-bold text-lg">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-foreground font-semibold text-sm">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-green-600 font-semibold text-sm">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-indigo-600 font-semibold text-sm">₹{(totalSpent + totalPending).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tablet and Desktop: Grid layout */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name and Phone */}
            <div className="space-y-3">
              <div>
                <Label className="text-foreground flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-primary" />
                  Name
                </Label>
                <p className="text-foreground font-medium text-lg sm:text-xl">{player.name}</p>
              </div>
              <div>
                <Label className="text-foreground flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone
                </Label>
                <p className="text-foreground">{player.phone}</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <Label className="text-foreground text-xs sm:text-sm block">Outstanding</Label>
                <p className="text-orange-600 font-bold text-lg sm:text-xl">₹{totalPending.toLocaleString()}</p>
              </div>
              <div className="text-center sm:text-left">
                <Label className="text-foreground text-xs sm:text-sm block">Total Spent</Label>
                <p className="text-foreground font-medium text-base sm:text-lg">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-center sm:text-left">
                <Label className="text-foreground text-xs sm:text-sm block">Total Paid</Label>
                <p className="text-green-600 font-medium text-base sm:text-lg">₹{totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Enhanced Responsive Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-primary mb-1">₹{totalSpent.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Spent</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600 mb-1">₹{totalPaid.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Paid</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-orange-600 mb-1">₹{totalPending.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Pending</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-600 mb-1">{playerPendingPayments.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Active</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600 mb-1">₹{(totalSpent + totalPending).toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Amount</div>
        </Card>
      </div>

      {/* Quick Actions - Ultra Mobile Optimized */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <Link to={`/new-booking?player=${encodeURIComponent(player.name)}`}>
            <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="font-medium">Add New Booking</span>
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
              onClick={() => setPaymentDialogOpen(true)}
            >
              <DollarSign className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              Add Payment
            </Button>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
              onClick={() => setMarkPaidDialogOpen(true)}
              disabled={playerPendingPayments.length === 0}
            >
              <CheckCircle className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              Mark Paid
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="space-y-3 sm:space-y-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Transaction History</h3>
            <div className="flex items-center gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full font-medium">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Mobile: Collapsible filters */}
          <div className="block sm:hidden">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">Filters</span>
                <span className="text-xs text-muted-foreground group-open:hidden">Tap to expand</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">Tap to collapse</span>
              </summary>
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-h-[40px] text-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full min-h-[40px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="From date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="min-h-[40px] text-sm"
                  />
                  <Input
                    type="date"
                    placeholder="To date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="min-h-[40px] text-sm"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Desktop: Always visible filters */}
          <div className="hidden sm:flex sm:flex-col gap-3">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-h-[44px]"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 min-h-[44px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 flex-1">
                <Input
                  type="date"
                  placeholder="From date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 min-h-[44px]"
                />
                <Input
                  type="date"
                  placeholder="To date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 min-h-[44px]"
                />
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {transactions.length === 0 ? "No transactions found for this player." : "No transactions match your filters."}
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Mobile Card Layout - Ultra Optimized */}
            <div className="block sm:hidden space-y-2">
              {filteredTransactions.map((transaction) => {
                const costBreakdown = calculateCostBreakdown(transaction);
                return (
                  <Card key={transaction.id} className="p-3 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
                    <div className="space-y-2">
                      {/* Header with badges and amount */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5">
                            {transaction.type}
                          </Badge>
                          <Badge
                            variant={
                              transaction.status === 'paid' ? 'default' :
                              transaction.status === 'partial' ? 'secondary' : 'destructive'
                            }
                            className="text-xs px-1.5 py-0.5"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-accent">
                            {transaction.status === 'partial' && transaction.paidAmount
                              ? `₹${transaction.paidAmount.toLocaleString()}`
                              : `₹${transaction.amount.toLocaleString()}`
                            }
                          </div>
                          {transaction.status === 'partial' && transaction.paidAmount && (
                            <div className="text-xs text-muted-foreground">
                              of ₹{transaction.amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description and date */}
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight mb-1">
                          {transaction.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          {transaction.duration && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.duration}
                            </p>
                          )}
                        </div>
                        {costBreakdown.hasItems && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Table: ₹{costBreakdown.tableCost.toLocaleString()} + Items: ₹{costBreakdown.itemsCost.toLocaleString()}
                          </div>
                        )}
                        {transaction.paymentMode && (
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            Payment: {transaction.paymentMode.toUpperCase()}
                          </p>
                        )}
                        {transaction.paymentMethod && (
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            Method: {transaction.paymentMethod.replace('_', ' ')}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 pt-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setTransactionDialogOpen(true);
                          }}
                          className="flex-1 min-h-[32px] text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setPaymentDialogOpen(true);
                          }}
                          disabled={transaction.status === 'paid'}
                          className="flex-1 min-h-[32px] text-xs"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Pay
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Mobile Total Summary Card */}
              {filteredTransactions.length > 0 && (
                <Card className="p-4 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 dark:border-indigo-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-xs text-muted-foreground">
                        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600">
                        ₹{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const costBreakdown = calculateCostBreakdown(transaction);
                    return (
                      <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transaction.duration || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {transaction.status === 'partial' && transaction.paidAmount
                                ? `₹${transaction.paidAmount.toLocaleString()} / ₹${transaction.amount.toLocaleString()}`
                                : `₹${transaction.amount.toLocaleString()}`
                              }
                            </div>
                            {costBreakdown.hasItems && (
                              <div className="text-xs text-muted-foreground">
                                Table: ₹{costBreakdown.tableCost.toLocaleString()} + Items: ₹{costBreakdown.itemsCost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === 'paid' ? 'default' :
                              transaction.status === 'partial' ? 'secondary' : 'destructive'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.paymentMode ? transaction.paymentMode.toUpperCase() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setTransactionDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setPaymentDialogOpen(true);
                              }}
                              disabled={transaction.status === 'paid'}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Total Row */}
                  {filteredTransactions.length > 0 && (
                    <TableRow className="bg-muted/20 font-semibold border-t-2">
                      <TableCell colSpan={4} className="text-right font-bold">
                        Total Amount:
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        ₹{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </TableCell>
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Dialog - Mobile Optimized */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[400px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base sm:text-lg">Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="payment-amount" className="text-foreground text-sm">
                Payment Amount (₹)
              </Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
                step="0.01"
                className="bg-secondary border-border text-foreground min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-foreground text-sm">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-secondary border-border text-foreground min-h-[44px]">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setPaymentDialogOpen(false)}
                className="min-h-[40px] px-4 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayment}
                className="bg-green-600 hover:bg-green-700 min-h-[40px] px-4 text-sm"
              >
                Add Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Invoice Paid Dialog - Mobile Optimized */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base sm:text-lg">Mark Invoice as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Select a pending payment to mark as fully paid:
            </p>
            {playerPendingPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending payments found for this player.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {playerPendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPendingPayment === payment.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPendingPayment(payment.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{payment.table}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.endTimestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{payment.pendingAmount}</p>
                        <p className="text-sm text-muted-foreground">pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setMarkPaidDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleMarkInvoicePaid}
                disabled={!selectedPendingPayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mark as Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog - Mobile Optimized */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base sm:text-lg">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Type</Label>
                  <p className="text-foreground font-medium capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <Label className="text-foreground">Status</Label>
                  <Badge
                    variant={
                      selectedTransaction.status === 'paid' ? 'default' :
                      selectedTransaction.status === 'partial' ? 'secondary' : 'destructive'
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-foreground">Date</Label>
                  <p className="text-foreground">{new Date(selectedTransaction.date).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-foreground">Duration</Label>
                  <p className="text-foreground">{selectedTransaction.duration || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-foreground">Total Amount</Label>
                  <p className="text-foreground font-bold">₹{selectedTransaction.amount.toLocaleString()}</p>
                </div>
                {selectedTransaction.paidAmount && (
                  <div>
                    <Label className="text-foreground">Paid Amount</Label>
                    <p className="text-foreground">₹{selectedTransaction.paidAmount.toLocaleString()}</p>
                  </div>
                )}
                {selectedTransaction.table && (
                  <div>
                    <Label className="text-foreground">Table</Label>
                    <p className="text-foreground">{selectedTransaction.table}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-foreground">Description</Label>
                <p className="text-foreground">{selectedTransaction.description}</p>
              </div>
              {(() => {
                const costBreakdown = calculateCostBreakdown(selectedTransaction);
                return costBreakdown.hasItems ? (
                  <div>
                    <Label className="text-foreground">Cost Breakdown</Label>
                    <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Table Cost:</span>
                        <span>₹{costBreakdown.tableCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Items Cost:</span>
                        <span>₹{costBreakdown.itemsCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>₹{selectedTransaction.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <div>
                  <Label className="text-foreground">Items Ordered</Label>
                  <div className="space-y-1">
                    {selectedTransaction.items.map((item: { name: string; price: number; quantity: number }, index: number) => (
                      <div key={index} className="text-sm text-muted-foreground flex justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerAccounts;