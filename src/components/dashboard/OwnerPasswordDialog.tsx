import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OwnerPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerPasswordDialog = ({ open, onClose, onSuccess }: OwnerPasswordDialogProps) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const OWNER_PASSWORD = "owner"; // Default password for owner access

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === OWNER_PASSWORD) {
      setError("");
      setPassword("");
      onSuccess();
      onClose();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Owner Authentication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Enter Owner Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Access Revenue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};