import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, User, Hash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";

const NewBooking = () => {
  const navigate = useNavigate();
  const { addSession } = useSessions();
  const [formData, setFormData] = useState({
    playerName: "",
    tableNumber: "",
    rate: "5",
    startTime: "",
  });

  const tables = ["Pool A", "Pool B", "Snooker A", "Snooker B"];

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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/">
          <Button variant="secondary" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            New Booking
          </h1>
          <p className="text-muted-foreground mt-2">Start a new snooker session</p>
        </div>

        <Card className="bg-card border-border shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Player Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter player name"
                value={formData.playerName}
                onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                required
                className="bg-secondary border-border text-foreground min-h-[44px]"
              />
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

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-glow hover:opacity-90 transition-opacity"
                size="lg"
              >
                Start Session
              </Button>
              <p className="text-sm text-muted-foreground text-center px-4">
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
