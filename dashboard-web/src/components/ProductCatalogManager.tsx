import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Tag, Barcode, Search, X, Save, Calculator } from 'lucide-react';

type ProductItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  status: 'activo' | 'inactivo';
};

export default function ProductCatalogManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Abarrotes',
    brand: '',
    unit: 'Unidad',
    purchasePrice: 0,
    marginPercent: 20,
    price: 0,
  });

  const normalizeProduct = (p: any): ProductItem => ({
    id: p.id,
    code: p.code || p.id,
    name: p.name || 'Sin nombre',
    category: p.category === 'Lacteos' ? 'Lácteos' : p.category || 'Sin categoría',
    brand: p.brand || 'Sin marca',
    unit: p.unit || 'Unidad',
    price: Number(p.sale_price ?? p.price) || 0,
    status: p.status === 'ACTIVE' || p.status === 'activo' ? 'activo' : 'inactivo',
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.map(normalizeProduct));
      }
    } catch (err) {
      console.warn('Backend unavailable.', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  const brands = Array.from(new Set(products.map(p => p.brand))).sort();
  const activeProducts = products.filter(p => p.status === 'activo').length;

  const filteredProducts = products.filter(product => {
    const text = `${product.code} ${product.name} ${product.category} ${product.brand}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase().trim());
  });

  const calculatePrice = (purchasePrice: number, marginPercent: number) => {
    if (purchasePrice <= 0 || marginPercent < 0) return 0;
    return Number((purchasePrice * (1 + marginPercent / 100)).toFixed(2));
  };

  const handleCalculatePrice = () => {
    const calculated = calculatePrice(formData.purchasePrice, formData.marginPercent);

    if (calculated <= 0) {
      alert('Ingrese un costo de compra mayor a 0 y un margen válido.');
      return;
    }

    setFormData({ ...formData, price: calculated });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'Abarrotes',
      brand: '',
      unit: 'Unidad',
      purchasePrice: 0,
      marginPercent: 20,
      price: 0,
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const validateProduct = () => {
    const code = formData.code.trim();
    const name = formData.name.trim();
    const brand = formData.brand.trim();
    const category = formData.category.trim();
    const unit = formData.unit.trim();
    const price = calculatePrice(formData.purchasePrice, formData.marginPercent) || formData.price;

    if (!code || !name || !brand || !category || !unit) {
      alert('Debe completar código, producto, categoría, marca y unidad.');
      return null;
    }

    if (formData.purchasePrice < 0 || formData.marginPercent < 0) {
      alert('El costo de compra y margen no pueden ser negativos.');
      return null;
    }

    if (price <= 0) {
      alert('El precio debe ser mayor a 0. Puede calcularlo desde costo + margen.');
      return null;
    }

    const duplicated = products.some(p =>
      p.code.toLowerCase() === code.toLowerCase() &&
      p.id !== editingProduct?.id
    );

    if (duplicated) {
      alert('Ya existe un producto con ese código.');
      return null;
    }

    return {
      code,
      name,
      brand,
      category,
      unit,
      purchasePrice: Number(formData.purchasePrice),
      marginPercent: Number(formData.marginPercent),
      price: Number(price),
    };
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const validData = validateProduct();
    if (!validData) return;

    if (editingProduct) {
      const payload = {
        code: validData.code,
        name: validData.name,
        category: validData.category,
        brand: validData.brand,
        unit: validData.unit,
        purchase_price: validData.purchasePrice,
        margin_percent: validData.marginPercent,
        sale_price: validData.price,
      };

      try {
        const res = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setProducts(products.map(p => p.id === editingProduct.id ? normalizeProduct(updated) : p));
          alert('Producto actualizado correctamente.');
        } else {
          const error = await res.json().catch(() => null);
          alert(error?.message || 'No se pudo actualizar en API.');
        }
      } catch (err) {
        alert('No se pudo conectar con el API.');
      }

      resetForm();
      return;
    }

    const newProductPayload = {
      id: crypto.randomUUID(),
      code: validData.code,
      name: validData.name,
      category: validData.category,
      brand: validData.brand,
      unit: validData.unit,
      purchase_price: validData.purchasePrice,
      margin_percent: validData.marginPercent,
      sale_price: validData.price,
    };

    try {
      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductPayload),
      });

      if (res.ok) {
        const created = await res.json();
        setProducts([...products, normalizeProduct(created)]);
        alert('Producto registrado correctamente.');
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.message || 'No se pudo registrar el producto en API.');
      }
    } catch (err) {
      alert('No se pudo conectar con el API.');
    }

    resetForm();
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      purchasePrice: 0,
      marginPercent: 20,
      price: product.price,
    });
    setShowProductForm(true);
  };

  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newApiStatus = product.status === 'activo' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(`http://localhost:3000/api/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newApiStatus }),
      });

      if (res.ok) {
        const updated = await res.json();

        setProducts(products.map(p => (
          p.id === productId ? normalizeProduct(updated) : p
        )));

        alert(newApiStatus === 'ACTIVE' ? 'Producto activado correctamente.' : 'Producto desactivado correctamente.');
      } else {
        alert('No se pudo cambiar el estado del producto.');
      }
    } catch (err) {
      alert('No se pudo conectar con el API.');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Productos y Categorías</h1>
            <p className="text-secondary mt-1">Catálogo maestro de productos para toda la cadena.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              <Tag className="w-5 h-5" />
              Categorías/Marcas
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
        </header>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Package className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Product Service: listado desde API, registro, edición, activación/desactivación, validación de espacios con trim(), categorías, marcas y precio automático desde costo + margen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Productos</p>
            <p className="text-2xl font-bold text-on-surface">{products.length}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Activos</p>
            <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Categorías</p>
            <p className="text-2xl font-bold text-primary">{categories.length}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Marcas</p>
            <p className="text-2xl font-bold text-primary">{brands.length}</p>
          </div>
        </div>

        {showCategories && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
              <h3 className="font-bold text-on-surface mb-3">Categorías registradas</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <span key={category} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
              <h3 className="font-bold text-on-surface mb-3">Marcas registradas</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <span key={brand} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {showProductForm && (
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-on-surface">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <button onClick={resetForm} className="p-2 text-secondary hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-on-surface">Código</label>
                <input
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: PROD-007"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Producto</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Leche Pil 980cc"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Categoría</label>
                <input
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Abarrotes"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Marca</label>
                <input
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ej: Pil"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Unidad</label>
                <input
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ej: Unidad, Bolsa, Kilo"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Costo Compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={e => {
                    const purchasePrice = Number(e.target.value);
                    const price = calculatePrice(purchasePrice, formData.marginPercent);
                    setFormData({ ...formData, purchasePrice, price });
                  }}
                  placeholder="Ej: 15.00"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Margen %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.marginPercent}
                  onChange={e => {
                    const marginPercent = Number(e.target.value);
                    const price = calculatePrice(formData.purchasePrice, marginPercent);
                    setFormData({ ...formData, marginPercent, price });
                  }}
                  placeholder="Ej: 20"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-on-surface">Precio Base Calculado</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="Ej: 18.00"
                  className="w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCalculatePrice}
                  className="w-full flex items-center justify-center gap-2 bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Calcular Precio
                </button>
              </div>

              <div className="md:col-span-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r-lg text-sm text-blue-800 dark:text-blue-300">
                Ejemplo de defensa: si el costo de compra es Bs 15.00 y el margen es 20%, el precio de venta se calcula como Bs 18.00.
              </div>

              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-outline-variant/30 text-secondary hover:bg-surface"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, producto, categoría o marca..."
              className="w-full bg-surface border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-sm font-semibold text-secondary">
                  <th className="p-4">Código</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Unidad</th>
                  <th className="p-4">Precio Base</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/10">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-mono text-secondary">
                        <Barcode className="w-4 h-4 opacity-50" />
                        {product.code}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-on-surface">{product.name}</div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {product.category}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-secondary">{product.brand}</td>
                    <td className="p-4 text-sm text-secondary">{product.unit}</td>

                    <td className="p-4">
                      <div className="font-medium text-on-surface">
                        Bs {product.price.toFixed(2)}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'activo'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-secondary hover:text-primary transition-colors rounded"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`p-1 transition-colors rounded ${
                            product.status === 'activo'
                              ? 'text-secondary hover:text-red-500'
                              : 'text-secondary hover:text-green-600'
                          }`}
                        >
                          {product.status === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-secondary">
                      No se encontraron productos con ese criterio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}