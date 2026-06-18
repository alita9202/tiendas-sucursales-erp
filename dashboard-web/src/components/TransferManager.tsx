import { useState, useEffect } from 'react';
import { ArrowRightLeft, AlertCircle, Search, RefreshCw } from 'lucide-react';

export default function TransferManager() {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    source_branch: '',
    dest_branch: '',
    product_id: '',
    quantity: 50,
    user_id: 'EMP-001'
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/api/branches').then(r => r.json()).catch(() => []),
      fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => [])
    ]).then(([bData, pData]) => {
      if (bData.length > 1) {
        setBranches(bData);
        setFormData(f => ({ ...f, source_branch: bData[0].id, dest_branch: bData[1].id }));
      }
      if (pData.length > 0) {
        setProducts(pData);
        setFormData(f => ({ ...f, product_id: pData[0].id }));
      }
    });
  }, []);

  const handleTransfer = async () => {
    if (formData.source_branch === formData.dest_branch) {
      alert('La sucursal origen y destino deben ser distintas');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) alert('Transferencia completada');
      else alert('Error en la transferencia. Verifica el stock en el origen.');
    } catch (e) {
      alert('Backend no disponible. Simulando transferencia.');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Transferencias</h1>
            <p className="text-secondary mt-1">Gestión de movimiento de inventario entre sucursales.</p>
          </div>
        </header>

        {/* TODO Inventory Service: conectar POST /inventory/transfer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <ArrowRightLeft className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Inventory Service. Estado actual: módulo base funcional para demostración. Pendiente del responsable: completar integración, validaciones y pruebas del módulo.
          </p>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Origen */}
            <div className="space-y-4">
              <h2 className="font-bold text-on-surface text-lg">Origen</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Sucursal de Salida</label>
                <select 
                  value={formData.source_branch}
                  onChange={e => setFormData({ ...formData, source_branch: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2"
                >
                  {branches.length > 0 ? branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  )) : (
                    <option value="HIPER-C">OXXO Prado (Mock)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Icono Central */}
            <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-4">
              <h2 className="font-bold text-on-surface text-lg">Destino</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Sucursal de Entrada</label>
                <select 
                  value={formData.dest_branch}
                  onChange={e => setFormData({ ...formData, dest_branch: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2"
                >
                  {branches.length > 0 ? branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  )) : (
                    <option value="HIPER-S">OXXO El Alto (Mock)</option>
                  )}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Producto a Transferir</label>
              <select 
                value={formData.product_id}
                onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2"
              >
                {products.length > 0 ? products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                )) : (
                  <option value="PROD-002">Leche Pil 980cc</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Cantidad</label>
                <input 
                  type="number" 
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: +e.target.value })}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2" 
                />
              </div>
              <button 
                onClick={handleTransfer}
                className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2 mt-7 h-[42px]"
              >
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
