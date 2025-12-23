import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [paymentsRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/payments`, { headers }),
        axios.get(`${API}/invoices`, { headers })
      ]);
      
      setPayments(paymentsRes.data);
      // Filter only unpaid or partial invoices
      setInvoices(invoicesRes.data.filter(inv => inv.balance > 0));
    } catch (error) {
      toast.error('Failed to load data');
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
        amount: parseFloat(formData.amount)
      };
      
      await axios.post(`${API}/payments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Payment recorded successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_id: '',
      amount: '',
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
  };

  const selectedInvoice = invoices.find(inv => inv.id === formData.invoice_id);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="payments-title">Payments</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Record and track payments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-payment-btn">
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="payment-dialog">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice *</Label>
                  <Select value={formData.invoice_id} onValueChange={(value) => setFormData({ ...formData, invoice_id: value })} required>
                    <SelectTrigger data-testid="payment-invoice-select">
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map(invoice => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.customer_name} (Balance: ₹{invoice.balance?.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoice && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm text-blue-900 dark:text-blue-300">
                      <div>Customer: {selectedInvoice.customer_name}</div>
                      <div>Total Amount: ₹{selectedInvoice.total_amount?.toFixed(2)}</div>
                      <div className="font-semibold">Outstanding Balance: ₹{selectedInvoice.balance?.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    max={selectedInvoice?.balance || undefined}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    data-testid="payment-amount-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })} required>
                    <SelectTrigger data-testid="payment-method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    placeholder="Transaction ID, Cheque No., etc."
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    data-testid="payment-reference-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    data-testid="payment-notes-input"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="payment-submit-btn">Record Payment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              No payments recorded yet. Record your first payment to get started.
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
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Method</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Reference</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`payment-row-${payment.id}`}>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{payment.invoice_number}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{payment.customer_name}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">₹{payment.amount?.toFixed(2)}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">{payment.reference_number || '-'}</td>
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-50">
                          {new Date(payment.payment_date).toLocaleDateString()}
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