import { useState, useMemo, FormEvent } from 'react';
import { Product, ArchivalLog } from '../types';
import { Plus, Minus, ArrowRightLeft, FileDown, SlidersHorizontal, AlertTriangle, BadgeDollarSign, AppWindow, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProdId, setTransferProdId] = useState('');
  const [transferAmount, setTransferAmount] = useState(10);
  const [fromWarehouse, setFromWarehouse] = useState('Almacén Central');
  const [toWarehouse, setToWarehouse] = useState('Sucursal Norte');

  // Edit stock inline modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStockInput, setEditStockInput] = useState<number>(0);

  // Pagination & filter
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('Todas');
  const itemsPerPage = 5;

  // Dynamically computed metrics
  const activeProductsCount = products.length;

  const lowStockAlertsCount = useMemo(() => {
    return products.filter((p) => p.stock <= 4).length;
  }, [products]);

  const warehouseValueStr = useMemo(() => {
    const totalVal = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    if (totalVal >= 1000000) {
      return `$${(totalVal / 1000000).toFixed(1)}M`;
    }
    return `$${totalVal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [products]);

  const categories = useMemo(() => {
    return ['Todas', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  // Filtered/Paginated products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedFilterCategory === 'Todas') return true;
      return p.category === selectedFilterCategory;
    });
  }, [products, selectedFilterCategory]);

  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Trigger reorder suggestion simulator
  const handleAutoReorder = () => {
    // Find low stock items
    const lowStockItems = products.filter((p) => p.stock <= 4);
    if (lowStockItems.length === 0) {
      alert("No hay productos con stock crítico en este momento.");
      return;
    }

    lowStockItems.forEach((p) => {
      const addedQuantity = p.maxStock - p.stock;
      updateProductStock(p.id, p.maxStock);
      
      addLog({
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'recepcion',
        message: `Auto-Reabastecimiento: +${addedQuantity} Unidades de ${p.name}`,
        details: `Generado mediante Sugerencia de Optimización - Stock restaurado al máximo`,
        amount: addedQuantity * p.price,
        date: new Date().toISOString(),
      });
    });

    alert("¡Sugerencia procesada! Las existencias de productos críticos han sido restablecidas exitosamente.");
  };

  // Process Stock Transfer
  const handleProcessTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!transferProdId) return;

    const prod = products.find((p) => p.id === transferProdId);
    if (!prod) return;

    if (prod.stock < transferAmount) {
      alert(`No hay stock suficiente. Máximo disponible: ${prod.stock}`);
      return;
    }

    // Deduct from current stock
    updateProductStock(prod.id, prod.stock - transferAmount);

    // Create log
    addLog({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      type: 'despacho',
      message: `Despacho: Transferencia de stock de ${prod.name}`,
      details: `${fromWarehouse} → ${toWarehouse} (${transferAmount} unds.)`,
      date: new Date().toISOString(),
    });

    setShowTransferModal(false);
    setTransferProdId('');
    setTransferAmount(10);
    alert('Transferencia de stock registrada con éxito.');
  };

  // Edit stock save
  const handleSaveStockEdit = (e: FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductStock(editingProduct.id, editStockInput);
      
      addLog({
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'auditoria',
        message: `Ajuste manual: ${editingProduct.name}`,
        details: `Stock actualizado de ${editingProduct.stock} a ${editStockInput}`,
        date: new Date().toISOString(),
      });

      setEditingProduct(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar pb-16">
      
      {/* Page Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface">Gestor de Inventario</h2>
          <p className="text-on-surface-variant mt-2 font-body max-w-lg text-sm opacity-80 leading-relaxed">
            Supervisión integral de existencias, flujos logísticos y valorización de activos en tiempo real.
          </p>
        </div>
        <button
          onClick={() => {
            if (products.length > 0) setTransferProdId(products[0].id);
            setShowTransferModal(true);
          }}
          className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-xl font-label font-bold text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer uppercase shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transferencia de Stock
        </button>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Products metric */}
        <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between group hover:bg-surface-container transition-colors relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="relative z-10">
            <span className="font-label text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">
              Productos Activos
            </span>
            <h3 className="text-4xl font-headline font-bold text-on-surface mt-2">{activeProductsCount}</h3>
          </div>
          <div className="mt-8 flex items-center text-primary gap-2 font-body text-xs font-semibold">
            <span>+2.4% este mes</span>
          </div>
          <BadgeDollarSign className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
        </div>

        {/* Low Stock Alerts metric (Turns warning orange/red when alerts exist) */}
        <div className={`p-8 rounded-2xl flex flex-col justify-between group transition-colors border relative overflow-hidden shadow-sm ${
          lowStockAlertsCount > 0
            ? 'bg-error-container/30 border-error/10 text-on-error-container'
            : 'bg-surface-container-low border-outline-variant/10 text-on-surface'
        }`}>
          <div className="relative z-10">
            <span className={`font-label text-[10px] font-bold tracking-widest uppercase block mb-1 ${
              lowStockAlertsCount > 0 ? 'text-error' : 'text-primary'
            }`}>
              Alertas de Stock Bajo
            </span>
            <h3 className="text-4xl font-headline font-bold mt-2">{lowStockAlertsCount}</h3>
          </div>
          <div className={`mt-8 flex items-center gap-2 font-body text-xs font-semibold ${
            lowStockAlertsCount > 0 ? 'text-error animate-pulse' : 'text-on-surface-variant'
          }`}>
            {lowStockAlertsCount > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 fill-error/10" />
                <span>Acción requerida inmediata</span>
              </>
            ) : (
              <span>Nivel óptimo general</span>
            )}
          </div>
          <AlertTriangle className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-error" />
        </div>

        {/* Value in Warehouse metric */}
        <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between group hover:bg-surface-container transition-colors relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="relative z-10">
            <span className="font-label text-[10px] font-bold text-tertiary tracking-widest uppercase block mb-1">
              Valor en Almacén
            </span>
            <h3 className="text-4xl font-headline font-bold text-on-surface mt-2">{warehouseValueStr}</h3>
          </div>
          <div className="mt-8 flex items-center text-tertiary gap-2 font-body text-xs font-semibold">
            <span>Valorización auditada</span>
          </div>
          <BadgeDollarSign className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-tertiary" />
        </div>
      </div>

      {/* Inventory Master Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md border border-outline-variant/15">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h4 className="font-headline text-lg font-bold text-on-surface">Inventario Maestro</h4>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            
            {/* Category filter selects */}
            <select
              value={selectedFilterCategory}
              onChange={(e) => {
                setSelectedFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface-container text-xs font-label font-bold text-secondary border-none rounded-lg px-4 py-2 cursor-pointer hover:bg-surface-container-high transition-colors text-left"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'Todas' ? 'Filtrar Categoría' : c}</option>
              ))}
            </select>

            <button
              onClick={() => alert('Exportando inventario actual en formato CSV...')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-label font-bold text-secondary cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Responsive Table overflow */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr className="border-b border-outline-variant/10">
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63]">ID</th>
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63]">Nombre del Producto</th>
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63]">Categoría</th>
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63]">Stock</th>
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63]">Atributos Dinámicos</th>
                <th className="px-8 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#5a5f63] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body text-xs">
              {paginatedProducts.map((p) => {
                const isCriticallyLow = p.stock <= 4;
                const ratio = Math.min((p.stock / p.maxStock) * 100, 100);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-surface-bright transition-colors group ${
                      isCriticallyLow ? 'bg-error-container/5 hover:bg-error-container/10' : ''
                    }`}
                  >
                    <td className="px-8 py-5 text-secondary font-mono">{p.id}</td>
                    <td className="px-8 py-5">
                      <div className="font-semibold text-on-surface text-xs">{p.name}</div>
                      <div className="text-[10px] text-on-surface-variant opacity-70 mt-0.5 max-w-xs truncate">{p.description}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${
                        p.category === 'Electrónica'
                          ? 'bg-primary-container/10 text-primary'
                          : p.category === 'Accesorios'
                          ? 'bg-tertiary-container/10 text-tertiary'
                          : 'bg-neutral-200/50 text-[#5a5f63]'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              isCriticallyLow ? 'bg-error animate-pulse' : 'bg-primary'
                            }`}
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${isCriticallyLow ? 'text-error' : 'text-on-surface'}`}>
                          {p.stock}
                        </span>
                        <span className="text-[10px] text-on-surface-variant opacity-60">/ {p.maxStock} max</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {p.serial ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-[#6d5e00] font-bold uppercase tracking-wider">Número de Serie</span>
                          <span className="font-mono text-[10px] text-on-surface-variant">{p.serial}</span>
                        </div>
                      ) : p.expiration ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-error font-bold uppercase tracking-wider">Vencimiento</span>
                          <span className="font-mono text-[10px] text-on-surface-variant">{p.expiration}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant opacity-50">-</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right font-label font-bold text-xs">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setEditStockInput(p.stock);
                        }}
                        className="p-1 px-2.5 rounded hover:bg-primary/10 text-primary hover:scale-[1.04] transition-all cursor-pointer flex items-center justify-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Master Table Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center text-[11px] font-label font-bold text-secondary uppercase">
            <span>
              Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 rounded border border-outline-variant/30 hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border border-outline-variant/30 cursor-pointer ${
                    currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-surface-container'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 rounded border border-outline-variant/30 hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Operational Insights (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 shrink-0">
        
        {/* Recent warehouse operations log timeline */}
        <section className="lg:col-span-8 bg-surface-container-high/25 border border-outline-variant/10 rounded-2xl p-8 overflow-hidden relative group shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h4 className="font-headline text-lg font-bold text-on-surface">Flujo de Almacén Reciente</h4>
              <p className="font-body text-xs text-on-surface-variant mt-1">Monitoreo de entradas y salidas de las últimas 24 horas.</p>
            </div>
          </div>

          <div className="mt-8 space-y-5 relative z-10 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {logs.slice(0, 4).map((log) => {
              const sign = log.type === 'recepcion' ? '+' : log.type === 'despacho' ? '-' : '';

              return (
                <div key={log.id} className="flex items-center gap-4 border-b border-outline-variant/5 pb-3 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.type === 'recepcion' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                  }`}>
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-on-surface leading-tight">{log.message}</p>
                    <p className="text-[10px] text-on-surface-variant opacity-70 mt-1">{log.details}</p>
                  </div>
                  <div className="text-right">
                    {log.amount && (
                      <p className={`font-mono text-xs font-bold ${
                        log.type === 'recepcion' ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {sign} ${log.amount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-[9px] text-[#c2c7cc] mt-0.5">
                      {new Date(log.date).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Atmospheric background */}
          <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none opacity-20">
            <div className="w-full h-full bg-gradient-to-bl from-primary/10 to-transparent"></div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          {/* Suggestions card */}
          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <span className="font-label text-[9px] font-bold text-on-surface-variant opacity-75 uppercase tracking-widest block">
              Optimización
            </span>
            <h4 className="font-headline text-base font-bold text-on-surface mt-1 leading-tight">
              Sugerencia de Reabastecimiento
            </h4>
            <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed opacity-85">
              Basado en tendencias de ventas, se recomienda adelantar el reabastecimiento general para evitar quiebres de stock en el cierre trimestral.
            </p>
            <button
              onClick={handleAutoReorder}
              className="mt-4 w-full py-2.5 bg-surface-container-high border border-primary text-primary font-label text-[10px] font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all rounded-xl cursor-pointer"
            >
              Generar Orden
            </button>
          </div>

          {/* Next Audit Alert card */}
          <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 relative overflow-hidden group shadow-sm">
            <h4 className="font-headline text-base font-bold relative z-10 text-white">Auditoría Q3 2024</h4>
            <p className="font-body text-xs mt-1.5 opacity-80 relative z-10 text-white/90">
              Próximo conteo físico programado para el 15 de Octubre.
            </p>
            <AppWindow className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10 group-hover:scale-105 transition-transform" />
          </div>
        </section>
      </div>

      {/* MODAL 1: Stock Transfer trigger */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20"
            >
              <div className="flex items-center gap-2 text-primary mb-2">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="font-headline font-bold text-lg text-on-surface">Registrar Transferencia Interna</h3>
              </div>
              <p className="text-xs text-on-surface-variant opacity-80 font-body mb-5 leading-relaxed">
                Configure la transferencia de existencias entre dependencias. Esto reducirá el stock disponible en el origen y registrará una bitácora.
              </p>

              <form onSubmit={handleProcessTransfer} className="space-y-4">
                <div>
                  <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                    Seleccionar Producto
                  </label>
                  <select
                    value={transferProdId}
                    onChange={(e) => setTransferProdId(e.target.value)}
                    className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Disponible: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                      Origen
                    </label>
                    <select
                      value={fromWarehouse}
                      onChange={(e) => setFromWarehouse(e.target.value)}
                      className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    >
                      <option value="Almacén Central">Almacén Central</option>
                      <option value="Sucursal Norte">Sucursal Norte</option>
                      <option value="Depósito Secundario">Depósito Secundario</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                      Destino
                    </label>
                    <select
                      value={toWarehouse}
                      onChange={(e) => setToWarehouse(e.target.value)}
                      className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    >
                      <option value="Sucursal Norte">Sucursal Norte</option>
                      <option value="Almacén Central">Almacén Central</option>
                      <option value="Depósito Secundario">Depósito Secundario</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                    Cantidad a Transferir
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 hover:bg-surface-container-high rounded-lg text-xs font-semibold font-label uppercase tracking-widest text-on-surface-variant cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold font-label uppercase tracking-widest cursor-pointer shadow-md shadow-primary/20 hover:opacity-95"
                  >
                    Ejecutar Transferencia
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Adjust Stock Dialog */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/20"
            >
              <h3 className="font-headline font-bold text-base text-on-surface mb-1">
                Ajustar existencias físicas
              </h3>
              <p className="text-[11px] font-body text-on-surface-variant opacity-80 mb-4 truncate">
                {editingProduct.name}
              </p>

              <form onSubmit={handleSaveStockEdit} className="space-y-4">
                <div className="bg-surface-container p-4 rounded-xl flex items-center gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setEditStockInput(Math.max(0, editStockInput - 1))}
                    className="p-1 px-3 bg-white rounded-lg border border-outline-variant/30 font-bold hover:bg-neutral-50 shadow-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStockInput}
                    onChange={(e) => setEditStockInput(Number(e.target.value))}
                    className="font-mono text-lg font-bold text-center w-20 bg-transparent border-b-2 border-primary outline-none focus:ring-0 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditStockInput(Math.min(editingProduct.maxStock, editStockInput + 1))}
                    className="p-1 px-3 bg-white rounded-lg border border-outline-variant/30 font-bold hover:bg-neutral-50 shadow-sm"
                  >
                    +
                  </button>
                </div>

                <p className="text-[10px] text-center text-on-surface-variant opacity-75 font-label uppercase">
                  Capacidad máxima permitida: {editingProduct.maxStock}
                </p>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 hover:bg-surface-container-high rounded-lg text-xs font-semibold font-label uppercase tracking-widest text-on-surface-variant cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold font-label tracking-widest uppercase cursor-pointer shadow-md shadow-primary/20 hover:opacity-95"
                  >
                    Aplicar Ajuste
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
