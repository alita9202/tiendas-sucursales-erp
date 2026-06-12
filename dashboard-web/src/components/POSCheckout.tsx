import { useState, useMemo, FormEvent } from 'react';
import { Product, CartItem, Transaction, ArchivalLog } from '../types';
import { Plus, Minus, UserPlus, ShoppingCart, Check, CreditCard, QrCode, ClipboardList, Wallet, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface POSCheckoutProps {
  products: Product[];
  updateProductStock: (id: string, newStock: number) => void;
  addTransaction: (tx: Transaction) => void;
  addLog: (log: ArchivalLog) => void;
  searchQuery: string;
}

export default function POSCheckout({
  products,
  updateProductStock,
  addTransaction,
  addLog,
  searchQuery,
}: POSCheckoutProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState<string>('Consumidor Final');
  const [clientNit, setClientNit] = useState<string>('99001');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'QR' | 'Crédito'>('Efectivo');
  
  // Modals state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [justProcessedTx, setJustProcessedTx] = useState<Transaction | null>(null);

  // New Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientNit, setNewClientNit] = useState('');

  // Categories list
  const categories = ['Todos', 'Electrónica', 'Accesorios', 'Hogar'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory = selectedCategory === 'Todos' || prod.category === selectedCategory;
      const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // limit to available stock
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  // Cart Subtotal & Total calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const tax = useMemo(() => {
    return subtotal * 0.13; // 13% IVA
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // Save new client
  const handleCreateClient = (e: FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      setClientName(newClientName);
      setClientNit(newClientNit || '99001');
      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientNit('');
    }
  };

  // Process transaction
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Check stock for all items
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        alert(`Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}`);
        return;
      }
    }

    // Deduct stock
    cart.forEach((item) => {
      updateProductStock(item.product.id, item.product.stock - item.quantity);
    });

    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      id: txId,
      client: clientName,
      company: clientName === 'Consumidor Final' ? 'Individual' : 'Cliente Corporativo',
      branch: 'Sucursal Central',
      amount: total,
      method: paymentMethod,
      status: 'Completado',
      date: new Date().toISOString(),
    };

    // Add logging and transactions
    addTransaction(newTx);
    
    // Create detailed archival log
    const productsString = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
    const newLog: ArchivalLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      type: 'venta',
      message: `Venta Procesada: ${txId}`,
      details: `${clientName} (NIT: ${clientNit}) - [${productsString}]`,
      amount: total,
      date: new Date().toISOString(),
    };
    addLog(newLog);

    // Save for Receipt modal
    setJustProcessedTx(newTx);
    setShowReceiptModal(true);

    // Reset shopping cart page variables but keep config
    setCart([]);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-surface-container-lowest overflow-hidden">
      
      {/* Left: Product Grid Section */}
      <section className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* Category filtering chips */}
        <div className="flex items-center justify-between mb-6 shrink-0 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-label font-semibold text-xs tracking-wide transition-all z-10 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-105'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5 text-on-surface-variant/70 text-xs font-label font-semibold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>Ordenar por Popularidad</span>
          </div>
        </div>

        {/* Dynamic Products Grid with Animating Entries */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar pb-6">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <ShoppingCart className="w-12 h-12 text-outline-variant/40 mb-3" />
              <p className="font-headline text-lg font-bold text-on-surface">No se encontraron productos</p>
              <p className="text-sm font-body text-on-surface-variant opacity-70 mt-1 max-w-xs">
                Pruebe cambiando de categoría o ajustando el criterio de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.stock <= 4;
                const outOfStock = prod.stock === 0;

                return (
                  <motion.div
                    key={prod.id}
                    layoutId={`prod-card-${prod.id}`}
                    className={`group bg-surface-container-low rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-surface-container-high active:scale-[0.98] flex flex-col relative border border-outline-variant/10`}
                    onClick={() => !outOfStock && addToCart(prod)}
                  >
                    {/* Image Area */}
                    <div className="aspect-square relative overflow-hidden bg-white/50 flex items-center justify-center">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Stock badge */}
                      <span
                        className={`absolute top-2 right-2 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest font-label shadow-sm ${
                          outOfStock
                            ? 'bg-neutral-500 text-white'
                            : isLowStock
                            ? 'bg-error-container text-on-error-container font-extrabold animate-pulse'
                            : 'bg-tertiary-container text-on-tertiary-container'
                        }`}
                      >
                        {outOfStock ? 'Sin Stock' : `Stock: ${prod.stock}`}
                      </span>

                      {/* Overly subtle category hover icon */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-label font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </div>
                    </div>

                    {/* Descriptive Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline font-bold text-on-surface text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs font-body text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed opacity-85">
                          {prod.description}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between items-center pt-2 border-t border-outline-variant/10">
                        <span className="text-base font-headline font-semibold text-primary dark:text-primary-fixed-dim">
                          ${prod.price.toFixed(2)}
                        </span>
                        
                        <div className="bg-primary-container/10 group-hover:bg-primary group-hover:text-on-primary p-1.5 rounded-lg transition-all shadow-sm">
                          <Plus className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Right: Cart Panel Section */}
      <section className="w-full lg:w-[420px] bg-surface-container-low flex flex-col border-t lg:border-t-0 lg:border-l border-outline-variant/15 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.04)] justify-between">
        
        {/* Client Selection header */}
        <div className="p-6 bg-surface-container-high/40 border-b border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-on-surface text-base">Carrito de Venta</h2>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="text-primary font-label text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Nuevo Cliente
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 shadow-sm">
                <span className="text-[10px] text-on-surface-variant font-label block uppercase">Cliente</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="font-body text-xs font-semibold text-on-surface bg-transparent border-none outline-none p-0 mt-0.5 w-full focus:ring-0"
                  placeholder="Nombre Cliente"
                />
              </div>
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 shadow-sm">
                <span className="text-[10px] text-on-surface-variant font-label block uppercase">CI o NIT</span>
                <input
                  type="text"
                  value={clientNit}
                  onChange={(e) => setClientNit(e.target.value)}
                  className="font-body text-xs font-semibold text-on-surface bg-transparent border-none outline-none p-0 mt-0.5 w-full focus:ring-0"
                  placeholder="NIT/CI"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cart Item Row List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
              <ShoppingCart className="w-10 h-10 text-on-surface-variant/30 mb-2" />
              <p className="text-xs font-body font-semibold text-on-surface-variant">El carrito está vacío</p>
              <p className="text-[10px] font-label text-on-surface-variant opacity-80 mt-1">
                Presione un producto de la izquierda para agregarlo.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-outline-variant/10 relative"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-100 flex items-center justify-center">
                    <img
                      className="w-full h-full object-cover"
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-headline font-bold text-on-surface truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] font-label text-on-surface-variant opacity-80 mt-0.5">
                      ${item.product.price.toFixed(2)} c/u
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-surface-container rounded-lg px-2 py-1">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body font-semibold text-xs w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item.product)}
                        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-headline font-bold text-primary dark:text-primary-fixed-dim">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Checkout summary panel */}
        <div className="p-6 bg-surface-container-lowest shadow-[0_-10px_20px_rgba(0,0,0,0.01)] border-t border-outline-variant/10 space-y-4 shrink-0">
          
          <div className="space-y-2 border-b border-outline-variant/15 pb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-label">Subtotal</span>
              <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-label">IVA (13%)</span>
              <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="font-headline font-bold text-on-surface">Total</span>
              <span className="font-headline font-extrabold text-primary dark:text-primary-fixed-dim text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <span className="text-[10px] text-on-surface-variant font-label font-bold uppercase tracking-wider block mb-2">
              Método de Pago
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Efectivo', icon: Wallet },
                { id: 'Tarjeta', icon: CreditCard },
                { id: 'QR', icon: QrCode },
                { id: 'Crédito', icon: ClipboardList },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-highest'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-label font-bold uppercase tracking-widest">
                      {m.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Checkout Trigger Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0 ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Procesar Venta
          </button>
        </div>
      </section>

      {/* MODAL 1: Create Client Dialog */}
      <AnimatePresence>
        {showNewClientModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/20"
            >
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Nuevo Cliente</h3>
              <p className="text-xs text-on-surface-variant opacity-80 mb-4 font-body">
                Registre los detalles del cliente para fines de facturación y logs.
              </p>

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                    Nombre o Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-1">
                    NIT o CI del Cliente
                  </label>
                  <input
                    type="text"
                    value={newClientNit}
                    onChange={(e) => setNewClientNit(e.target.value)}
                    className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    placeholder="Ej. 10293848"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    className="px-4 py-2 hover:bg-surface-container-high rounded-lg text-xs font-semibold font-label uppercase tracking-widest text-on-surface-variant cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold font-label uppercase tracking-widest cursor-pointer shadow-md shadow-primary/10 hover:opacity-95"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Receipt Receipt Success View */}
      <AnimatePresence>
        {showReceiptModal && justProcessedTx && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-outline-variant/20 overflow-hidden"
            >
              {/* Confetti element */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>
              
              <div className="text-center pt-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Venta Completada</h3>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1 tracking-wider">
                  Código: {justProcessedTx.id}
                </p>
              </div>

              {/* Receipt details */}
              <div className="mt-6 bg-surface-container-low p-4 rounded-xl space-y-3 font-mono text-xs text-on-surface-variant/90 border border-outline-variant/10">
                <div className="flex justify-between">
                  <span>Sucursal:</span>
                  <span className="font-semibold text-on-surface">Central</span>
                </div>
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-semibold text-on-surface truncate max-w-[150px]">{justProcessedTx.client}</span>
                </div>
                <div className="flex justify-between">
                  <span>CI/NIT:</span>
                  <span className="font-semibold text-on-surface">{clientNit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de Pago:</span>
                  <span className="font-semibold text-on-surface">{justProcessedTx.method}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-outline-variant/40 pt-2.5 text-sm">
                  <span className="text-on-surface">Monto Pagado:</span>
                  <span className="font-bold text-primary">${justProcessedTx.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm tracking-wide shadow-md shadow-primary/25 hover:opacity-95 transition-all text-center cursor-pointer"
                >
                  Regresar al Punto de Venta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
