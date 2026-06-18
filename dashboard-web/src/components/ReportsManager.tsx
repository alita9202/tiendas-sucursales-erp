import { useState, useEffect } from 'react';
import { BarChart2, Download, RefreshCw, FileText } from 'lucide-react';

export default function ReportsManager() {
  const [stockReport, setStockReport] = useState([
    { name: 'IC Norte / Melchor Perez', qty: 85, color: 'bg-blue-500' },
    { name: 'OXXO Bolivia / Sucursal El Alto', qty: 50, color: 'bg-green-500' },
    { name: 'OXXO Bolivia / Sucursal Prado', qty: 48, color: 'bg-yellow-500' },
    { name: 'Hipermaxi / Sucursal 1', qty: 18, color: 'bg-red-500' },
  ]);
  const [salesDay, setSalesDay] = useState(null);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

  const fetchReports = async () => {
    try {
      const [sRes, sdRes] = await Promise.all([
        fetch('http://localhost:3000/api/reports/stock'),
        fetch('http://localhost:3000/api/reports/sales-day')
      ]);
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.length > 0) {
          setStockReport(sData.map((d: any, i: number) => ({
            name: `${d.company_name} / ${d.branch_name}`,
            qty: Number(d.total_stock) || 0,
            color: colors[i % colors.length]
          })));
        }
      }
      if (sdRes.ok) {
        const sdData = await sdRes.json();
        if (sdData.length > 0) {
          setSalesDay(sdData[0]); // since view groups by day
        }
      }
    } catch (e) {
      console.warn('Usando datos mock de reportes', e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalStock = stockReport.reduce((acc, it) => acc + it.qty, 0);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Reportes</h1>
            <p className="text-secondary mt-1">Análisis consolidado de inventario y ventas.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchReports} className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button className="flex items-center gap-2 bg-surface text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
            <button className="flex items-center gap-2 bg-surface text-green-600 border border-green-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </header>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <FileText className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Reporting Service. Estado actual: módulo base funcional para demostración. Pendiente del responsable: completar integración, validaciones y pruebas del módulo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Reporte 1: Stock consolidado */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-high/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Stock Consolidado por Producto
              </h2>
              <select className="text-sm bg-surface border border-outline-variant/30 rounded px-2 py-1">
                <option>Filtrar por Todos</option>
              </select>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <p className="text-sm text-secondary">Total Consolidado</p>
                  <p className="text-3xl font-bold text-on-surface">{totalStock} <span className="text-sm font-normal text-secondary">unidades</span></p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {stockReport.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-on-surface">{item.name}</span>
                      <span className="font-bold">{item.qty}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${Math.min((item.qty / Math.max(totalStock, 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reporte 2: Ventas del día */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-high/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-green-500" />
                Ventas del Día
              </h2>
              <span className="text-sm font-medium bg-surface px-2 py-1 rounded border border-outline-variant/20">
                2026-06-17
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                  <p className="text-sm text-secondary mb-1">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">Bs 495.50</p>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                  <p className="text-sm text-secondary mb-1">Métodos de Pago</p>
                  <div className="flex gap-2 text-sm font-medium">
                    <span className="text-blue-600">Efectivo: 60%</span>
                    <span className="text-purple-600">Tarjeta: 40%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 border border-outline-variant/20 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-right">Cant.</th>
                      <th className="p-3 text-right">Precio</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr className="hover:bg-surface-container/50">
                      <td className="p-3 font-medium">Leche Pil 980cc</td>
                      <td className="p-3 text-right">3</td>
                      <td className="p-3 text-right">Bs 18.50</td>
                      <td className="p-3 text-right font-bold">Bs 55.50</td>
                    </tr>
                    <tr className="hover:bg-surface-container/50">
                      <td className="p-3 font-medium">Mayonesa Cris</td>
                      <td className="p-3 text-right">120</td>
                      <td className="p-3 text-right">Bs 2.00</td>
                      <td className="p-3 text-right font-bold">Bs 240.00</td>
                    </tr>
                    <tr className="hover:bg-surface-container/50">
                      <td className="p-3 font-medium text-secondary italic">Otros productos...</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right font-bold text-secondary">Bs 200.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
