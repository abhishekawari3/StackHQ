import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  FileText, 
  CreditCard,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/customers', icon: Users, label: 'Customers', testId: 'nav-customers' },
    { path: '/products', icon: Package, label: 'Products', testId: 'nav-products' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers', testId: 'nav-suppliers' },
    { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders', testId: 'nav-purchase-orders' },
    { path: '/invoices', icon: FileText, label: 'Invoices', testId: 'nav-invoices' },
    { path: '/payments', icon: CreditCard, label: 'Payments', testId: 'nav-payments' },
    { path: '/settings', icon: Settings, label: 'Settings', testId: 'nav-settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="app-logo">
              CRM System
            </h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium text-sm
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            data-testid="open-sidebar-btn"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CRM System
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}