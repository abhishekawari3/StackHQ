import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API}/customers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Customer updated successfully');
      } else {
        await axios.post(`${API}/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Customer created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      gstin: customer.gstin || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const handleView = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewCustomer(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load customer details');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', gstin: '' });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="customers-title">Customers</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your customer database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-customer-btn">
                <Plus className="w-4 h-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="customer-dialog">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="customer-name-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required data-testid="customer-phone-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} data-testid="customer-email-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} data-testid="customer-address-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} data-testid="customer-gstin-input" />
                </div>
                <Button type="submit" className="w-full" data-testid="customer-submit-btn">{editingId ? 'Update' : 'Create'} Customer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No customers found. Add your first customer to get started.
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
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Phone</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`customer-row-${customer.id}`}>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{customer.name}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{customer.phone}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{customer.email || '-'}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{customer.outstanding_amount?.toFixed(2) || '0.00'}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleView(customer.id)} data-testid={`view-customer-${customer.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)} data-testid={`edit-customer-${customer.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(customer.id)} data-testid={`delete-customer-${customer.id}`}>
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

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent data-testid="view-customer-dialog">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{viewCustomer.customer.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewCustomer.customer.phone}</p>
                {viewCustomer.customer.email && <p className="text-sm text-slate-600 dark:text-slate-400">{viewCustomer.customer.email}</p>}
              </div>
              {viewCustomer.customer.address && (
                <div>
                  <Label>Address</Label>
                  <p className="text-sm">{viewCustomer.customer.address}</p>
                </div>
              )}
              {viewCustomer.customer.gstin && (
                <div>
                  <Label>GSTIN</Label>
                  <p className="text-sm">{viewCustomer.customer.gstin}</p>
                </div>
              )}
              <div>
                <Label>Outstanding Amount</Label>
                <p className="text-lg font-semibold text-red-600">₹{viewCustomer.customer.outstanding_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Purchase History</h4>
                {viewCustomer.invoices.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">No purchase history</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {viewCustomer.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                        <span className="text-sm">{invoice.invoice_number}</span>
                        <span className="text-sm font-semibold">₹{invoice.total_amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}