import React, { useState, useEffect } from 'react';
import { BarChart2, Download, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

type StockRow = {
  company_name: string;
  branch_name: string;
  city: string;
  product_code: string;
  product_name: string;
  total_stock: number;
  min_stock: number;
  stock_status: string;
};

type SalesRow = {
  sale_date?: string;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
  payment_method?: string;
  branch_name?: string;
};

export default function ReportsManager() {
  const [stockReport, setStockReport] = useState<StockRow[]>([]);
  const [salesReport, setSalesReport] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const fetchReports = async () => {
    setLoading(true);

    try {
      const [sRes, sdRes] = await Promise.all([
        fetch('http://localhost:3000/api/inventory'),
        fetch('http://localhost:3000/api/reports/sales-day'),
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();

        const mappedStock: StockRow[] = sData.map((row: any) => ({
          company_name: row.company_name || 'Sin empresa',
          branch_name: row.branch_name || 'Sin sucursal',
          city: row.city || '',
          product_code: row.product_code || 'N/A',
          product_name: row.product_name || 'Sin producto',
          total_stock: Number(row.quantity) || 0,
          min_stock: Number(row.min_stock) || 0,
          stock_status: row.stock_status || 'IN_STOCK',
        }));

        setStockReport(mappedStock);
      }

      if (sdRes.ok) {
        const sdData = await sdRes.json();

        const mappedSales: SalesRow[] = sdData.map((row: any) => ({
          sale_date: row.sale_date || row.date || row.fecha || 'Sin fecha',
          product_name: row.product_name || row.product || 'Producto',
          quantity: Number(row.quantity ?? row.qty ?? 0),
          unit_price: Number(row.unit_price ?? row.price ?? 0),
          total_amount: Number(row.total_amount ?? row.total ?? row.amount ?? 0),
          payment_method: row.payment_method || row.metodo_pago || 'N/A',
          branch_name: row.branch_name || row.branch || 'N/A',
        }));

        setSalesReport(mappedSales);
      }
    } catch (e) {
      console.warn('Error cargando reportes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalStock = stockReport.reduce((acc, it) => acc + Number(it.total_stock || 0), 0);
  const totalSales = salesReport.reduce((acc, it) => acc + Number(it.total_amount || 0), 0);
  const totalSalesQty = salesReport.reduce((acc, it) => acc + Number(it.quantity || 0), 0);

  const exportStockExcel = () => {
    const rows = stockReport.map(row => ({
      Empresa: row.company_name,
      Sucursal: row.branch_name,
      Ciudad: row.city,
      Codigo: row.product_code,
      Producto: row.product_name,
      Stock: row.total_stock,
      Minimo: row.min_stock,
      Estado: row.stock_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Consolidado');
    XLSX.writeFile(workbook, 'reporte_stock_consolidado.xlsx');
  };

  const exportSalesExcel = () => {
    const rows = salesReport.map(row => ({
      Fecha: row.sale_date,
      Sucursal: row.branch_name,
      Producto: row.product_name,
      Cantidad: row.quantity,
      Precio: row.unit_price,
      Total: row.total_amount,
      MetodoPago: row.payment_method,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas del Dia');
    XLSX.writeFile(workbook, 'reporte_ventas_dia.xlsx');
  };

  const exportAllExcel = () => {
    const stockRows = stockReport.map(row => ({
      Empresa: row.company_name,
      Sucursal: row.branch_name,
      Ciudad: row.city,
      Codigo: row.product_code,
      Producto: row.product_name,
      Stock: row.total_stock,
      Minimo: row.min_stock,
      Estado: row.stock_status,
    }));

    const salesRows = salesReport.map(row => ({
      Fecha: row.sale_date,
      Sucursal: row.branch_name,
      Producto: row.product_name,
      Cantidad: row.quantity,
      Precio: row.unit_price,
      Total: row.total_amount,
      MetodoPago: row.payment_method,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(stockRows), 'Stock');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesRows), 'Ventas');

    XLSX.writeFile(workbook, 'reportes_erp.xlsx');
  };

  const exportCsv = () => {
    const headers = 'tipo;empresa;sucursal;ciudad;codigo_producto;producto;cantidad;precio;total;estado\n';

    const stockRows = stockReport.map(row => [
      'STOCK',
      row.company_name,
      row.branch_name,
      row.city,
      row.product_code,
      row.product_name,
      row.total_stock,
      '',
      '',
      row.stock_status,
    ].join(';'));

    const salesRows = salesReport.map(row => [
      'VENTA',
      '',
      row.branch_name,
      '',
      '',
      row.product_name,
      row.quantity,
      row.unit_price,
      row.total_amount,
      row.payment_method,
    ].join(';'));

    const blob = new Blob([headers + [...stockRows, ...salesRows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'reportes_erp.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Reportes</h1>
            <p className="text-secondary mt-1">
              Reporte consolidado de stock, ventas del día y exportación para defensa.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchReports}
              className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            <button
              onClick={exportCsv}
              className="flex items-center gap-2 bg-surface text-primary border border-primary/20 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            <button
              onClick={exportAllExcel}
              className="flex items-center gap-2 bg-surface text-green-600 border border-green-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </header>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <FileText className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Reporting Service: consume datos reales de /api/inventory y /api/reports/sales-day para mostrar stock por sucursal y ventas del día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Stock Total</p>
            <p className="text-2xl font-bold text-on-surface">{totalStock}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Registros Stock</p>
            <p className="text-2xl font-bold text-primary">{stockReport.length}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Unidades Vendidas</p>
            <p className="text-2xl font-bold text-green-600">{totalSalesQty}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Ingresos del Día</p>
            <p className="text-2xl font-bold text-green-600">Bs {totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-high/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Stock Consolidado
              </h2>

              <button
                onClick={exportStockExcel}
                className="text-xs bg-surface text-green-600 border border-green-200 px-3 py-1.5 rounded-lg font-bold hover:bg-green-50"
              >
                Exportar Stock
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <p className="text-sm text-secondary">Total Consolidado</p>
                  <p className="text-3xl font-bold text-on-surface">
                    {totalStock}
                    <span className="text-sm font-normal text-secondary"> unidades</span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-outline-variant/20 rounded-lg">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                      <th className="p-3">Producto</th>
                      <th className="p-3">Código</th>
                      <th className="p-3 text-right">Saldo Total</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-outline-variant/10">
                    {(() => {
                      const groupedStock = stockReport.reduce((acc: Record<string, any>, item) => {
                        if (!acc[item.product_name]) {
                          acc[item.product_name] = {
                            product_name: item.product_name,
                            product_code: item.product_code,
                            total: 0,
                            branches: []
                          };
                        }
                        acc[item.product_name].total += item.total_stock;
                        acc[item.product_name].branches.push(item);
                        return acc;
                      }, {});

                      const groupedArray = Object.values(groupedStock);

                      if (groupedArray.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-secondary">
                              No hay datos de stock.
                            </td>
                          </tr>
                        );
                      }

                      return groupedArray.map((group: any, i: number) => (
                        <React.Fragment key={i}>
                          <tr className="hover:bg-surface-container-high/30 bg-surface">
                            <td className="p-3 font-bold text-on-surface text-base">
                              {group.product_name}
                            </td>
                            <td className="p-3 text-secondary font-mono">
                              {group.product_code}
                            </td>
                            <td className="p-3 text-right font-bold text-lg text-primary">
                              {group.total}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setExpandedProducts(prev => ({ ...prev, [group.product_name]: !prev[group.product_name] }))}
                                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
                              >
                                {expandedProducts[group.product_name] ? 'Ocultar Detalle' : 'Ver Detalle'}
                              </button>
                            </td>
                          </tr>
                          
                          {expandedProducts[group.product_name] && (
                            <tr>
                              <td colSpan={4} className="p-0 bg-surface-container-low/30 border-b-4 border-outline-variant/20">
                                <div className="p-4 pl-12 border-l-4 border-primary/50">
                                  <h4 className="text-xs font-bold text-secondary uppercase mb-2">Desglose por Sucursal</h4>
                                  <table className="w-full text-sm text-left">
                                    <thead>
                                      <tr className="text-secondary border-b border-outline-variant/10">
                                        <th className="pb-2 font-medium">Sucursal</th>
                                        <th className="pb-2 font-medium">Compañía</th>
                                        <th className="pb-2 font-medium text-right">Existencias</th>
                                        <th className="pb-2 font-medium text-center">Estado</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/5">
                                      {group.branches.map((b: any, j: number) => (
                                        <tr key={j}>
                                          <td className="py-2 text-on-surface">{b.branch_name} <span className="text-xs text-secondary">({b.city})</span></td>
                                          <td className="py-2 text-secondary">{b.company_name}</td>
                                          <td className="py-2 text-right font-bold">{b.total_stock}</td>
                                          <td className="py-2 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                              b.stock_status === 'OUT_OF_STOCK'
                                                ? 'bg-red-100 text-red-700'
                                                : b.stock_status === 'LOW_STOCK'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                              {b.stock_status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-high/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-green-500" />
                Ventas del Día
              </h2>

              <button
                onClick={exportSalesExcel}
                className="text-xs bg-surface text-green-600 border border-green-200 px-3 py-1.5 rounded-lg font-bold hover:bg-green-50"
              >
                Exportar Ventas
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                  <p className="text-sm text-secondary mb-1">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">Bs {totalSales.toFixed(2)}</p>
                </div>

                <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                  <p className="text-sm text-secondary mb-1">Unidades Vendidas</p>
                  <p className="text-2xl font-bold text-on-surface">{totalSalesQty}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-outline-variant/20 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-right">Cant.</th>
                      <th className="p-3 text-right">Precio</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-outline-variant/10">
                    {salesReport.length > 0 ? salesReport.map((sale, i) => (
                      <tr key={i} className="hover:bg-surface-container/50">
                        <td className="p-3 text-secondary">{sale.sale_date}</td>
                        <td className="p-3 font-medium">{sale.product_name}</td>
                        <td className="p-3 text-right">{sale.quantity}</td>
                        <td className="p-3 text-right">Bs {Number(sale.unit_price || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-bold">
                          Bs {Number(sale.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-secondary">
                          No hay ventas registradas para el día.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}