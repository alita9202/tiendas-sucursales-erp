import { useState, useEffect } from 'react';
import { Upload, Save, FileSpreadsheet, CheckCircle, AlertTriangle, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

type PreviewRow = {
  codigo_producto: string;
  producto: string;
  empresa: string;
  sucursal: string;
  lote: string;
  cantidad: number;
  stock_minimo: number;
  costo: number;
  precio: number;
  status: 'Válido' | 'Revisar';
  message: string;
  product_id?: string;
  branch_id?: string;
};

export default function InventoryLoadManager() {
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('Ningún archivo seleccionado');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: '',
    product_id: '',
    initial_stock: 100,
    max_stock: 500,
    target_min_stock: 10,
    lot_code: 'LOTE-INI-001',
    expiration_date: '2026-12-31',
  });

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    const [bData, pData] = await Promise.all([
      fetch('http://localhost:3000/api/branches').then(r => r.json()).catch(() => []),
      fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => []),
    ]);

    if (bData.length) {
      setBranches(bData);
      setFormData(f => ({ ...f, branch_id: bData[0].id }));
    }

    if (pData.length) {
      const activeProducts = pData.filter((p: any) => p.status === 'ACTIVE');
      setProducts(activeProducts);

      setFormData(f => ({
        ...f,
        product_id: activeProducts.length > 0 ? activeProducts[0].id : '',
      }));
    }
  };

  const clearPreview = () => {
    setPreviewRows([]);
    setSelectedFile('Ningún archivo seleccionado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.branch_id || !formData.product_id) {
      alert('Debe seleccionar una sucursal y un producto activo.');
      return;
    }

    if (formData.initial_stock < 0 || formData.target_min_stock < 0 || formData.max_stock < 0) {
      alert('Las cantidades no pueden ser negativas.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/inventory/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: formData.branch_id,
          product_id: formData.product_id,
          initial_stock: formData.initial_stock,
          target_min_stock: formData.target_min_stock,
        }),
      });

      if (res.ok) {
        alert('Inventario cargado exitosamente');
      } else {
        alert('Error al cargar inventario');
      }
    } catch {
      alert('Backend no disponible.');
    }
  };

  const findProduct = (code: string, name: string) => {
    return products.find((p: any) =>
      String(p.code).trim().toLowerCase() === String(code).trim().toLowerCase() ||
      String(p.name).trim().toLowerCase() === String(name).trim().toLowerCase()
    );
  };

  const findBranch = (company: string, branch: string) => {
    return branches.find((b: any) => {
      const branchMatch = String(b.name).trim().toLowerCase() === String(branch).trim().toLowerCase();
      const companyMatch =
        !company ||
        String(b.company_name || '').trim().toLowerCase() === String(company).trim().toLowerCase();

      return branchMatch && companyMatch;
    }) || branches.find((b: any) =>
      String(b.name).trim().toLowerCase() === String(branch).trim().toLowerCase()
    );
  };

  const normalizeExcelRow = (row: any) => ({
    codigo_producto: String(row.codigo_producto ?? row.Codigo_Producto ?? row.CODIGO_PRODUCTO ?? '').trim(),
    producto: String(row.producto ?? row.Producto ?? row.PRODUCTO ?? '').trim(),
    empresa: String(row.empresa ?? row.Empresa ?? row.EMPRESA ?? '').trim(),
    sucursal: String(row.sucursal ?? row.Sucursal ?? row.SUCURSAL ?? '').trim(),
    lote: String(row.lote ?? row.Lote ?? row.LOTE ?? '').trim(),
    cantidad: row.cantidad ?? row.Cantidad ?? row.CANTIDAD ?? '',
    stock_minimo: row.stock_minimo ?? row.Stock_Minimo ?? row.STOCK_MINIMO ?? '',
    costo: row.costo ?? row.Costo ?? row.COSTO ?? '',
    precio: row.precio ?? row.Precio ?? row.PRECIO ?? '',
  });

  const validateRows = (rawRows: any[]): PreviewRow[] => {
    return rawRows.map((raw) => {
      const row = normalizeExcelRow(raw);

      const product = findProduct(row.codigo_producto, row.producto);
      const branch = findBranch(row.empresa, row.sucursal);

      const cantidad = Number(row.cantidad);
      const stockMinimo = Number(row.stock_minimo);
      const costo = Number(row.costo);
      const precio = Number(row.precio);

      const errors = [];

      if (!row.codigo_producto) errors.push('Código de producto vacío');
      if (!row.producto) errors.push('Producto vacío');
      if (!row.sucursal) errors.push('Sucursal vacía');
      if (!product) errors.push('Producto no existe o está inactivo');
      if (!branch) errors.push('Sucursal no encontrada');
      if (Number.isNaN(cantidad) || cantidad < 0) errors.push('Cantidad inválida');
      if (Number.isNaN(stockMinimo) || stockMinimo < 0) errors.push('Stock mínimo inválido');
      if (Number.isNaN(costo) || costo < 0) errors.push('Costo inválido');
      if (Number.isNaN(precio) || precio <= 0) errors.push('Precio inválido');

      return {
        codigo_producto: row.codigo_producto,
        producto: row.producto,
        empresa: row.empresa,
        sucursal: row.sucursal,
        lote: row.lote,
        cantidad,
        stock_minimo: stockMinimo,
        costo,
        precio,
        status: errors.length === 0 ? 'Válido' : 'Revisar',
        message: errors.length === 0 ? 'Listo para importar' : errors.join(', '),
        product_id: product?.id,
        branch_id: branch?.id,
      };
    });
  };

  const parseCsvText = (text: string) => {
    const cleaned = text.replace(/^\uFEFF/, '').trim();
    const lines = cleaned.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      alert('El archivo no tiene filas para importar.');
      return [];
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());

    const required = [
      'codigo_producto',
      'producto',
      'empresa',
      'sucursal',
      'lote',
      'cantidad',
      'stock_minimo',
      'costo',
      'precio',
    ];

    const missing = required.filter(col => !headers.includes(col));

    if (missing.length > 0) {
      alert(`Faltan columnas requeridas: ${missing.join(', ')}`);
      return [];
    }

    const rawRows = lines.slice(1).map((line) => {
      const values = line.split(separator).map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });

      return row;
    });

    return validateRows(rawRows);
  };

  const parseXlsxFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
    });

    if (!rawRows.length) {
      alert('El archivo Excel no tiene filas para importar.');
      return [];
    }

    return validateRows(rawRows);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    clearPreview();

    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !['csv', 'xlsx'].includes(extension)) {
      alert('Formato no válido. Solo se permite .csv o .xlsx');
      e.target.value = '';
      return;
    }

    setSelectedFile(file.name);

    try {
      if (extension === 'csv') {
        const reader = new FileReader();

        reader.onload = () => {
          const text = String(reader.result || '');
          const rows = parseCsvText(text);
          setPreviewRows(rows);
        };

        reader.readAsText(file, 'UTF-8');
      }

      if (extension === 'xlsx') {
        const rows = await parseXlsxFile(file);
        setPreviewRows(rows);
      }
    } catch {
      alert('No se pudo leer el archivo.');
      clearPreview();
    }
  };

  const importRows = async () => {
    const validRows = previewRows.filter(row => row.status === 'Válido');

    if (validRows.length === 0) {
      alert('No hay filas válidas para importar.');
      return;
    }

    setImporting(true);

    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        const res = await fetch('http://localhost:3000/api/inventory/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch_id: row.branch_id,
            product_id: row.product_id,
            initial_stock: row.cantidad,
            target_min_stock: row.stock_minimo,
          }),
        });

        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    alert(`Importación finalizada. Correctas: ${success}. Fallidas: ${failed}.`);

    if (success > 0) {
      clearPreview();
    }
  };

  const templateRows = [
    {
      codigo_producto: 'PROD-002',
      producto: 'Leche Pil 980cc',
      empresa: 'OXXO Bolivia',
      sucursal: 'Sucursal Prado',
      lote: 'LOTE-INI-001',
      cantidad: 100,
      stock_minimo: 10,
      costo: 15.0,
      precio: 18.5,
    },
    {
      codigo_producto: 'PROD-003',
      producto: 'Mayonesa Cris',
      empresa: 'Hipermaxi',
      sucursal: 'Sucursal 1',
      lote: 'LOTE-MAY-001',
      cantidad: 50,
      stock_minimo: 5,
      costo: 1.5,
      precio: 2.0,
    },
  ];

  const downloadTemplateCsv = () => {
    const headers = 'codigo_producto;producto;empresa;sucursal;lote;cantidad;stock_minimo;costo;precio\n';

    const rows = templateRows.map(row => [
      row.codigo_producto,
      row.producto,
      row.empresa,
      row.sucursal,
      row.lote,
      row.cantidad,
      row.stock_minimo,
      row.costo.toFixed(2),
      row.precio.toFixed(2),
    ].join(';')).join('\n');

    const blob = new Blob([headers + rows], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'formato_carga_inventario.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadTemplateXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'CargaInventario');
    XLSX.writeFile(workbook, 'formato_carga_inventario.xlsx');
  };

  const exportInventoryCsv = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/inventory');

      if (!res.ok) {
        alert('No se pudo obtener el inventario.');
        return;
      }

      const data = await res.json();
      const headers = 'empresa;sucursal;ciudad;codigo_producto;producto;cantidad;stock_minimo;estado\n';

      const rows = data.map((row: any) => [
        row.company_name,
        row.branch_name,
        row.city,
        row.product_code,
        row.product_name,
        row.quantity,
        row.min_stock,
        row.stock_status,
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
    } catch {
      alert('Error al exportar inventario.');
    }
  };

  const exportInventoryXlsx = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/inventory');

      if (!res.ok) {
        alert('No se pudo obtener el inventario.');
        return;
      }

      const data = await res.json();

      const rows = data.map((row: any) => ({
        empresa: row.company_name,
        sucursal: row.branch_name,
        ciudad: row.city,
        codigo_producto: row.product_code,
        producto: row.product_name,
        cantidad: row.quantity,
        stock_minimo: row.min_stock,
        estado: row.stock_status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
      XLSX.writeFile(workbook, 'inventario_actual.xlsx');
    } catch {
      alert('Error al exportar inventario Excel.');
    }
  };

  const validRowsCount = previewRows.filter(r => r.status === 'Válido').length;
  const reviewRowsCount = previewRows.filter(r => r.status === 'Revisar').length;

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto space-y-6">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Carga de Inventario</h1>
            <p className="text-secondary mt-1">
              Registro manual, carga inicial por lote e importación masiva desde CSV o Excel.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportInventoryCsv}
              className="bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>

            <button
              onClick={exportInventoryXlsx}
              className="bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </header>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Carga manual, productos activos, validación de CSV/XLSX, vista previa, importación real fila por fila y exportación en CSV/Excel.
          </p>
        </div>

        {products.length === 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-orange-800 dark:text-orange-300 font-medium text-sm">
              No hay productos activos disponibles. Active un producto desde Productos y Categorías para poder cargar inventario.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Carga Manual de Lote
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Sucursal Destino</label>
                <select
                  value={formData.branch_id}
                  onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Producto activo</label>
                <select
                  value={formData.product_id}
                  onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
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
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Código de Lote</label>
                  <input
                    type="text"
                    value={formData.lot_code}
                    onChange={e => setFormData({ ...formData, lot_code: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Cantidad Inicial</label>
                  <input
                    type="number"
                    value={formData.initial_stock}
                    onChange={e => setFormData({ ...formData, initial_stock: +e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Stock Máximo</label>
                  <input
                    type="number"
                    value={formData.max_stock}
                    onChange={e => setFormData({ ...formData, max_stock: +e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.target_min_stock}
                    onChange={e => setFormData({ ...formData, target_min_stock: +e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={products.length === 0}
                className={`w-full py-2.5 rounded-lg font-bold transition-colors ${
                  products.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary/90'
                }`}
              >
                Registrar Lote Inicial
              </button>
            </form>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Importación Masiva CSV / Excel
            </h2>

            <label className="flex-1 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 bg-surface/50 hover:bg-surface transition-colors cursor-pointer group">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <p className="font-medium text-on-surface mb-1 text-center">
                Haz clic para seleccionar CSV o Excel
              </p>

              <p className="text-xs text-secondary text-center max-w-xs">
                Formatos soportados: .csv y .xlsx.
              </p>

              <p className="text-xs text-primary text-center mt-3 font-medium">
                Archivo: {selectedFile}
              </p>
            </label>

            <div className="mt-4 bg-surface rounded-lg border border-outline-variant/20 p-4 text-xs text-secondary space-y-1">
              <p className="font-bold text-on-surface mb-2">Columnas requeridas:</p>
              <p>codigo_producto, producto, empresa, sucursal, lote, cantidad, stock_minimo, costo, precio</p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={downloadTemplateCsv}
                className="bg-surface text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-4 py-2.5 rounded-lg font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Formato CSV
              </button>

              <button
                onClick={downloadTemplateXlsx}
                className="bg-surface text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-4 py-2.5 rounded-lg font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Formato Excel
              </button>

              <button
                onClick={clearPreview}
                className="bg-surface text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar Vista
              </button>

              <button
                onClick={importRows}
                disabled={validRowsCount === 0 || importing}
                className={`px-4 py-2.5 rounded-lg font-bold transition-colors ${
                  validRowsCount === 0 || importing
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {importing ? 'Importando...' : 'Validar e Importar'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-on-surface">Vista Previa de Carga</h3>
              <p className="text-xs text-secondary">Datos validados antes de registrar el inventario.</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {validRowsCount} válidos
              </span>

              <span className="text-orange-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {reviewRowsCount} revisar
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                  <th className="p-4">Código</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Sucursal</th>
                  <th className="p-4">Lote</th>
                  <th className="p-4 text-right">Cantidad</th>
                  <th className="p-4 text-right">Mínimo</th>
                  <th className="p-4 text-right">Costo</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-center">Validación</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/10">
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-secondary">
                      Descarga el formato, rellena los datos y selecciona el archivo CSV o Excel para validar.
                    </td>
                  </tr>
                ) : previewRows.map((row, index) => (
                  <tr key={index} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-4 font-mono text-secondary">{row.codigo_producto}</td>
                    <td className="p-4 font-medium text-on-surface">{row.producto}</td>
                    <td className="p-4">{row.empresa}</td>
                    <td className="p-4">{row.sucursal}</td>
                    <td className="p-4 font-mono">{row.lote}</td>
                    <td className="p-4 text-right font-medium">{row.cantidad}</td>
                    <td className="p-4 text-right">{row.stock_minimo}</td>
                    <td className="p-4 text-right">Bs {Number(row.costo || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-green-600">Bs {Number(row.precio || 0).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {row.status === 'Válido' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Válido
                        </span>
                      ) : (
                        <span
                          title={row.message}
                          className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full"
                        >
                          <AlertTriangle className="w-3 h-3" /> Revisar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}