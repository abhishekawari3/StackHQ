import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API}/suppliers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Supplier updated successfully');
      } else {
        await axios.post(`${API}/suppliers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Supplier created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone,
      address: supplier.address || '',
      gstin: supplier.gstin || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="suppliers-title">Suppliers</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your supplier database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-supplier-btn">
                <Plus className="w-4 h-4" /> Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="supplier-dialog">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="supplier-name-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required data-testid="supplier-phone-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} data-testid="supplier-email-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} data-testid="supplier-address-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} data-testid="supplier-gstin-input" />
                </div>
                <Button type="submit" className="w-full" data-testid="supplier-submit-btn">{editingId ? 'Update' : 'Create'} Supplier</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : suppliers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No suppliers found. Add your first supplier to get started.
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
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">GSTIN</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`supplier-row-${supplier.id}`}>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{supplier.name}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{supplier.phone}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{supplier.email || '-'}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{supplier.gstin || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)} data-testid={`edit-supplier-${supplier.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(supplier.id)} data-testid={`delete-supplier-${supplier.id}`}>
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