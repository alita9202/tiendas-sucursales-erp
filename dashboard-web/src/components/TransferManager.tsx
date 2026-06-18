import { useState } from 'react';
import { ArrowRightLeft, Package } from 'lucide-react';

export default function TransferManager() {
  const [transferAmount, setTransferAmount] = useState(50);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Transferencias</h1>
            <p className="text-secondary mt-1">Movimiento de inventario entre sucursales.</p>
          </div>
        </header>

        {/* TODO Inventory Service: conectar POST /inventory/transfer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <ArrowRightLeft className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Inventory Service. Pendiente: conectar POST /inventory/transfer.
          </p>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
          <form className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Producto a transferir</label>
              <div className="flex items-center gap-3 bg-surface border border-outline-variant/30 rounded-lg p-3">
                <Package className="w-5 h-5 text-secondary" />
                <select className="w-full bg-transparent focus:outline-none text-sm">
                  <option>Leche Pil 980cc (PROD-002)</option>
                  <option>Mayonesa Cris (PROD-003)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              
              {/* Origen */}
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h3 className="font-bold text-on-surface">Origen</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">Supermercado</label>
                  <select disabled className="w-full bg-surface-container-high border-none rounded px-2 py-1 text-sm appearance-none cursor-not-allowed">
                    <option>OXXO Bolivia</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">Sucursal</label>
                  <select className="w-full bg-surface-container border border-outline-variant/30 rounded px-2 py-1.5 text-sm focus:outline-none">
                    <option>Sucursal Prado</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="text-xs text-secondary">Stock actual:</span>
                  <span className="font-bold text-red-600">100 unidades</span>
                </div>
              </div>

              {/* Icono Centro */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-center block mb-1 text-secondary">Cantidad</label>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full bg-surface border-2 border-primary/30 rounded-lg px-2 py-1.5 text-center font-bold text-primary focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>

              {/* Destino */}
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <h3 className="font-bold text-on-surface">Destino</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">Supermercado</label>
                  <select disabled className="w-full bg-surface-container-high border-none rounded px-2 py-1 text-sm appearance-none cursor-not-allowed">
                    <option>OXXO Bolivia</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">Sucursal</label>
                  <select className="w-full bg-surface-container border border-outline-variant/30 rounded px-2 py-1.5 text-sm focus:outline-none">
                    <option>Sucursal El Alto</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="text-xs text-secondary">Stock actual:</span>
                  <span className="font-bold text-green-600">0 unidades</span>
                </div>
              </div>

            </div>

            <div className="pt-6">
              <button 
                type="button" 
                onClick={() => alert(`Simulando transferencia de ${transferAmount} unidades. Disminuye en Prado, aumenta en El Alto. Evento TransferCompleted simulado.`)}
                className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Transferir Stock
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
