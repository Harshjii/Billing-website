import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Stock = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({ name: "", price: "", quantity: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: formData.name,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        });
        toast.success("Stock item updated successfully!");
        setEditingId(null);
      } else {
        await addCategory({
          name: formData.name,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        });
        toast.success("Stock item added successfully!");
      }
      setFormData({ name: "", price: "", quantity: "" });
    } catch (error) {
      toast.error("Failed to save stock item: " + (error as Error).message);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      price: category.price.toString(),
      quantity: category.quantity.toString()
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Stock item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete stock item: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/">
          <Button variant="secondary" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Manage Stock
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Add and manage stock items and quantities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {editingId ? "Edit Stock Item" : "Add New Stock Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cold Drink"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">Price per Unit (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-secondary border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-foreground">Stock Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="bg-secondary border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-glow hover:opacity-90 min-h-[44px] text-base"
              >
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Update Stock Item" : "Add Stock Item"}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full min-h-[44px] text-base"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", price: "", quantity: "" });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>

          <Card className="lg:col-span-2 bg-card border-border shadow-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Stock Items List</h2>
            {isMobile ? (
              <div className="space-y-3">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-accent" />
                            <span className="text-accent font-semibold">₹{category.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-primary font-semibold">{category.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="default"
                          variant="secondary"
                          onClick={() => handleEdit(category)}
                          className="min-h-[44px] px-4"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="default"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
                          className="min-h-[44px] px-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Item Name</TableHead>
                      <TableHead className="text-muted-foreground">Price per Unit</TableHead>
                      <TableHead className="text-muted-foreground">Stock Quantity</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                        <TableCell className="text-accent font-semibold">₹{category.price.toFixed(2)}</TableCell>
                        <TableCell className="text-primary font-semibold">{category.quantity}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(category)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(category.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stock;