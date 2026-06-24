import { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CreditCard, ShoppingCart, UserPlus, Check, Award, ListOrdered, ArrowLeft } from 'lucide-react';
import { createSale, getReceipt, getSales } from '../services/sales';
import type { CreateSalePayload, ReceiptResponse, Sale } from '../types';

export default function POSCheckout() {
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content");
    if (!printContent) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => style.outerHTML)
        .join('');
        
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Imprimir Recibo</title>
            ${styles}
            <style>
              body { padding: 20px; font-family: sans-serif; background: white; color: black; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div style="max-width: 400px; margin: 0 auto; color: black;">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();
      
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    }
  };

  const handleDownloadPdf = () => {
    if (!receiptData) {
      alert("No hay comprobante para descargar.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 297],
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 10;

    const receiptNumber = receiptData.receipt_number || "SIN-RECIBO";
    const customerName = receiptData.customer_name || "Cliente";
    const customerDocument = receiptData.customer_nit || "";
    const paymentMethod = receiptData.payment_method || "Efectivo";
    const branchName = branches.find((b: any) => b.id === branch)?.name || "Sucursal";
    const total = Number(receiptData.total || 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(receiptData.company_name || "Compañía ERP", pageWidth / 2, cursorY, { align: "center" });
    
    cursorY += 6;
    doc.setFontSize(9);
    doc.text("COMPROBANTE DE VENTA", pageWidth / 2, cursorY, { align: "center" });

    cursorY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Nº ${receiptNumber}`, pageWidth / 2, cursorY, { align: "center" });
    
    cursorY += 5;
    doc.text(`Fecha: ${new Date().toLocaleString()}`, pageWidth / 2, cursorY, { align: "center" });
    
    cursorY += 5;
    doc.text(`Sucursal: ${branchName}`, pageWidth / 2, cursorY, { align: "center" });

    cursorY += 4;
    doc.setLineWidth(0.5);
    doc.line(5, cursorY, pageWidth - 5, cursorY);

    cursorY += 6;
    doc.setFontSize(9);
    doc.text(`Cliente: ${customerName}`, 5, cursorY);
    cursorY += 5;
    doc.text(`NIT/CI: ${customerDocument}`, 5, cursorY);
    cursorY += 5;
    doc.text(`Método: ${paymentMethod}`, 5, cursorY);

    cursorY += 4;
    doc.line(5, cursorY, pageWidth - 5, cursorY);

    const items = Array.isArray(receiptData.items) ? receiptData.items : cart;
    const tableRows = items.map((item: any) => {
      const quantity = Number(item.quantity || 0);
      const name = item.product_name || item.name || "Producto";
      const price = Number(item.unit_price ?? item.price ?? 0);
      const subtotal = Number(item.subtotal ?? quantity * price);
      return [
        String(quantity),
        name.substring(0, 15),
        `${price.toFixed(2)}`,
        `${subtotal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: cursorY + 2,
      head: [["Cant", "Prod", "P.Unit", "SubT"]],
      body: tableRows,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 1,
        font: "helvetica",
      },
      headStyles: {
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 15, halign: "right" },
        3: { cellWidth: 15, halign: "right" },
      },
      margin: { left: 5, right: 5 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || cursorY + 10;
    cursorY = finalY + 4;
    doc.line(5, cursorY, pageWidth - 5, cursorY);

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Pagado:", 5, cursorY);
    doc.text(`Bs ${total.toFixed(2)}`, pageWidth - 5, cursorY, { align: "right" });

    const earnedPts = (receiptData as any).earned_points || 0;
    const totalPts = (receiptData as any).total_points || 0;

    cursorY += 6;
    doc.setFillColor(243, 232, 255);
    doc.setDrawColor(216, 180, 254);
    doc.roundedRect(5, cursorY, pageWidth - 10, 15, 2, 2, 'FD');

    cursorY += 6;
    doc.setFontSize(9);
    doc.setTextColor(88, 28, 135);
    doc.text(`Puntos ganados:`, 8, cursorY);
    doc.text(`+${earnedPts} pts`, pageWidth - 8, cursorY, { align: "right" });

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Acumulados:`, 8, cursorY);
    doc.text(`${totalPts} pts`, pageWidth - 8, cursorY, { align: "right" });

    cursorY += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Gracias por su compra", pageWidth / 2, cursorY, { align: "center" });

    doc.save(`comprobante-${receiptNumber}.pdf`);
  };
  const formatMoney = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  };

  const normalizeReceipt = (receipt: any, saleData: any = {}, cartItems: any[] = [], clientName: string, clientNit: string, paymentMethod: string, cartTotal: number) => {
    return {
      id: receipt?.id || saleData?.id || "",
      receipt_number: receipt?.receipt_number || saleData?.receipt_number || "Sin recibo",
      customer_name: receipt?.customer_name || saleData?.customer_name || clientName || "Cliente",
      customer_nit: receipt?.customer_document || saleData?.customer_document || clientNit || "",
      payment_method: receipt?.payment_method || saleData?.payment_method || paymentMethod || "Efectivo",
      company_name: receipt?.company_name || saleData?.company_name || "Compañía ERP",
      earned_points: receipt?.earned_points || saleData?.earned_points || Math.floor(Number(receipt?.total ?? receipt?.total_amount ?? saleData?.total ?? saleData?.total_amount ?? cartTotal ?? 0) / 10),
      total_points: receipt?.total_points || saleData?.total_points || 0,
      total: Number(receipt?.total ?? receipt?.total_amount ?? saleData?.total ?? saleData?.total_amount ?? cartTotal ?? 0),
      items: Array.isArray(receipt?.items) && receipt.items.length > 0 ? receipt.items : cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))
    };
  };
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; stock: number }[]>([]);
  const [clientName, setClientName] = useState('Juanito Perez');
  const [clientNit, setClientNit] = useState('1234567');
  const [clientEmail, setClientEmail] = useState('');
  
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (clientNit.trim().length > 2) {
      const timer = setTimeout(() => {
        fetch(`http://localhost:3000/api/customers/search?document=${clientNit}`)
          .then(res => res.json())
          .then(data => {
            setCustomerSuggestions(data || []);
            setShowSuggestions(true);
          })
          .catch(() => {
            setCustomerSuggestions([]);
          });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    }
  }, [clientNit]);

  const handleSelectCustomer = (cust: any) => {
    setClientNit(cust.document);
    setClientName(cust.name);
    setShowSuggestions(false);
  };
  
  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState('b0000000-0000-0000-0000-000000000001');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptResponse | null>(null);
  const [view, setView] = useState<'pos' | 'list'>('pos');
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [products, setProducts] = useState([
    { id: 'a0000000-0000-0000-0000-000000000002', code: 'PROD-002', name: 'Leche Pil 980cc', price: 18.50, stock: 100 },
    { id: 'a0000000-0000-0000-0000-000000000003', code: 'PROD-003', name: 'Mayonesa Cris', price: 2.00, stock: 120 }
  ]);

  useEffect(() => {
    fetch('/api/branches')
      .then(r => r.json())
      .then(bData => {
        if (bData.length) {
          setBranches(bData);
          // Set initial branch
          if (!branch || branch === 'b0000000-0000-0000-0000-000000000001') {
             setBranch(bData[0].id);
          }
        }
      })
      .catch(() => []);
  }, []);

  useEffect(() => {
    if (!branch) return;
    
    // Warn and clear cart if changing branch
    if (cart.length > 0) {
      if (!window.confirm('Cambiar de sucursal vaciará su carrito. ¿Desea continuar?')) {
        return; // we can't easily revert the select here without tracking previous branch, so we just clear cart
      }
      setCart([]);
    }

    fetch(`/api/products/available?branch_id=${branch}`)
      .then(r => r.json())
      .then(pData => {
        if (Array.isArray(pData)) {
          setProducts(pData);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, [branch]);

  const addToCart = (prod: any) => {
    if (!branch) {
      alert('Seleccione una sucursal primero.');
      return;
    }
    if (prod.stock <= 0) {
      alert('Producto agotado en esta sucursal.');
      return;
    }

    setCart(prev => {
      const exists = prev.find(p => p.id === prod.product_id);
      if (exists) {
        if (exists.quantity >= prod.stock) {
          alert('No hay suficiente stock disponible.');
          return prev;
        }
        return prev.map(p => p.id === prod.product_id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: prod.product_id, name: prod.name, price: Number(prod.price), quantity: 1, stock: prod.stock }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(p => {
        if (p.id === id) {
          const newQty = p.quantity + delta;
          if (newQty > p.stock) {
            alert('No hay suficiente stock disponible.');
            return p;
          }
          if (newQty <= 0) {
            return null; // Will be filtered out
          }
          return { ...p, quantity: newQty };
        }
        return p;
      }).filter(Boolean) as typeof cart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Simplificado sin IVA separado

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    if (clientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail.trim())) {
        alert('El correo electrónico ingresado no es válido.');
        return;
      }
    }
    
    try {

      const payload = {
        branch_id: branch,
        customer_name: clientName,
        customer_document: clientNit,
        customer_email: clientEmail,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };
      const result: any = await createSale(payload);
      
      const saleId = result?.sale?.id || result?.id;
      const receiptNumber = result?.sale?.receipt_number || result?.receipt_number;

      console.log("Respuesta createSale:", result);
      console.log("Sale ID usado para recibo:", saleId);

      if (saleId) {
        try {
          const receipt = await getReceipt(saleId);
          setReceiptData(normalizeReceipt(receipt, result?.sale || result, cart, clientName, clientNit, paymentMethod, subtotal));
          setShowReceipt(true);
        } catch (receiptError) {
          console.warn("Venta creada, pero falló obtener recibo:", receiptError);
          setReceiptData(normalizeReceipt(null, result?.sale || result, cart, clientName, clientNit, paymentMethod, subtotal));
          setShowReceipt(true);
          refreshProducts();
        }
      } else {
        setReceiptData(normalizeReceipt(null, result?.sale || result, cart, clientName, clientNit, paymentMethod, subtotal));
        setShowReceipt(true);
        refreshProducts();
      }

    } catch (e: any) {
      alert(e.message || 'Error al procesar la venta');
      console.warn('Error en venta:', e);
    }
  };

  const refreshProducts = () => {
    if (!branch) return;
    fetch(`/api/products/available?branch_id=${branch}`)
      .then(r => r.json())
      .then(pData => {
        if (Array.isArray(pData)) {
          setProducts(pData);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setCart([]);
    refreshProducts();
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
                    <th className="text-left py-3 px-2 font-bold">Cliente</th>
                    <th className="text-right py-3 px-2 font-bold">Total</th>
                    <th className="text-left py-3 px-2 font-bold">Método</th>
                    <th className="text-left py-3 px-2 font-bold">Sucursal</th>
                    <th className="text-left py-3 px-2 font-bold">Fecha</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {salesList.map((sale) => (
                    <tr key={sale.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50">
                      <td className="py-3 px-2 font-bold text-on-surface">{sale.receipt_number}</td>
                      <td className="py-3 px-2 text-secondary">{sale.customer_name}</td>
                      <td className="py-3 px-2 text-right font-bold text-primary">Bs {formatMoney(sale.total || sale.total_amount)}</td>
                      <td className="py-3 px-2 text-secondary">{sale.payment_method}</td>
                      <td className="py-3 px-2 text-secondary">{sale.branch_name}</td>
                      <td className="py-3 px-2 text-secondary">{new Date(sale.created_at || sale.sale_date).toLocaleString()}</td>
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
            {products.length === 0 && (
              <p className="text-secondary text-sm p-4 col-span-full text-center">No hay productos con stock disponible en esta sucursal.</p>
            )}
            {products.map(p => (
              <div 
                key={p.product_id || p.id} 
                onClick={() => addToCart(p)}
                className="bg-surface border border-outline-variant/20 p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-on-surface">{p.name}</h3>
                  <p className="text-xs text-secondary font-mono mt-1">{p.product_code}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-primary">Bs {formatMoney(p.price)}</span>
                  <span className="text-xs font-medium bg-surface-container-high px-2 py-0.5 rounded text-secondary">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
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
                      <option value="b0000000-0000-0000-0000-000000000001">Sucursal Central</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">Cliente</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="relative">
                  <label className="text-xs font-bold text-secondary uppercase block mb-1">NIT/CI</label>
                  <input type="text" value={clientNit} onChange={e => setClientNit(e.target.value)} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm" />
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-surface border border-outline-variant/30 shadow-lg rounded mt-1 z-10 max-h-40 overflow-y-auto">
                      {customerSuggestions.map(cust => (
                        <div key={cust.id} onClick={() => handleSelectCustomer(cust)} className="px-2 py-1 hover:bg-surface-container cursor-pointer text-sm">
                          <span className="font-bold">{cust.document}</span> - {cust.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-secondary uppercase block mb-1">Correo Electrónico (Opcional)</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="cliente@correo.com" className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-sm" />
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
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-surface p-2 rounded border border-outline-variant/10">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-on-surface">{item.name}</p>
                      <p className="text-xs text-secondary">Bs {formatMoney(item.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-surface-container hover:bg-surface-container-high rounded flex items-center justify-center font-bold text-secondary">-</button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-surface-container hover:bg-surface-container-high rounded flex items-center justify-center font-bold text-secondary">+</button>
                      <span className="font-bold text-primary ml-2 w-16 text-right">Bs {formatMoney(item.quantity * item.price)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 ml-2 text-xs font-bold uppercase">X</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-surface-container-high/30 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-on-surface">Total</span>
              <span className="font-bold text-2xl text-primary">Bs {formatMoney(total)}</span>
            </div>
            
            {total > 0 && (
              <div className="flex justify-between items-center mb-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
                <span className="flex items-center gap-1"><Award className="w-4 h-4"/> Puntos a ganar:</span>
                <span>+{Math.floor(total / 10)} pts</span>
              </div>
            )}
            
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
        <div id="receipt-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div id="receipt-content" className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div 
              ref={receiptRef} 
              className="receipt-pdf-area receipt-print-area bg-white text-black p-6 rounded-lg"
              style={{
                width: "320px",
                background: "#ffffff",
                color: "#000000",
                fontFamily: "Arial, sans-serif"
              }}
            >
              <div className="text-center mb-4 border-b border-outline-variant/30 pb-4 print:border-black">
                <h2 className="font-bold text-xl mb-1 text-on-surface print:text-black">{(receiptData as any).company_name || "Compañía ERP"}</h2>
                <p className="text-xs uppercase font-bold tracking-wider mb-2 text-secondary print:text-black">Comprobante de venta</p>
                <p className="text-sm text-on-surface print:text-black">Nº {receiptData.receipt_number}</p>
                <p className="text-sm text-on-surface print:text-black">Fecha: {new Date().toLocaleString()}</p>
                <p className="text-sm mt-1 text-on-surface print:text-black">Sucursal: {branches.find(b => b.id === branch)?.name || 'Central'}</p>
              </div>

              <div className="mb-4 text-sm border-b border-outline-variant/30 pb-4 space-y-1 print:border-black print:text-black">
                <div className="flex justify-between"><span className="text-secondary print:text-black">Cliente:</span><span className="font-bold text-on-surface print:text-black">{receiptData.customer_name || clientName}</span></div>
                <div className="flex justify-between"><span className="text-secondary print:text-black">NIT/CI:</span><span className="font-bold text-on-surface print:text-black">{receiptData.customer_nit || clientNit}</span></div>
                <div className="flex justify-between"><span className="text-secondary print:text-black">Método:</span><span className="font-bold text-on-surface print:text-black">{receiptData.payment_method}</span></div>
              </div>

              <div className="mb-4">
                <table className="w-full text-sm text-left border-collapse print:text-black">
                  <thead>
                    <tr className="border-b border-outline-variant/30 print:border-black">
                      <th className="py-2 text-secondary font-medium print:text-black">Cant.</th>
                      <th className="py-2 text-secondary font-medium print:text-black">Producto</th>
                      <th className="py-2 text-right text-secondary font-medium print:text-black">Precio</th>
                      <th className="py-2 text-right text-secondary font-medium print:text-black">Subt.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.items && receiptData.items.map((item: any, i: number) => (
                      <tr key={item.id || item.product_id || item.product_code || `${item.product_name}-${i}`} className="border-b border-outline-variant/10 print:border-transparent">
                        <td className="py-2 align-top text-on-surface print:text-black">{item.quantity}</td>
                        <td className="py-2 align-top pr-2 text-on-surface print:text-black">{item.name || item.product_name || 'Prod'}</td>
                        <td className="py-2 text-right align-top text-on-surface print:text-black">{formatMoney(item.unit_price || item.price || (item.subtotal / item.quantity))}</td>
                        <td className="py-2 text-right align-top text-on-surface print:text-black">{formatMoney(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between border-t border-outline-variant/30 pt-4 font-bold text-lg mb-4 text-on-surface print:border-black print:text-black">
                <span>Total Pagado:</span>
                <span>Bs {formatMoney(receiptData.total)}</span>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30 mb-6 text-sm print:border-black print:bg-transparent">
                <div className="flex justify-between font-medium text-purple-900 dark:text-purple-300 print:text-black">
                  <span>Puntos ganados:</span>
                  <span>+{(receiptData as any).earned_points || 0} pts</span>
                </div>
                <div className="flex justify-between font-bold text-purple-900 dark:text-purple-300 print:text-black mt-1">
                  <span>Total Acumulados:</span>
                  <span>{(receiptData as any).total_points || 0} pts</span>
                </div>
              </div>
              
              <div className="text-center font-bold text-sm mt-4 text-on-surface print:text-black">
                Gracias por su compra
              </div>
            </div>

            <div className="flex gap-2 mt-8 no-print flex-col sm:flex-row">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-surface-container border border-outline-variant/20 text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors"
              >
                Imprimir
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Guardar PDF
              </button>
              <button
                onClick={closeReceipt}
                className="flex-1 py-2 bg-outline-variant/20 text-on-surface rounded-lg font-bold hover:bg-outline-variant/30 transition-colors"
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
