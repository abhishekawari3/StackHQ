import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    hsn_code: '',
    unit: '',
    price: '',
    gst_rate: '',
    stock_quantity: '',
    reorder_level: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        gst_rate: parseFloat(formData.gst_rate),
        stock_quantity: parseFloat(formData.stock_quantity),
        reorder_level: parseFloat(formData.reorder_level)
      };
      
      if (editingId) {
        await axios.put(`${API}/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      hsn_code: product.hsn_code || '',
      unit: product.unit,
      price: product.price.toString(),
      gst_rate: product.gst_rate.toString(),
      stock_quantity: product.stock_quantity.toString(),
      reorder_level: product.reorder_level.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      hsn_code: '',
      unit: '',
      price: '',
      gst_rate: '',
      stock_quantity: '',
      reorder_level: ''
    });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="products-title">Products</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your inventory</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-product-btn">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="product-dialog">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="product-name-input" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="product-description-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required data-testid="product-sku-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsn_code">HSN Code</Label>
                    <Input id="hsn_code" value={formData.hsn_code} onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })} data-testid="product-hsn-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input id="unit" placeholder="kg, pieces, liters" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required data-testid="product-unit-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required data-testid="product-price-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst_rate">GST Rate (%) *</Label>
                    <Input id="gst_rate" type="number" step="0.01" value={formData.gst_rate} onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })} required data-testid="product-gst-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input id="stock_quantity" type="number" step="0.01" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required data-testid="product-stock-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_level">Reorder Level *</Label>
                    <Input id="reorder_level" type="number" step="0.01" value={formData.reorder_level} onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })} required data-testid="product-reorder-input" />
                  </div>
                </div>
                <Button type="submit" className="w-full" data-testid="product-submit-btn">{editingId ? 'Update' : 'Create'} Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No products found. Add your first product to get started.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">SKU</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Price</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">GST %</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Stock</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`product-row-${product.id}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {product.stock_quantity <= product.reorder_level && (
                              <AlertTriangle className="w-4 h-4 text-orange-600" data-testid={`low-stock-icon-${product.id}`} />
                            )}
                            <span className="text-sm text-slate-900 dark:text-slate-50">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{product.sku}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{product.price.toFixed(2)}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{product.gst_rate}%</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{product.stock_quantity} {product.unit}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} data-testid={`edit-product-${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(product.id)} data-testid={`delete-product-${product.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}