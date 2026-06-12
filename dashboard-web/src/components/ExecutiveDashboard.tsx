import { useMemo } from 'react';
import { Transaction } from '../types';
import { Calendar, Download, TrendingUp, AlertCircle, Clock, ArrowRight, Wallet, CreditCard, Landmark } from 'lucide-react';

interface ExecutiveDashboardProps {
  transactions: Transaction[];
}

export default function ExecutiveDashboard({ transactions }: ExecutiveDashboardProps) {
  
  // Calculate dynamic sales
  const salesMetrics = useMemo(() => {
    // Start with a grand baseline of $12.4M as shown in the screenshot
    const baseline = 12450000;
    const completedSalesSum = transactions
      .filter((t) => t.status === 'Completado')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const total = baseline + completedSalesSum;
    
    return {
      formatted: `$${(total / 1000000).toFixed(2)}M`,
      raw: total,
    };
  }, [transactions]);

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar pb-24 transition-all duration-300">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface leading-tight tracking-tight">
            Dashboard Ejecutivo
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-xl font-body leading-relaxed opacity-80 italic text-sm">
            Informes consolidados y estados financieros en tiempo real para la toma de decisiones estratégicas.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => alert('Filtro de rango: Últimos 30 días seleccionado.')}
            className="px-5 py-2.5 rounded-lg bg-surface-container-high text-primary font-semibold text-xs hover:bg-surface-container-highest transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Últimos 30 días
          </button>
          <button
            onClick={() => alert('Generando y descargando PDF ejecutivo de Alexandria ERP...')}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-xs shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        
        {/* KPI 1: Consolidated Sales */}
        <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between group hover:bg-primary transition-all duration-500 overflow-hidden relative shadow-sm">
          <div className="relative z-10">
            <span className="font-label text-[10px] uppercase tracking-widest text-[#5a5f63] group-hover:text-primary-fixed block mb-2">
              Ventas Consolidadas
            </span>
            <h3 className="text-3xl font-headline font-bold text-on-surface group-hover:text-white transition-colors">
              {salesMetrics.formatted}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-6 relative z-10">
            <TrendingUp className="w-4 h-4 text-primary group-hover:text-white" />
            <span className="text-xs font-semibold text-primary group-hover:text-white">+8.2%</span>
            <span className="text-[10px] text-on-surface-variant group-hover:text-primary-fixed/70 ml-auto transition-colors">
              vs. mes anterior
            </span>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-primary group-hover:text-white" />
          </div>
        </div>

        {/* KPI 2: Active Branches */}
        <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between group hover:bg-tertiary transition-all duration-500 overflow-hidden relative shadow-sm">
          <div className="relative z-10">
            <span className="font-label text-[10px] uppercase tracking-widest text-[#5a5f63] group-hover:text-tertiary-fixed block mb-2">
              Sucursales Activas
            </span>
            <h3 className="text-3xl font-headline font-bold text-on-surface group-hover:text-white transition-colors">
              142
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-6 relative z-10">
            <span className="text-xs font-semibold text-tertiary group-hover:text-white">Capacidad 92%</span>
            <span className="text-[10px] text-[#5a5f63] group-hover:text-tertiary-fixed/70 ml-auto transition-colors">
              +3 aperturas
            </span>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-tertiary group-hover:text-white" />
          </div>
        </div>

        {/* KPI 3: Accounts Receivable */}
        <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between group transition-all duration-500 shadow-sm">
          <div>
            <span className="font-label text-[10px] uppercase tracking-widest text-[#5a5f63] block mb-2">
              Cuentas por Cobrar (AR)
            </span>
            <h3 className="text-3xl font-headline font-bold text-on-surface">$3.1M</h3>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <AlertCircle className="w-4 h-4 text-error" />
            <span className="text-xs font-semibold text-error">Vencido: 12%</span>
            <div className="w-24 h-1.5 bg-surface-container rounded-full ml-auto overflow-hidden">
              <div className="bg-primary h-full w-[65%]"></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Accounts Payable */}
        <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between group transition-all duration-500 shadow-sm">
          <div>
            <span className="font-label text-[10px] uppercase tracking-widest text-[#5a5f63] block mb-2">
              Cuentas por Pagar (AP)
            </span>
            <h3 className="text-3xl font-headline font-bold text-on-surface">$1.8M</h3>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-on-surface-variant">Próx. 7 días: $420k</span>
            <ArrowRight className="w-4 h-4 text-[#5a5f63] ml-auto" />
          </div>
        </div>
      </section>

      {/* Main Charts & Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 shrink-0">
        
        {/* Sales Dynamic Comparison Column Chart */}
        <div className="lg:col-span-2 p-10 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-xl font-headline font-bold text-on-surface">Comparativa de Ventas</h4>
              <p className="text-xs text-[#5a5f63] font-label mt-1">Mensual vs Año Anterior</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-label uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary"></span> 2024
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-outline-variant"></span> 2023
              </div>
            </div>
          </div>

          {/* Visual Custom Native SVG Column Bar Graph */}
          <div className="relative h-72 flex items-end justify-between gap-4">
            
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between py-1 pointer-events-none opacity-40">
              <div className="w-full border-t border-outline-variant/30"></div>
              <div className="w-full border-t border-outline-variant/30"></div>
              <div className="w-full border-t border-outline-variant/30"></div>
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            
            {/* Interactive Bars representing ENE, FEB, MAR, ABR, MAY, JUN */}
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[60%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[75%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">ENE</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[55%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[80%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">FEB</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[65%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[85%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">MAR</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[70%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[95%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">ABR</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[80%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[90%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">MAY</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              <div className="w-full bg-[#c3c6d5]/40 rounded-t-sm h-[75%] transition-all"></div>
              <div className="w-full bg-primary rounded-t-sm h-[100%] transition-all group-hover:bg-primary-container"></div>
              <span className="text-[9px] font-label font-bold text-on-surface-variant mt-4">JUN</span>
            </div>
          </div>
        </div>

        {/* Pie Chart: Unpaid Accounts breakdown */}
        <div className="p-10 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 flex flex-col h-full shadow-sm">
          <h4 className="text-xl font-headline font-bold text-on-surface">Cuentas Impagadas</h4>
          <p className="text-xs text-[#5a5f63] font-label mb-10">Desglose por antigüedad</p>
          
          {/* Custom SVG Circle Donut Graph */}
          <div className="relative w-44 h-44 mx-auto flex-1 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-primary-container"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="180 251.2"
              ></circle>
              <circle
                className="text-tertiary-container"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="45 251.2"
                strokeDashoffset="-180"
              ></circle>
              <circle
                className="text-error"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="26.2 251.2"
                strokeDashoffset="-225"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-headline font-bold text-on-surface">$3.1M</span>
              <span className="text-[8px] font-label font-bold uppercase text-[#5a5f63] tracking-widest">Total AR</span>
            </div>
          </div>

          {/* Legend Items block */}
          <div className="mt-8 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container"></div>
                <span className="text-on-surface-variant font-label">0-30 días</span>
              </div>
              <span className="font-bold text-on-surface">$2.2M</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></div>
                <span className="text-on-surface-variant font-label">31-90 días</span>
              </div>
              <span className="font-bold text-on-surface">$650k</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                <span className="text-on-surface-variant font-label">+90 días</span>
              </div>
              <span className="font-bold text-on-surface">$250k</span>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction flow block */}
      <section className="space-y-6 shrink-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-headline font-bold text-on-surface">Transacciones Recientes</h4>
          <span className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
            Ver historial completo <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-8 py-4 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">ID Operación</th>
                <th className="px-8 py-5 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Empresa / Cliente</th>
                <th className="px-8 py-5 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Sucursal</th>
                <th className="px-8 py-5 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Monto</th>
                <th className="px-8 py-5 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Método</th>
                <th className="px-8 py-5 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs font-body">
              {transactions.slice(0, 5).map((tx) => {
                const isCompletado = tx.status === 'Completado';
                const isPendiente = tx.status === 'Pendiente';

                return (
                  <tr key={tx.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-4 font-semibold text-on-surface font-mono">{tx.id}</td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{tx.client}</span>
                        <span className="text-[10px] text-on-surface-variant opacity-75">{tx.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-on-surface-variant">{tx.branch}</td>
                    <td className="px-8 py-4 font-bold text-on-surface">
                      ${tx.amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-label font-bold uppercase tracking-wider text-[#5a5f63]">
                        {tx.method === 'Transferencia' ? (
                          <Landmark className="w-3.5 h-3.5 text-primary" />
                        ) : tx.method === 'Tarjeta' ? (
                          <CreditCard className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Wallet className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span>{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                        isCompletado
                          ? 'bg-primary/10 text-primary'
                          : isPendiente
                          ? 'bg-tertiary-container/10 text-on-tertiary-container'
                          : 'bg-error-container/20 text-error'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Editorial footer block */}
      <footer className="pt-12 border-t border-outline-variant/10 bg-surface-container-lowest mt-12 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-4 max-w-sm">
            <h5 className="font-headline font-bold text-lg text-primary">Alexandria Intelligence</h5>
            <p className="text-[11px] text-[#5a5f63] leading-relaxed font-label font-medium uppercase tracking-tight">
              Este informe ejecutivo es generado automáticamente por el motor de análisis de Alexandria ERP. Los datos reflejan la actividad consolidada hasta el <span className="font-bold">{new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16 font-label">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-75">Soporte</span>
              <ul className="text-xs space-y-2 font-semibold text-secondary">
                <li className="hover:text-primary transition-colors cursor-pointer">Centro de Ayuda</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Documentación</li>
                <li className="hover:text-primary transition-colors cursor-pointer">API Reference</li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-75">Legal</span>
              <ul className="text-xs space-y-2 font-semibold text-secondary">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacidad</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Cumplimiento</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Términos</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
