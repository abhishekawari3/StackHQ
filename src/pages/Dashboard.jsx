import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, AlertTriangle, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, lowStockRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers }),
        axios.get(`${API}/dashboard/low-stock`, { headers }),
        axios.get(`${API}/dashboard/recent-invoices`, { headers })
      ]);
      
      setStats(statsRes.data);
      setLowStock(lowStockRes.data);
      setRecentInvoices(invoicesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-full"><div className="text-lg">Loading...</div></div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's your business overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-customers">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats?.total_customers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-products">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</CardTitle>
              <Package className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats?.total_products || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-low-stock">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Low Stock Items</CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats?.low_stock_items || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-outstanding">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding Amount</CardTitle>
              <IndianRupee className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{stats?.total_outstanding?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-today-sales">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Sales</CardTitle>
              <Calendar className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{stats?.today_sales?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow" data-testid="stat-month-sales">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Month Sales</CardTitle>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{stats?.month_sales?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20" data-testid="low-stock-alert">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg" data-testid={`low-stock-item-${product.id}`}>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-50">{product.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">SKU: {product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">{product.stock_quantity} {product.unit}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Reorder at: {product.reorder_level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices */}
        {recentInvoices.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800" data-testid="recent-invoices">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-50">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Invoice #</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Customer</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Amount</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50" data-testid={`invoice-row-${invoice.id}`}>
                        <td className="p-3 text-sm text-slate-900 dark:text-slate-50">{invoice.invoice_number}</td>
                        <td className="p-3 text-sm text-slate-900 dark:text-slate-50">{invoice.customer_name}</td>
                        <td className="p-3 text-sm text-slate-900 dark:text-slate-50">₹{invoice.total_amount?.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                            invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}>
                            {invoice.payment_status}
                          </span>
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