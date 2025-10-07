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
  quantity: number;
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

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const maxQuantity = selectedCategoryData?.quantity || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (selectedCategory && quantity && qty > 0 && qty <= maxQuantity) {
      onAddItem(selectedCategory, qty);
      setSelectedCategory("");
      setQuantity("1");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
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
                    {category.name} - ₹{category.price} (Stock: {category.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground">
              Quantity {selectedCategoryData && `(Available: ${maxQuantity})`}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
            {selectedCategoryData && parseInt(quantity) > maxQuantity && (
              <p className="text-sm text-destructive">Quantity exceeds available stock</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose} className="min-h-[44px] px-4">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary min-h-[44px] px-4">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
