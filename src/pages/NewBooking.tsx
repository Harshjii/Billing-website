import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, User, Hash, CreditCard } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";
import { usePlayers } from "@/hooks/usePlayers";

const NewBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSession } = useSessions();
  const { players } = usePlayers();
  const [formData, setFormData] = useState({
    playerName: "",
    tableNumber: "",
    rate: "5",
    startTime: "",
    paymentMode: "cash" as 'cash' | 'card' | 'upi' | 'other',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);

  const tables = ["Pool A", "Pool B", "Snooker A", "Snooker B"];

  // Handle URL parameter for pre-filling player name
  useEffect(() => {
    const playerParam = searchParams.get('player');
    if (playerParam) {
      setFormData(prev => ({ ...prev, playerName: playerParam }));
    }
  }, [searchParams]);

  // Filter players based on input
  useEffect(() => {
    if (formData.playerName.trim()) {
      const filtered = players
        .filter(player =>
          player.name.toLowerCase().includes(formData.playerName.toLowerCase()) ||
          player.phone.includes(formData.playerName)
        )
        .map(player => `${player.name} (${player.phone})`)
        .slice(0, 5); // Limit to 5 suggestions
      const suggestions = [...filtered];
      if (filtered.length < 5 && !players.some(p =>
        p.name.toLowerCase() === formData.playerName.toLowerCase() ||
        p.phone === formData.playerName
      )) {
        suggestions.push("Add new player");
      }
      setFilteredPlayers(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setFilteredPlayers([]);
      setShowSuggestions(false);
    }
  }, [formData.playerName, players]);

  const handlePlayerNameChange = (value: string) => {
    setFormData({ ...formData, playerName: value });
  };

  const handlePlayerSelect = (suggestion: string) => {
    if (suggestion === "Add new player") {
      // Navigate to player accounts page to add new player
      navigate("/player-accounts");
      return;
    }
    // Extract player name from "Name (Phone)" format
    const playerName = suggestion.split(" (")[0];
    setFormData({ ...formData, playerName });
    setShowSuggestions(false);
  };

  const handlePlayerInputBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let startTime: string;
    let startTimestamp: number;

    if (formData.startTime) {
      // Custom start time: use today's date with the specified time
      const today = new Date();
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      startTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0).getTime();
      startTime = formData.startTime;
    } else {
      // Current time
      startTimestamp = Date.now();
      startTime = new Date().toLocaleTimeString();
    }

    const rate = parseFloat(formData.rate) || 5;

    const newSession = {
      table: formData.tableNumber,
      player: formData.playerName,
      startTime: startTime,
      startTimestamp: startTimestamp,
      duration: "0 min",
      tableAmount: 0,
      items: [],
      totalAmount: 0,
      paymentMode: formData.paymentMode,
      ratePerMinute: rate
    };
    try {
      await addSession(newSession);
      toast.success("Session started successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to start session: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/">
          <Button variant="secondary" className="mb-2 sm:mb-4 w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            New Booking
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Start a new snooker session</p>
        </div>

        <Card className="bg-card border-border shadow-card p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="playerName" className="text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Player Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter player name or phone"
                value={formData.playerName}
                onChange={(e) => handlePlayerNameChange(e.target.value)}
                onBlur={handlePlayerInputBlur}
                onFocus={() => {
                  if (filteredPlayers.length > 0) setShowSuggestions(true);
                }}
                required
                className="bg-secondary border-border text-foreground min-h-[44px]"
                autoComplete="off"
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredPlayers.map((playerName, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-foreground"
                      onClick={() => handlePlayerSelect(playerName)}
                    >
                      {playerName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableNumber" className="text-foreground flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Table Number
              </Label>
              <Select
                value={formData.tableNumber}
                onValueChange={(value) => setFormData({ ...formData, tableNumber: value })}
                required
              >
                <SelectTrigger className="bg-secondary border-border text-foreground min-h-[44px]">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {tables.map((table) => (
                    <SelectItem key={table} value={table} className="text-foreground">
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-secondary border-border text-foreground min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Rate per Minute (₹)
              </Label>
              <Input
                id="rate"
                type="number"
                placeholder="5"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                required
                className="bg-secondary border-border text-foreground min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode" className="text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Mode
              </Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(value) => setFormData({ ...formData, paymentMode: value as 'cash' | 'card' | 'upi' | 'other' })}
                required
              >
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

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-glow hover:opacity-90 transition-opacity h-12 sm:h-10"
                size="lg"
              >
                Start Session
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                Timer will start automatically upon confirmation
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewBooking;
