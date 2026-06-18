import { Truck, Upload, Save, FileSpreadsheet } from 'lucide-react';

export default function InventoryLoadManager() {
  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Carga de Inventario</h1>
            <p className="text-secondary mt-1">Ingreso de lotes iniciales y abastecimiento por sucursal.</p>
          </div>
        </header>

        {/* TODO Inventory Service: conectar POST /inventory/loadExcel */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Truck className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Inventory Service. Pendiente: conectar POST /inventory/loadExcel y POST /inventory/load.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Carga Manual */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Carga Manual de Lote
            </h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Supermercado</label>
                  <select className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>OXXO Bolivia</option>
                    <option>Abuelita Serafina</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Sucursal</label>
                  <select className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>Sucursal Prado</option>
                    <option>Sucursal El Alto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Producto</label>
                <select className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Leche Pil 980cc (PROD-002)</option>
                  <option>Mayonesa Cris (PROD-003)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Cantidad</label>
                  <input type="number" defaultValue={100} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Costo (Bs)</label>
                  <input type="number" step="0.01" defaultValue={15.00} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Precio (Bs)</label>
                  <input type="number" step="0.01" defaultValue={18.50} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <button type="button" className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors mt-2">
                Registrar Lote Inicial
              </button>
            </form>
          </div>

          {/* Importación Excel */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Importación Masiva (Excel)
            </h2>
            
            <div className="flex-1 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 bg-surface/50 hover:bg-surface transition-colors cursor-pointer group">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-on-surface mb-1 text-center">Haz clic o arrastra un archivo Excel aquí</p>
              <p className="text-xs text-secondary text-center max-w-xs">Formatos soportados: .xlsx, .csv. La plantilla debe incluir Código, Sucursal, Cantidad, Costo y Precio.</p>
              
              <button className="mt-6 bg-surface text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                Simular Importación Excel
              </button>
            </div>
            
            <p className="text-xs text-center text-secondary mt-4">
              * Pendiente de conectar a POST /inventory/loadExcel
            </p>
          </div>

        </div>

        {/* Vista previa de datos demo */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10">
            <h3 className="font-bold text-on-surface">Últimos Lotes Registrados (Demo)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                  <th className="p-4">Código</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Supermercado</th>
                  <th className="p-4">Sucursal</th>
                  <th className="p-4 text-right">Cantidad</th>
                  <th className="p-4 text-right">Costo</th>
                  <th className="p-4 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="hover:bg-surface-container-high/30 transition-colors">
                  <td className="p-4 font-mono text-secondary">PROD-002</td>
                  <td className="p-4 font-medium text-on-surface">Leche Pil 980cc</td>
                  <td className="p-4">OXXO Bolivia</td>
                  <td className="p-4">Sucursal Prado</td>
                  <td className="p-4 text-right font-medium">100</td>
                  <td className="p-4 text-right">Bs 15.00</td>
                  <td className="p-4 text-right text-green-600">Bs 18.50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
