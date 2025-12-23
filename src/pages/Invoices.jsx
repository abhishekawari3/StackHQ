import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ product_id: '', quantity: 0 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        axios.get(`${API}/invoices`, { headers }),
        axios.get(`${API}/customers`, { headers }),
        axios.get(`${API}/products`, { headers })
      ]);
      
      setInvoices(invoicesRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { product_id: '', quantity: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;
    setInvoiceItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const items = invoiceItems.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const quantity = parseFloat(item.quantity);
        const unitPrice = product.price;
        const gstRate = product.gst_rate;
        const itemTotal = quantity * unitPrice;
        const gstAmount = (itemTotal * gstRate) / 100;
        
        return {
          product_id: item.product_id,
          product_name: product.name,
          hsn_code: product.hsn_code,
          quantity,
          unit: product.unit,
          unit_price: unitPrice,
          gst_rate: gstRate,
          gst_amount: gstAmount,
          total: itemTotal + gstAmount
        };
      });
      
      const payload = {
        customer_id: selectedCustomer,
        items
      };
      
      if (dueDate) {
        payload.due_date = new Date(dueDate).toISOString();
      }
      
      await axios.post(`${API}/invoices`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Invoice created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setDueDate('');
    setInvoiceItems([{ product_id: '', quantity: 0 }]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice? Stock will be restored and customer balance updated.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Invoice deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="invoices-title">Invoices</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Create and manage invoices</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-invoice-btn">
                <Plus className="w-4 h-4" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl" data-testid="invoice-dialog">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                    <SelectTrigger data-testid="invoice-customer-select">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    data-testid="invoice-due-date-input"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Items *</Label>
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={item.product_id} onValueChange={(value) => handleItemChange(index, 'product_id', value)} required>
                          <SelectTrigger data-testid={`invoice-product-select-${index}`}>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₹{product.price} (GST: {product.gst_rate}%)
                              </SelectItem>
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
                          data-testid={`invoice-quantity-input-${index}`}
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} data-testid={`invoice-remove-item-${index}`}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddItem} className="w-full" data-testid="invoice-add-item-btn">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                <Button type="submit" className="w-full" data-testid="invoice-submit-btn">Create Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No invoices found. Create your first invoice to get started.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Invoice #</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Balance</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`invoice-row-${invoice.id}`}>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{invoice.invoice_number}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{invoice.customer_name}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{invoice.total_amount?.toFixed(2)}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{invoice.balance?.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                            invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}>
                            {invoice.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/invoice/${invoice.id}/print`)}
                            data-testid={`print-invoice-${invoice.id}`}
                          >
                            <Printer className="w-4 h-4 mr-1" /> Print
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 ml-2"
                            onClick={() => handleDelete(invoice.id)}
                            data-testid={`delete-invoice-${invoice.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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