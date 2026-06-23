import { useState, useEffect } from 'react';
import { ArrowRightLeft, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

export default function TransferManager() {
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    source_branch: '',
    dest_branch: '',
    product_id: '',
    quantity: 50 as number | string,
    user_id: 'EMP-001'
  });

  const loadCatalogs = async () => {
    setLoading(true);

    try {
      const [bData, pData] = await Promise.all([
        fetch('http://localhost:3000/api/branches').then(r => r.json()).catch(() => []),
        fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => [])
      ]);

      if (bData.length > 0) {
        setBranches(bData);

        setFormData(f => ({
          ...f,
          source_branch: f.source_branch || bData[0].id,
          dest_branch: f.dest_branch || (bData[1]?.id || bData[0].id),
        }));
      }

      if (pData.length > 0) {
        const activeProducts = pData.filter((p: any) => p.status === 'ACTIVE');
        setProducts(activeProducts);

        setFormData(f => ({
          ...f,
          product_id: activeProducts.length > 0 ? (f.product_id || activeProducts[0].id) : '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const handleTransfer = async () => {
    if (!formData.source_branch || !formData.dest_branch) {
      alert('Debe seleccionar sucursal origen y sucursal destino.');
      return;
    }

    if (formData.source_branch === formData.dest_branch) {
      alert('La sucursal origen y destino deben ser distintas.');
      return;
    }

    if (!formData.product_id) {
      alert('Debe seleccionar un producto activo.');
      return;
    }

    if (Number.isNaN(formData.quantity) || formData.quantity <= 0 || !Number.isInteger(formData.quantity)) {
      alert('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Transferencia completada correctamente.');
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.message || 'Error en la transferencia. Verifica el stock en el origen.');
      }
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
            <p className="text-secondary mt-1">
              Gestión de movimiento de inventario entre sucursales.
            </p>
          </div>

          <button
            onClick={loadCatalogs}
            className="flex items-center gap-2 bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </header>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Módulo Inventory Service: transferencia entre sucursales, validación de origen/destino, productos activos y actualización de stock mediante API.
          </p>
        </div>

        {products.length === 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-orange-800 dark:text-orange-300 font-medium text-sm">
              No hay productos activos disponibles para transferir. Active un producto desde Productos y Categorías.
            </p>
          </div>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

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
                    <option key={b.id} value={b.id}>
                      {b.company_name ? `${b.company_name} - ${b.name}` : b.name}
                    </option>
                  )) : (
                    <option value="">Sin sucursales disponibles</option>
                  )}
                </select>
              </div>
            </div>

            <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
            </div>

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
                    <option key={b.id} value={b.id}>
                      {b.company_name ? `${b.company_name} - ${b.name}` : b.name}
                    </option>
                  )) : (
                    <option value="">Sin sucursales disponibles</option>
                  )}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Producto activo a Transferir</label>
              <select
                value={formData.product_id}
                onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2"
              >
                {products.length > 0 ? products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.code} - ${p.name}` : p.name}
                  </option>
                )) : (
                  <option value="">Sin productos activos</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, quantity: val === '' ? '' : Number(val) });
                  }}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={products.length === 0}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 mt-7 h-[42px] ${
                  products.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary/90'
                }`}
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