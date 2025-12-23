import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useCompany } from '@/context/CompanyContext'; // ✅ import

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { companyData } = useCompany(); // ✅ access company info

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(response.data);
    } catch (error) {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!invoice) return <div className="p-8">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Action Buttons */}
      <div className="no-print p-4 flex gap-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print Invoice
        </Button>
      </div>

      {/* Invoice */}
      <div className="print-container max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-slate-900 p-12 shadow-lg">
          {/* Header */}
          <div className="border-b-2 border-slate-300 dark:border-slate-700 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">TAX INVOICE</h1>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {companyData.company_name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {companyData.address}, {companyData.city}, {companyData.state} - {companyData.pincode}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  GSTIN: {companyData.gstin || 'N/A'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Phone: {companyData.phone}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Email: {companyData.email}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 dark:text-slate-400">Invoice Number</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {invoice.invoice_number}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* ... rest of your invoice layout remains the same ... */}
        </div>
      </div>
    </div>
  );
}
