import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, User, Hash, Clock, CreditCard } from "lucide-react";

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
  paymentMode?: 'cash' | 'card' | 'upi' | 'other';
  ratePerMinute?: number;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  onConfirmPayment: (paidAmount: number, paymentMode: 'cash' | 'card' | 'upi' | 'other') => void;
}

const PaymentDialog = ({ open, onClose, session, onConfirmPayment }: PaymentDialogProps) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'other'>('cash');

  useEffect(() => {
    if (open && session) {
      // Pre-fill with any existing paid amount
      setPaymentAmount(session.paidAmount?.toString() || "");
      setPaymentMode(session.paymentMode || 'cash');
    }
  }, [open, session]);

  if (!session) return null;

  // Calculate real-time amounts like in active sessions
  const elapsedMinutes = session.startTimestamp ?
    Math.floor((Date.now() - session.startTimestamp) / 60000) : 0;
  const tableAmount = elapsedMinutes * (session.ratePerMinute || 5); // Real-time table calculation
  const itemsTotal = session.items ? session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const totalAmount = tableAmount + itemsTotal; // Real-time total calculation
  const currentPaid = parseFloat(paymentAmount) || 0;
  const pendingAmount = Math.max(0, totalAmount - currentPaid);

  const handleConfirm = () => {
    const amount = parseFloat(paymentAmount) || 0;
    if (amount < 0) return;

    onConfirmPayment(amount, paymentMode);
    setPaymentAmount("");
    setPaymentMode('cash');
    onClose();
  };

  const handleCancel = () => {
    setPaymentAmount("");
    setPaymentMode('cash');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            End Session & Collect Payment
          </DialogTitle>
          <DialogDescription>
            Collect payment for {session.player}'s session at Table {session.table}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{session.player}</p>
                <p className="text-xs text-muted-foreground">Player</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Table {session.table}</p>
                <p className="text-xs text-muted-foreground">Table</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{session.duration}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">₹{totalAmount}</p>
                <p className="text-xs text-muted-foreground">Total Bill</p>
              </div>
            </div>
          </div>

          {/* Payment Input */}
          <div className="space-y-2">
            <Label htmlFor="payment">Payment Amount (₹)</Label>
            <Input
              id="payment"
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              step="0.01"
              className="text-lg"
            />
          </div>

          {/* Payment Mode Selection */}
          <div className="space-y-2">
            <Label htmlFor="paymentMode" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Mode
            </Label>
            <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as 'cash' | 'card' | 'upi' | 'other')}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
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

          {/* Items Details */}
          {session.items && session.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Items Ordered:</h4>
              <div className="space-y-1">
                {session.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-2">Bill Breakdown:</div>
              <div className="flex justify-between text-sm">
                <span>Table: ({elapsedMinutes}min × ₹{session.ratePerMinute || 5}/min)</span>
                <span className="font-medium">₹{tableAmount}</span>
              </div>
              {itemsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span className="font-medium">₹{itemsTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total Bill:</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Received:</span>
                <span className="font-medium text-green-600">₹{currentPaid}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Pending Amount:</span>
                <span className={pendingAmount > 0 ? "text-red-600" : "text-green-600"}>
                  ₹{pendingAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {pendingAmount > 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Partial Payment:</strong> ₹{pendingAmount} will be added to pending payments.
                You can collect the remaining amount later.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Full Payment:</strong> Session will be completed and moved to revenue records.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} className="min-h-[44px] px-4">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!paymentAmount || parseFloat(paymentAmount) < 0}
            className="bg-green-600 hover:bg-green-700 min-h-[44px] px-4"
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;