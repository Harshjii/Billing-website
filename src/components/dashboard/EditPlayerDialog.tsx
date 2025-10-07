import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User } from "lucide-react";

interface EditPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  currentPhoneNumber?: string;
  onEditPlayer: (newName: string, newPhoneNumber?: string) => void;
}

export const EditPlayerDialog = ({ open, onClose, currentName, currentPhoneNumber, onEditPlayer }: EditPlayerDialogProps) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    if (open) {
      setPlayerName(currentName);
      setPhoneNumber(currentPhoneNumber || "");
    }
  }, [open, currentName, currentPhoneNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onEditPlayer(playerName.trim(), phoneNumber.trim() || undefined);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Player Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Player Name
            </Label>
            <Input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
              placeholder="Enter player name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-secondary border-border text-foreground"
              placeholder="Enter phone number"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Update Details
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};