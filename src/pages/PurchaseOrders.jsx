import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 0 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        axios.get(`${API}/purchase-orders`, { headers }),
        axios.get(`${API}/suppliers`, { headers }),
        axios.get(`${API}/products`, { headers })
      ]);
      
      setOrders(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const items = orderItems.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const quantity = parseFloat(item.quantity);
        const unitPrice = product.price;
        return {
          product_id: item.product_id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          total: quantity * unitPrice
        };
      });
      
      await axios.post(`${API}/purchase-orders`, {
        supplier_id: selectedSupplier,
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Purchase order created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm('Mark this purchase order as received and update stock?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/purchase-orders/${id}/receive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Purchase order received and stock updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const resetForm = () => {
    setSelectedSupplier('');
    setOrderItems([{ product_id: '', quantity: 0 }]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="purchase-orders-title">Purchase Orders</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your inventory purchases</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-po-btn">
                <Plus className="w-4 h-4" /> Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl" data-testid="po-dialog">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier} required>
                    <SelectTrigger data-testid="po-supplier-select">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Items *</Label>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={item.product_id} onValueChange={(value) => handleItemChange(index, 'product_id', value)} required>
                          <SelectTrigger data-testid={`po-product-select-${index}`}>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>{product.name} - ₹{product.price}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          data-testid={`po-quantity-input-${index}`}
                        />
                      </div>
                      {orderItems.length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} data-testid={`po-remove-item-${index}`}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddItem} className="w-full" data-testid="po-add-item-btn">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                <Button type="submit" className="w-full" data-testid="po-submit-btn">Create Purchase Order</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No purchase orders found. Create your first purchase order to get started.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">PO Number</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Supplier</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Items</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`po-row-${order.id}`}>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{order.po_number}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{order.supplier_name}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{order.items.length} items</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{order.total_amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {order.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleReceive(order.id)} data-testid={`receive-po-${order.id}`}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Receive
                            </Button>
                          )}
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