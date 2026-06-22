import { useState, useEffect, useCallback } from 'react';
import { CreditCard, ShoppingCart, UserPlus, Check, Award, ListOrdered, ArrowLeft } from 'lucide-react';
import { createSale, getReceipt, getSales } from '../services/sales';
import type { CreateSalePayload, ReceiptResponse, Sale } from '../types';

export default function POSCheckout() {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [clientName, setClientName] = useState('Juanito Perez');
  const [clientNit, setClientNit] = useState('1234567');
  
  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState('b0000000-0000-0000-0000-000000000001');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptResponse | null>(null);
  const [view, setView] = useState<'pos' | 'list'>('pos');
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [products, setProducts] = useState([
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'Leche Pil 980cc', price: 18.50, stock: 100 },
    { id: 'a0000000-0000-0000-0000-000000000003', name: 'Mayonesa Cris', price: 2.00, stock: 120 }
  ]);

  useEffect(() => {
    Promise.all([
      fetch('/api/branches').then(r => r.json()).catch(() => []),
      fetch('/api/products').then(r => r.json()).catch(() => [])
    ]).then(([bData, pData]) => {
      if (bData.length) {
        setBranches(bData);
        setBranch(bData[0].id);
      }
      if (pData.length) {
        setProducts(pData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          stock: 999
        })));
      }
    });
  }, []);

  const addToCart = (prod: any) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === prod.id);
      if (exists) {
        return prev.map(p => p.id === prod.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const addDemoUnits = () => {
    const prod = products[0];
    setCart([{ id: prod.id, name: prod.name, price: prod.price, quantity: 2 }]);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Simplicado sin IVA separado para la demo

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    try {
      const receiptNumber = `FAC-${Date.now().toString(36).toUpperCase()}`;
      const payload: CreateSalePayload = {
        branch_id: branch,
        customer_id: 'c0000000-0000-0000-0000-000000000001',
        customer_name: clientName,
        customer_nit: clientNit,
        receipt_number: receiptNumber,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };
      const sale = await createSale(payload);
      const receipt = await getReceipt(sale.id);
      setReceiptData(receipt);
      setShowReceipt(true);
    } catch (e) {
      console.warn('Backend no disponible para ventas', e);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setCart([]);
  };

  const loadSales = useCallback(async () => {
    try {
      const data = await getSales();
      setSalesList(data);
    } catch { /* ignore */ }
  }, []);

  const viewReceipt = async (id: string) => {
    try {
      const receipt = await getReceipt(id);
      setReceiptData(receipt);
      setShowReceipt(true);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface dark:bg-surface-dark overflow-hidden">
      
      {/* Header con toggle */}
      <div className="flex items-center justify-between m-6 mb-0 shrink-0">
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 flex-1 rounded-r-lg flex gap-3 items-start">
          <CreditCard className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Integrado con Sales Service (ms-ventas-facturacion).
          </p>
        </div>
        <button
          onClick={() => {
            if (view === 'list') {
              setView('pos');
            } else {
              loadSales();
              setView('list');
            }
          }}
          className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high transition-colors shrink-0"
        >
          {view === 'list' ? <><ArrowLeft className="w-4 h-4" /> POS</> : <><ListOrdered className="w-4 h-4" /> Ventas</>}
        </button>
      </div>

      {view === 'list' ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-on-surface mb-4">Historial de Ventas</h2>
          {salesList.length === 0 ? (
            <p className="text-secondary text-sm">No hay ventas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-secondary text-xs uppercase">
                    <th className="text-left py-3 px-2 font-bold">Comprobante</th>
                    <th className="text-left py-3 px-2 font-bold">Items</th>
                    <th className="text-right py-3 px-2 font-bold">Total</th>
                    <th className="text-left py-3 px-2 font-bold">Método</th>
                    <th className="text-left py-3 px-2 font-bold">Fecha</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {salesList.map((sale) => (
                    <tr key={sale.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50">
                      <td className="py-3 px-2 font-bold text-on-surface">{sale.receipt_number}</td>
                      <td className="py-3 px-2 text-secondary">{sale.items.length} producto(s)</td>
                      <td className="py-3 px-2 text-right font-bold text-primary">Bs {Number(sale.total_amount).toFixed(2)}</td>
                      <td className="py-3 px-2 text-secondary">{sale.payment_method}</td>
                      <td className="py-3 px-2 text-secondary">{new Date(sale.sale_date).toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <button onClick={() => viewReceipt(sale.id)} className="text-xs font-bold text-primary hover:underline">Recibo</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (<>
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        {/* Left: Product Grid */}
        <section className="flex-1 flex flex-col bg-surface-container rounded-xl border border-outline-variant/20 p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-on-surface mb-4">Productos Disponibles</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 no-scrollbar">
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="bg-surface border border-outline-variant/20 p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-on-surface">{p.name}</h3>
                  <p className="text-xs text-secondary font-mono mt-1">{p.id}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-primary">Bs {p.price.toFixed(2)}</span>
                  <span className="text-xs font-medium bg-surface-container-high px-2 py-0.5 rounded text-secondary">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/10">
            <button 
              onClick={addDemoUnits}
              className="text-sm font-bold text-primary hover:underline"
            >
              Cargar Demo (2x Leche Pil)
            </button>
          </div>
        </section>

        {/* Right: Cart */}
        <section className="w-full lg:w-96 flex flex-col bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden shrink-0">
          <div className="p-4 bg-surface-container-high/30 border-b border-outline-variant/10">
            <h2 className="font-bold text-on-surface text-lg flex items-center justify-between">
              Venta
              <UserPlus className="w-5 h-5 text-primary" />
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-secondary uppercase block mb-1">Sucursal</label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm"
                >
                  {branches.length > 0 ? branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  )) : (
                    <>
                      <option value="b0000000-0000-0000-0000-000000000001">OXXO Prado (Mock)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">Cliente</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">NIT/CI</label>
                  <input type="text" value={clientNit} onChange={e => setClientNit(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary opacity-50">
                <ShoppingCart className="w-10 h-10 mb-2" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface p-2 rounded border border-outline-variant/10">
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.name}</p>
                      <p className="text-xs text-secondary">{item.quantity} x Bs {item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-primary">Bs {(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-surface-container-high/30 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-on-surface">Total</span>
              <span className="font-bold text-2xl text-primary">Bs {total.toFixed(2)}</span>
            </div>
            
            <div className="mb-4">
              <label className="text-xs font-bold text-secondary uppercase block mb-2">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Tarjeta', 'QR'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 text-xs font-bold rounded border ${paymentMethod === m ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-secondary border-outline-variant/20 hover:bg-surface-container'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleProcessSale}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-outline-variant/20 text-secondary cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90 transition-colors'}`}
            >
              Procesar Venta
            </button>
          </div>
        </section>
      </div>
      </>)}

        {/* Modal Comprobante */}
        {showReceipt && receiptData && (
        <div id="receipt-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="receipt-content" className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 print-hidden">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">Venta Exitosa</h2>
              <p className="text-sm text-secondary">Comprobante {receiptData.receipt_number}</p>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-outline-variant/10 text-sm mb-4 space-y-2">
              <div className="flex justify-between"><span className="text-secondary">Cliente:</span><span className="font-bold text-on-surface">{receiptData.customer_name || clientName}</span></div>
              <div className="flex justify-between"><span className="text-secondary">NIT/CI:</span><span className="font-bold text-on-surface">{receiptData.customer_nit || clientNit}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Método:</span><span className="font-bold text-on-surface">{receiptData.payment_method}</span></div>
              {receiptData.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs"><span className="text-secondary">{item.quantity}x Prod. {item.product_id.slice(0,8)}</span><span className="text-on-surface">Bs {item.subtotal.toFixed(2)}</span></div>
              ))}
              <div className="flex justify-between border-t border-outline-variant/10 pt-2"><span className="text-secondary">Subtotal:</span><span className="font-bold text-on-surface">Bs {receiptData.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-secondary">IVA ({(receiptData.tax_rate * 100).toFixed(0)}%):</span><span className="text-on-surface">Bs {receiptData.tax_amount.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-outline-variant/20 pt-2"><span className="text-secondary font-bold">Total Pagado:</span><span className="font-bold text-primary text-lg">Bs {receiptData.total.toFixed(2)}</span></div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 flex items-center gap-3 mb-6 print-hidden">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-300">Puntos Asignados</p>
                <p className="text-xs text-purple-700 dark:text-purple-400">{receiptData.customer_name || clientName} ganó {Math.floor(receiptData.total)} puntos</p>
              </div>
            </div>

            <div className="flex gap-2 print-hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-surface-container border border-outline-variant/20 text-on-surface rounded-lg font-bold hover:bg-surface-container-high"
              >
                Imprimir
              </button>
              <button
                onClick={() => window.open(`/api/sales/${receiptData.sale_id}/receipt/pdf`, '_blank')}
                className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90"
              >
                Descargar PDF
              </button>
              <button
                onClick={closeReceipt}
                className="flex-1 py-2 bg-outline-variant/20 text-on-surface rounded-lg font-bold hover:bg-outline-variant/30"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
