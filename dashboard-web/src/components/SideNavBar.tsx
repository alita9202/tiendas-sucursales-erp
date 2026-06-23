import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Truck, 
  Boxes, 
  CreditCard, 
  ArrowRightLeft, 
  BarChart2, 
  Bell, 
  History, 
  Settings, 
  ClipboardCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

export type TabId = 
  | 'dashboard' 
  | 'companies' 
  | 'products' 
  | 'inventory-load' 
  | 'inventory' 
  | 'pos' 
  | 'transfers' 
  | 'reports' 
  | 'notifications' 
  | 'history' 
  | 'settings';

interface SideNavBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export default function SideNavBar({ activeTab, setActiveTab }: SideNavBarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Panel Ejecutivo', icon: LayoutDashboard },
    { id: 'companies' as const, label: 'Empresas y Sucursales', icon: Building2 },
    { id: 'products' as const, label: 'Productos y Categorías', icon: Package },
    { id: 'inventory-load' as const, label: 'Carga de Inventario', icon: Truck },
    { id: 'inventory' as const, label: 'Inventario', icon: Boxes },
    { id: 'pos' as const, label: 'Ventas / Punto de Venta', icon: CreditCard },
    { id: 'transfers' as const, label: 'Transferencias', icon: ArrowRightLeft },
    { id: 'reports' as const, label: 'Reportes', icon: BarChart2 },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
    { id: 'history' as const, label: 'Historial y Evidencias', icon: History },
  ];

  const subItems = [
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="h-screen w-72 flex flex-col left-0 top-0 sticky bg-surface-container dark:bg-surface-container-high border-r border-outline-variant/10 shrink-0 z-30 transition-colors duration-300">
      {/* Brand Header */}
      <div className="px-8 py-10">
        <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">
          Multi-compañía Doña Serafina
        </h1>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary opacity-70 mt-1">
          ERP
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-6 py-3 w-full transition-all duration-300 text-left rounded-lg group relative cursor-pointer ${
                isActive
                  ? 'text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-highest/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:opacity-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSideBarTabGlow"
                  className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full"
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
              className={`flex items-center gap-4 px-6 py-3 w-full transition-all duration-300 text-left rounded-lg cursor-pointer group ${
                isActive
                  ? 'text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-highest/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:opacity-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSideBarTabGlowFooter"
                  className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`} />
              <span className="font-body text-sm font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Admin User headshot card */}
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-3 px-6 py-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            AD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-on-surface truncate">Admin Usuario</span>
            <span className="text-[10px] text-on-surface-variant opacity-70 truncate font-label">Equipo de Desarrollo</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
