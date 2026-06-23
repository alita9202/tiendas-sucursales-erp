import { Building2, MapPin, Package, Boxes, CreditCard, ArrowRightLeft, Bell, ClipboardCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { TabId } from './SideNavBar';

interface ExecutiveDashboardProps {
  transactions: Transaction[];
  setActiveTab: (tab: TabId) => void;
}

export default function ExecutiveDashboard({ transactions, setActiveTab }: ExecutiveDashboardProps) {
  
  const demoFlow = [
    { id: 'companies', label: 'Empresas y Sucursales', icon: Building2, desc: 'Registrar supermercados y sus sucursales (ej. OXXO Prado).' },
    { id: 'products', label: 'Productos y Categorías', icon: Package, desc: 'Gestionar el catálogo central de productos.' },
    { id: 'inventory-load', label: 'Carga de Inventario', icon: Boxes, desc: 'Ingreso inicial de mercadería manual o Excel.' },
    { id: 'inventory', label: 'Inventario', icon: Boxes, desc: 'Monitorear stock y kardex por sucursal.' },
    { id: 'pos', label: 'Ventas / Punto de Venta', icon: CreditCard, desc: 'Simular transacciones y emitir comprobantes.' },
    { id: 'transfers', label: 'Transferencias', icon: ArrowRightLeft, desc: 'Mover stock entre diferentes sucursales.' },
    { id: 'reports', label: 'Reportes', icon: TrendingUp, desc: 'Ver consolidado de ventas e inventario.' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, desc: 'Monitorear eventos en tiempo real (RabbitMQ).' },
    { id: 'checklist', label: 'Checklist de Defensa', icon: ClipboardCheck, desc: 'Revisar pendientes del equipo de desarrollo.' },
  ];

  const metrics = [
    { label: 'Supermercados', value: '4', icon: Building2, color: 'text-blue-500' },
    { label: 'Sucursales', value: '6', icon: MapPin, color: 'text-indigo-500' },
    { label: 'Productos', value: '6', icon: Package, color: 'text-purple-500' },
    { label: 'Stock Total', value: '201', icon: Boxes, color: 'text-orange-500' },
    { label: 'Ventas (Hoy)', value: 'Bs 495.50', icon: CreditCard, color: 'text-green-500' },
    { label: 'Transferencias', value: '1', icon: ArrowRightLeft, color: 'text-teal-500' },
    { label: 'Notificaciones', value: '4', icon: Bell, color: 'text-yellow-500' },
    { label: 'Avance Defensa', value: '1/9', icon: ClipboardCheck, color: 'text-red-500' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar pb-24 transition-all duration-300">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface leading-tight tracking-tight">
            Panel Ejecutivo
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-xl font-body leading-relaxed opacity-80 text-sm">
            Métricas principales y flujo de operación recomendado.
          </p>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-6 rounded-xl bg-surface-container border border-outline-variant/15 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors shadow-sm">
              <Icon className={`w-8 h-8 mb-3 ${m.color}`} />
              <h3 className="text-2xl font-bold text-on-surface">{m.value}</h3>
              <span className="text-xs text-secondary mt-1 font-medium">{m.label}</span>
            </div>
          );
        })}
      </section>

      {/* Demo Flow Section */}
      <section className="space-y-6 shrink-0">
        <h3 className="text-2xl font-headline font-bold text-on-surface border-b border-outline-variant/10 pb-4">
          Flujo de operación recomendado
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoFlow.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black text-outline-variant/20 group-hover:text-primary/10 transition-colors">
                    {index + 1}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-on-surface mb-2">{step.label}</h4>
                <p className="text-sm text-secondary flex-1">{step.desc}</p>
                <button 
                  onClick={() => setActiveTab(step.id as TabId)}
                  className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Ir al módulo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
