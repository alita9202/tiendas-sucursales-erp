import { useState, useEffect } from 'react';
import { Product, ArchivalLog } from '../types';
import { Boxes, RefreshCw, AlertTriangle, FileSpreadsheet, Search, X } from 'lucide-react';

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
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [kardexRows, setKardexRows] = useState<any[]>([]);
  const [selectedKardexItem, setSelectedKardexItem] = useState<any | null>(null);
  const [showKardexModal, setShowKardexModal] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();

        const mappedInventory = data.map((row: any, index: number) => ({
          id: `${row.company_name}-${row.branch_name}-${row.product_code}-${index}`,
          productId: row.product_id,
          branchId: row.branch_id,
          product: row.product_name,
          productCode: row.product_code,
          company: row.company_name,
          branchName: row.branch_name,
          branch: `${row.branch_name} (${row.city})`,
          quantity: Number(row.quantity) || 0,
          minStock: Number(row.min_stock) || 0,
          stockStatus: row.stock_status,
          lowStock: row.stock_status === 'LOW_STOCK' || row.stock_status === 'OUT_OF_STOCK',
        }));

        mappedInventory.sort((a: any, b: any) => {
          const priority: any = {
            OUT_OF_STOCK: 1,
            LOW_STOCK: 2,
            IN_STOCK: 3,
          };

          return priority[a.stockStatus] - priority[b.stockStatus];
        });

        setLocalInventory(mappedInventory);
      }
    } catch (err) {
      console.warn('Backend unavailable', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleViewKardex = async (item: any) => {
    if (!item.branchId || !item.productId) {
      alert('No se puede consultar Kardex: faltan branch_id o product_id.');
      return;
    }

    try {
      const res = await fetch(`/api/inventory/kardex/${item.branchId}/${item.productId}`);

      if (res.ok) {
        const data = await res.json();
        setKardexRows(data);
        setSelectedKardexItem(item);
        setShowKardexModal(true);
      } else {
        alert('No se pudo obtener el Kardex.');
      }
    } catch (err) {
      alert('No se pudo conectar con el API.');
    }
  };

  const handleReplenish = async (item: any) => {
    if (!item.branchId || !item.productId) {
      alert('No se puede reabastecer: faltan branch_id o product_id.');
      return;
    }

    const qtyText = prompt(
      `Cantidad a reabastecer para ${item.product} en ${item.branch}.\nStock actual: ${item.quantity}`,
      '10'
    );

    if (qtyText === null) return;

    const quantity = Number(qtyText);

    if (Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    const reason = prompt('Motivo del reabastecimiento:', 'Reabastecimiento de stock');

    if (reason === null) return;

    try {
      const res = await fetch('/api/inventory/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: item.branchId,
          product_id: item.productId,
          quantity,
          reason,
        }),
      });

      if (res.ok) {
        alert('Stock reabastecido correctamente.');
        fetchInventory();
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.message || 'No se pudo reabastecer el stock.');
      }
    } catch (err) {
      alert('No se pudo conectar con el API.');
    }
  };

  const handleOutput = async (item: any) => {
    if (!item.branchId || !item.productId) {
      alert('No se puede registrar baja: faltan branch_id o product_id en la vista de inventario.');
      return;
    }

    if (item.quantity <= 0) {
      alert('No se puede dar de baja un producto sin stock.');
      return;
    }

    const qtyText = prompt(
      `Cantidad a dar de baja para ${item.product} en ${item.branch}.\nDisponible: ${item.quantity}`,
      '1'
    );

    if (qtyText === null) return;

    const quantity = Number(qtyText);

    if (Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    if (quantity > item.quantity) {
      alert(`No puede dar de baja más del stock disponible. Disponible: ${item.quantity}`);
      return;
    }

    const reason = prompt(
      'Motivo de la baja:',
      'Baja por pérdida o vencimiento'
    );

    if (reason === null) return;

    try {
      const res = await fetch('/api/inventory/output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: item.branchId,
          product_id: item.productId,
          quantity,
          reason,
        }),
      });

      if (res.ok) {
        alert('Baja registrada correctamente.');
        fetchInventory();
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.message || 'No se pudo registrar la baja.');
      }
    } catch (err) {
      alert('No se pudo conectar con el API.');
    }
  };

  const exportInventory = () => {
    const headers = 'empresa;sucursal;codigo_producto;producto;cantidad;stock_minimo;estado\n';

    const rows = localInventory.map((row: any) => [
      row.company,
      row.branchName,
      row.productCode,
      row.product,
      row.quantity,
      row.minStock,
      row.stockStatus,
    ].join(';')).join('\n');

    const blob = new Blob([headers + rows], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'inventario_actual.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const filteredInventory = localInventory.filter((item: any) => {
    const text = `${item.product} ${item.productCode} ${item.company} ${item.branch}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase().trim());
  });

  const totalItems = localInventory.length;
  const totalLowStock = localInventory.filter((item: any) => item.stockStatus === 'LOW_STOCK').length;
  const totalOutOfStock = localInventory.filter((item: any) => item.stockStatus === 'OUT_OF_STOCK').length;
  const totalBranches = new Set(localInventory.map((item: any) => item.branch)).size;

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Inventario</h1>
            <p className="text-secondary mt-1">Supervisión de stock por sucursal y movimientos (Kardex).</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchInventory}
              className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refrescar
            </button>

            <button
              onClick={exportInventory}
              className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </header>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Boxes className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Inventory Service: stock por sucursal, estados de inventario, exportación, búsqueda, baja real y Kardex real desde movimientos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Registros</p>
            <p className="text-2xl font-bold text-on-surface">{totalItems}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-600">{totalLowStock}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Agotados</p>
            <p className="text-2xl font-bold text-red-600">{totalOutOfStock}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Sucursales</p>
            <p className="text-2xl font-bold text-primary">{totalBranches}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por producto, supermercado o sucursal..."
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                      <th className="p-4 whitespace-nowrap">Producto</th>
                      <th className="p-4 whitespace-nowrap">Código</th>
                      <th className="p-4 whitespace-nowrap">Supermercado</th>
                      <th className="p-4 whitespace-nowrap">Sucursal</th>
                      <th className="p-4 text-center whitespace-nowrap">Stock Mín.</th>
                      <th className="p-4 text-center whitespace-nowrap">Stock Act.</th>
                      <th className="p-4 text-center whitespace-nowrap">Estado</th>
                      <th className="p-4 text-right whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredInventory.map((item: any) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-surface-container-high/30 transition-colors ${
                          item.lowStock ? 'bg-red-50/30 dark:bg-red-900/10' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-on-surface whitespace-nowrap">{item.product}</td>
                        <td className="p-4 text-secondary font-mono text-xs whitespace-nowrap">{item.productCode}</td>
                        <td className="p-4 whitespace-nowrap">{item.company}</td>
                        <td className="p-4 text-secondary whitespace-nowrap">{item.branch}</td>
                        <td className="p-4 text-center font-mono whitespace-nowrap">{item.minStock}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className={`font-mono text-base font-bold ${item.lowStock ? 'text-red-600' : 'text-on-surface'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {item.stockStatus === 'OUT_OF_STOCK' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Agotado
                            </span>
                          ) : item.stockStatus === 'LOW_STOCK' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Stock Bajo
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                              Óptimo
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleViewKardex(item)}
                              className="px-2 py-1.5 bg-surface border border-outline-variant/30 text-xs font-bold rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              Kardex
                            </button>

                            <button
                              onClick={() => handleOutput(item)}
                              disabled={item.quantity <= 0}
                              className={`px-2 py-1.5 bg-surface border border-outline-variant/30 text-xs font-bold rounded transition-colors ${
                                item.quantity <= 0
                                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                                  : 'text-red-600 hover:bg-red-50 hover:border-red-200'
                              }`}
                            >
                              Baja
                            </button>

                            {item.lowStock && (
                              <button
                                onClick={() => handleReplenish(item)}
                                className="px-2 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" /> Reabastecer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-secondary">
                          No se encontraron registros de inventario.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" /> Kardex Reciente
              </h3>

              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-outline-variant/20">
                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Baja - Pérdida/Vencimiento</p>
                  <p className="text-[10px] text-secondary">Registrada mediante endpoint /api/inventory/output</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-red-600 bg-red-50 px-1 rounded">OUT</span>
                </div>

                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Transferencia</p>
                  <p className="text-[10px] text-secondary">Movimiento entre sucursales</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded">TRF</span>
                </div>

                <div className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-green-500 ring-4 ring-surface-container"></span>
                  <p className="text-xs font-bold text-on-surface">Lote Inicial</p>
                  <p className="text-[10px] text-secondary">Carga manual/importación CSV</p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-green-600 bg-green-50 px-1 rounded">IN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showKardexModal && selectedKardexItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Kardex de Inventario</h2>
                  <p className="text-sm text-secondary">
                    {selectedKardexItem.product} • {selectedKardexItem.company} • {selectedKardexItem.branch}
                  </p>
                </div>

                <button
                  onClick={() => setShowKardexModal(false)}
                  className="p-2 rounded bg-surface border border-outline-variant/20 text-secondary hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto border border-outline-variant/20 rounded-lg">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3 text-right">Movimiento</th>
                      <th className="p-3 text-right">Saldo</th>
                      <th className="p-3">Nota</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-outline-variant/10">
                    {kardexRows.length > 0 ? kardexRows.map((row: any) => (
                      <tr key={row.id} className="hover:bg-surface-container-high/30">
                        <td className="p-3 text-secondary">
                          {new Date(row.created_at).toLocaleString()}
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            row.movement_type === 'IN'
                              ? 'bg-green-100 text-green-700'
                              : row.movement_type === 'OUT'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {row.movement_type}
                          </span>
                        </td>

                        <td className={`p-3 text-right font-mono font-bold ${
                          Number(row.quantity_change) < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {Number(row.quantity_change) > 0 ? '+' : ''}
                          {row.quantity_change}
                        </td>

                        <td className="p-3 text-right font-mono font-bold">
                          {row.balance_after}
                        </td>

                        <td className="p-3 text-secondary">
                          {row.notes || 'Sin nota'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-secondary">
                          No existen movimientos de Kardex para este producto y sucursal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}