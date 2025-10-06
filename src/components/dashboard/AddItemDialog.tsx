import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  price: number;
}

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAddItem: (categoryId: string, quantity: number) => void;
}

export const AddItemDialog = ({ open, onClose, categories, onAddItem }: AddItemDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && quantity) {
      onAddItem(selectedCategory, parseInt(quantity));
      setSelectedCategory("");
      setQuantity("1");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Item to Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Select Item</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id.toString()}
                    className="text-foreground"
                  >
                    {category.name} - ₹{category.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
