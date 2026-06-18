import { useState } from 'react';
import { Package, Plus, Edit, Tag, Barcode, DollarSign } from 'lucide-react';

export default function ProductCatalogManager() {
  const [products] = useState([
    {
      id: 'p1',
      code: 'PROD-002',
      name: 'Leche Pil 980cc',
      category: 'Lácteos',
      brand: 'PIL',
      price: 18.50,
      status: 'activo'
    },
    { id: 'p2', code: 'PROD-003', name: 'Mayonesa Cris', category: 'Salsas', brand: 'Cris', price: 2.00, status: 'activo' },
    { id: 'p3', code: 'PROD-004', name: 'Arroz', category: 'Granos', brand: 'Grano de Oro', price: 10.00, status: 'activo' },
    { id: 'p4', code: 'PROD-005', name: 'Aceite', category: 'Aceites', brand: 'Fino', price: 15.00, status: 'activo' },
    { id: 'p5', code: 'PROD-006', name: 'Azúcar', category: 'Abarrotes', brand: 'Guabira', price: 6.00, status: 'activo' },
    { id: 'p6', code: 'PROD-007', name: 'Fideos', category: 'Pastas', brand: 'Lazzaroni', price: 5.50, status: 'activo' }
  ]);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Productos y Categorías</h1>
            <p className="text-secondary mt-1">Catálogo maestro de productos para toda la cadena.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-surface text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors">
              <Tag className="w-5 h-5" />
              Categorías/Marcas
            </button>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
        </header>

        {/* TODO Product Service: conectar GET /products, POST /products, PUT /products/:id, DELETE /products/:id y GET /categories */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Package className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Product Service. Pendiente: conectar endpoints POST /products, GET /products, PUT /products/:id, DELETE /products/:id y GET /categories.
          </p>
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
                  <th className="p-4">Precio Base</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {products.map((product) => (
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
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-medium text-on-surface">
                        <DollarSign className="w-4 h-4 text-secondary opacity-70" />
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
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-secondary hover:text-primary transition-colors rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-secondary hover:text-red-500 transition-colors rounded">
                          Desactivar
                        </button>
                      </div>
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
