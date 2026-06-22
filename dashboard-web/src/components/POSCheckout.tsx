import { useState, useEffect } from 'react';
import { CreditCard, ShoppingCart, UserPlus, Check, Award, RefreshCw } from 'lucide-react';

type PosProduct = {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
};

export default function POSCheckout() {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [clientName, setClientName] = useState('Juanito Perez');
  const [clientNit, setClientNit] = useState('1234567');

  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const [showReceipt, setShowReceipt] = useState(false);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCatalogs = async () => {
    setLoading(true);

    try {
      const [bData, pData] = await Promise.all([
        fetch('http://localhost:3000/api/branches').then(r => r.json()).catch(() => []),
        fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => [])
      ]);

      if (bData.length) {
        setBranches(bData);
        setBranch((current) => current || bData[0].id);
      }

      if (pData.length) {
        const activeProducts = pData
          .filter((p: any) => p.status === 'ACTIVE')
          .map((p: any) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            price: Number(p.sale_price ?? p.price) || 0,
            stock: 999
          }));

        setProducts(activeProducts);

        setCart(prev => prev.filter(item =>
          activeProducts.some((p: PosProduct) => p.id === item.id)
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const addToCart = (prod: PosProduct) => {
    if (prod.price <= 0) {
      alert('El producto no tiene precio válido.');
      return;
    }

    setCart(prev => {
      const exists = prev.find(p => p.id === prod.id);

      if (exists) {
        return prev.map(p =>
          p.id === prod.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { id: prod.id, name: prod.name, price: prod.price, quantity: 1 }];
    });
  };

  const addDemoUnits = () => {
    const prod = products[0];

    if (!prod) {
      alert('No hay productos activos disponibles para la demo.');
      return;
    }

    setCart([{ id: prod.id, name: prod.name, price: prod.price, quantity: 2 }]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    if (!branch) {
      alert('Debe seleccionar una sucursal.');
      return;
    }

    if (!clientName.trim() || !clientNit.trim()) {
      alert('Debe completar el cliente y NIT/CI.');
      return;
    }

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        tax_rate: 0.13
      }));

      const res = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branch,
          customer_id: null,
          user_id: null,
          items,
          payment_method: paymentMethod
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        alert(error?.message || 'No se pudo procesar la venta. Verifique stock.');
        return;
      }
    } catch (e) {
      alert('Backend no disponible para ventas.');
      return;
    }

    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setCart([]);
    loadCatalogs();
  };

  return (
    <div className="flex-1 flex flex-col bg-surface dark:bg-surface-dark overflow-hidden">

      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 shrink-0 flex gap-3 items-start m-6 mb-0 rounded-r-lg">
        <CreditCard className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <p className="text-green-800 dark:text-green-300 font-medium text-sm">
          Sales Service: venta con productos activos, validación de cliente, método de pago, generación de comprobante y asignación simulada de puntos.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        <section className="flex-1 flex flex-col bg-surface-container rounded-xl border border-outline-variant/20 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-on-surface">Productos Disponibles</h2>

            <button
              onClick={loadCatalogs}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-secondary">
              No hay productos activos disponibles para vender.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 no-scrollbar">
              {products.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-surface border border-outline-variant/20 p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-on-surface">{p.name}</h3>
                    <p className="text-xs text-secondary font-mono mt-1">{p.code}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-bold text-primary">Bs {p.price.toFixed(2)}</span>
                    <span className="text-xs font-medium bg-surface-container-high px-2 py-0.5 rounded text-secondary">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-outline-variant/10">
            <button
              onClick={addDemoUnits}
              className="text-sm font-bold text-primary hover:underline"
            >
              Cargar Demo (2x primer producto activo)
            </button>
          </div>
        </section>

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
                    <option key={b.id} value={b.id}>
                      {b.company_name ? `${b.company_name} - ${b.name}` : b.name}
                    </option>
                  )) : (
                    <option value="">Sin sucursales</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">Cliente</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">NIT/CI</label>
                  <input
                    type="text"
                    value={clientNit}
                    onChange={e => setClientNit(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm"
                  />
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
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
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
                    className={`py-1.5 text-xs font-bold rounded border ${
                      paymentMethod === m
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface text-secondary border-outline-variant/20 hover:bg-surface-container'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcessSale}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? 'bg-outline-variant/20 text-secondary cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:bg-primary/90 transition-colors'
              }`}
            >
              Procesar Venta
            </button>
          </div>
        </section>
      </div>

      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">Venta Exitosa</h2>
              <p className="text-sm text-secondary">Comprobante #FAC-9921</p>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-outline-variant/10 text-sm mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Cliente:</span>
                <span className="font-bold text-on-surface">{clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">NIT/CI:</span>
                <span className="font-bold text-on-surface">{clientNit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Método:</span>
                <span className="font-bold text-on-surface">{paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/10 pt-2">
                <span className="text-secondary">Total Pagado:</span>
                <span className="font-bold text-primary">Bs {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-300">Puntos Asignados</p>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  {clientName} ganó {Math.floor(total)} puntos
                </p>
              </div>
            </div>

            <button
              onClick={closeReceipt}
              className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}