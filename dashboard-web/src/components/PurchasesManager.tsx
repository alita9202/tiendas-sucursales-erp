import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PurchasesManagerProps {
  products: Product[];
  updateProductStock: (id: string, newStock: number) => void;
  addLog: (log: any) => void;
  addAccountItem: (item: any) => void;
}

export default function PurchasesManager({
  products,
  updateProductStock,
  addLog,
  addAccountItem,
}: PurchasesManagerProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [supplier, setSupplier] = useState('Pil Andina S.A.');
  const [purchaseMethod, setPurchaseMethod] = useState<'cash' | 'credit'>('cash');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const totalAmount = product.price * 0.7 * quantity; // Purchase cost is 70% of retail price
    const newStock = product.stock + quantity;

    // 1. Update stock
    updateProductStock(product.id, newStock);

    // 2. Add log
    addLog({
      id: `LOG-${Date.now()}`,
      type: 'recepcion',
      message: `Compra de Stock: ${quantity} unidades de ${product.name}`,
      details: `Proveedor: ${supplier} - Método: ${purchaseMethod === 'cash' ? 'Contado' : 'Crédito'}`,
      amount: -totalAmount,
      date: new Date().toISOString(),
    });

    // 3. If credit, add to Accounts Payable (Cuentas por Pagar)
    if (purchaseMethod === 'credit') {
      addAccountItem({
        id: `AP-${Date.now()}`,
        type: 'payable',
        entityName: supplier,
        description: `Compra de stock: ${quantity}x ${product.name}`,
        amount: totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
        status: 'pending',
      });
    }

    setSuccessMsg(`Compra registrada con éxito. Se añadieron ${quantity} unidades a ${product.name}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background flex flex-col gap-6 text-on-surface">
      <div>
        <h1 className="text-3xl font-headline font-bold text-on-surface">Gestión de Compras (Abastecimiento)</h1>
        <p className="text-on-surface-variant opacity-70 mt-1">Registra la adquisición de mercadería de proveedores para reponer inventario.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase Form */}
        <div className="lg:col-span-2 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-bold font-headline">Nueva Orden de Compra</h2>
          
          <form onSubmit={handlePurchase} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-70">Producto a Comprar</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock Actual: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-70">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-surface-container p-3 rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-70">Proveedor</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-70">Forma de Pago</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-surface-container px-4 py-3 rounded-lg border border-outline-variant/10 flex-1 justify-center">
                  <input
                    type="radio"
                    name="method"
                    checked={purchaseMethod === 'cash'}
                    onChange={() => setPurchaseMethod('cash')}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">Contado (Efectivo/Banco)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-surface-container px-4 py-3 rounded-lg border border-outline-variant/10 flex-1 justify-center">
                  <input
                    type="radio"
                    name="method"
                    checked={purchaseMethod === 'credit'}
                    onChange={() => setPurchaseMethod('credit')}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">Crédito (Cuentas por Pagar)</span>
                </label>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-surface-container-high/40 p-4 rounded-lg flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Precio Unitario de Venta:</span>
                  <span className="font-semibold">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Costo Estimado de Compra (70%):</span>
                  <span className="font-semibold">${(selectedProduct.price * 0.7).toFixed(2)}</span>
                </div>
                <div className="border-t border-outline-variant/20 my-1"></div>
                <div className="flex justify-between text-base font-bold text-primary">
                  <span>Monto Total a Pagar:</span>
                  <span>${(selectedProduct.price * 0.7 * quantity).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart size={16} />
              Confirmar Recepción de Compra
            </button>
          </form>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-lg flex items-center gap-3 text-sm"
            >
              <Check size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </div>

        {/* Current stock status */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-bold font-headline">Estado Crítico de Stock</h2>
          <p className="text-xs opacity-70">Productos sugeridos para reabastecimiento debido a bajo inventario.</p>

          <div className="flex flex-col gap-3">
            {products
              .filter((p) => p.stock < p.maxStock * 0.3)
              .map((p) => (
                <div key={p.id} className="p-3 bg-surface-container-high/60 rounded-lg flex flex-col gap-1 border-l-4 border-rose-500">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="truncate max-w-[150px]">{p.name}</span>
                    <span className="text-rose-500">{p.stock} U.</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-70">
                    <span>Mínimo Recomendado:</span>
                    <span>{Math.round(p.maxStock * 0.3)} U.</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setQuantity(Math.max(1, p.maxStock - p.stock));
                    }}
                    className="text-xs text-primary font-bold text-left mt-2 hover:underline cursor-pointer"
                  >
                    Cargar en Orden
                  </button>
                </div>
              ))}
            {products.filter((p) => p.stock < p.maxStock * 0.3).length === 0 && (
              <div className="p-4 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm justify-center">
                <Check size={16} />
                <span>Todos los stocks están correctos</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
