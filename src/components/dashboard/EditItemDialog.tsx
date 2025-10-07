import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

interface EditItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: SessionItem | null;
  onEditItem: (quantity: number) => void;
  onRemoveItem: () => void;
}

export const EditItemDialog = ({ open, onClose, item, onEditItem, onRemoveItem }: EditItemDialogProps) => {
  const [quantity, setQuantity] = useState<string>("1");

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity.toString());
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity && parseInt(quantity) > 0) {
      onEditItem(parseInt(quantity));
      onClose();
    }
  };

  const handleRemove = () => {
    onRemoveItem();
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Item: {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Price per item: ₹{item.price}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="destructive" onClick={handleRemove}>
              Remove Item
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Update Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};