import { LayoutDashboard, Boxes, CreditCard, Settings, History } from 'lucide-react';
import { motion } from 'motion/react';

interface SideNavBarProps {
  activeTab: 'dashboard' | 'inventory' | 'pos' | 'settings' | 'history';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'pos' | 'settings' | 'history') => void;
}

export default function SideNavBar({ activeTab, setActiveTab }: SideNavBarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory' as const,
      label: 'Inventory Manager',
      icon: Boxes,
    },
    {
      id: 'pos' as const,
      label: 'POS Checkout',
      icon: CreditCard,
    },
  ];

  const subItems = [
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'history' as const,
      label: 'Archival Logs',
      icon: History,
    },
  ];

  return (
    <aside className="h-screen w-72 flex flex-col left-0 top-0 sticky bg-surface-container dark:bg-surface-container-high border-r border-outline-variant/10 shrink-0 z-30 transition-colors duration-300">
      {/* Brand Header */}
      <div className="px-8 py-10">
        <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">
          Alexandria Retail
        </h1>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary opacity-70 mt-1">
          Premium Management
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-6 py-4 w-full transition-all duration-300 text-left rounded-lg group relative cursor-pointer ${
                isActive
                  ? 'text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-highest/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:opacity-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSideBarTabGlow"
                  className="absolute right-0 top-3 bottom-3 w-1 bg-primary rounded-l-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              />
              <span className="font-body text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Navigation & Profile */}
      <div className="p-4 border-t border-outline-variant/10 space-y-1">
        {subItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-10 py-3 w-full transition-all duration-300 text-left rounded-lg cursor-pointer group ${
                isActive
                  ? 'text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-highest/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:opacity-100'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span className="font-body text-xs font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Admin User headshot card */}
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-3 px-6 py-2">
          <img
            alt="Admin User Headshot"
            className="w-10 h-10 rounded-full object-cover shadow-sm bg-neutral-200"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPuHHJXCP7QR0mNguzAhZuL92CCzj8-wPimJEsH2jkx2kkt5RQ_t3G3QxLjBfKuBVCK-niQ5BabU-cA5ozLrySuMUpo1trJDN-OL6CHJ10tGOgeAbCfZJ-IasCIlzHrHbYc_7t0VY8-TKVHNE_Cud7EMinNuXeQWMunWVezpDSi7hUkYZwm_3NgsSK6Klztq9wBrP3GyU4kSTrUqRF_m1eUqP5pk9RCpNDTnMMSmOfVlpTDqD3ccoB1GLnnr7qY4xhLLElDmN0tK0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-on-surface truncate">Admin Usuario</span>
            <span className="text-[10px] text-on-surface-variant opacity-70 truncate font-label">Corporate HQ</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
