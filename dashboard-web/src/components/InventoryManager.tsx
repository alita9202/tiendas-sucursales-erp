import { useState, useEffect } from 'react';
import { Product, ArchivalLog } from '../types';
import { Boxes, RefreshCw, AlertTriangle, FileSpreadsheet, Search } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  logs: ArchivalLog[];
  updateProductStock: (id: string, newStock: number) => void;
  addLog: (log: ArchivalLog) => void;
}

export default function InventoryManager({
  products,
  logs,
  updateProductStock,
  addLog,
}: InventoryManagerProps) {

  const [mockInventory, setMockInventory] = useState([
    {
      id: 'inv1',
      product: 'Leche Pil 980cc',
      company: 'OXXO Bolivia',
      branch: 'Sucursal Prado',
      quantity: 48,
      lowStock: false,
    },
    {
      id: 'inv2',
      product: 'Leche Pil 980cc',
      company: 'OXXO Bolivia',
      branch: 'Sucursal El Alto',
      quantity: 50,
      lowStock: false,
    },
    {
      id: 'inv3',
      product: 'Mayonesa Cris',
      company: 'Hipermaxi',
      branch: 'Sucursal 1',
      quantity: 4,
      lowStock: true,
    }
  ]);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/inventory');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setMockInventory(data.map((row: any) => ({
              id: row.branch_id + '-' + row.product_id,
              product: row.product_name,
              company: row.company_name,
              branch: row.branch_name,
              quantity: Number(row.stock_quantity),
              lowStock: row.status === 'Bajo',
            })));
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using mock inventory', err);
      }
    };
    fetchInv();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Inventario</h1>
            <p className="text-secondary mt-1">Supervisión de stock por sucursal y movimientos (Kardex).</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </header>

        {/* TODO Inventory Service: conectar GET /inventory */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Boxes className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Inventory Service. Estado actual: módulo base funcional para demostración. Pendiente del responsable: completar integración, validaciones y pruebas del módulo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            
            {/* Buscador */}
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input type="text" placeholder="Buscar por producto, supermercado o sucursal..." className="w-full bg-surface border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            {/* Tabla de Inventario */}
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                      <th className="p-4">Producto</th>
                      <th className="p-4">Supermercado</th>
                      <th className="p-4">Sucursal</th>
                      <th className="p-4 text-center">Cantidad</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {mockInventory.map((item) => (
                      <tr key={item.id} className={`hover:bg-surface-container-high/30 transition-colors ${item.lowStock ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <td className="p-4 font-bold text-on-surface">{item.product}</td>
                        <td className="p-4">{item.company}</td>
                        <td className="p-4 text-secondary">{item.branch}</td>
                        <td className="p-4 text-center">
                          <span className={`font-mono text-base font-bold ${item.lowStock ? 'text-red-600' : 'text-on-surface'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {item.lowStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Stock Bajo
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                              Óptimo
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => alert(`Simulando kardex para ${item.product} en ${item.branch}`)}
                              className="px-2 py-1 bg-surface border border-outline-variant/20 text-xs font-medium rounded hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              Ver Kardex
                            </button>
                            <button 
                              onClick={() => alert(`Baja por pérdida/vencimiento para ${item.product}`)}
                              className="px-2 py-1 bg-surface border border-outline-variant/20 text-xs font-medium text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              Baja
                            </button>
                            {item.lowStock && (
                              <button className="px-2 py-1 bg-primary text-on-primary text-xs font-medium rounded hover:bg-primary/90 transition-colors flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Reabastecer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Lateral - Movimientos Recientes / Kardex Rápido */}
          <div className="space-y-6">
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" /> Kardex Reciente
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-outline-variant/20">
                
                {/* Movimiento 1 */}
                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Venta - POS</p>
                  <p className="text-[10px] text-secondary">Leche Pil 980cc • OXXO Prado</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-red-600 bg-red-50 px-1 rounded">-2</span>
                </div>

                {/* Movimiento 2 */}
                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Transferencia Salida</p>
                  <p className="text-[10px] text-secondary">Leche Pil 980cc • OXXO Prado</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded">-50</span>
                </div>

                {/* Movimiento 3 */}
                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-green-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Transferencia Entrada</p>
                  <p className="text-[10px] text-secondary">Leche Pil 980cc • OXXO El Alto</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-green-600 bg-green-50 px-1 rounded">+50</span>
                </div>

                {/* Movimiento 4 */}
                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-green-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Lote Inicial</p>
                  <p className="text-[10px] text-secondary">Leche Pil 980cc • OXXO Prado</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-green-600 bg-green-50 px-1 rounded">+100</span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
