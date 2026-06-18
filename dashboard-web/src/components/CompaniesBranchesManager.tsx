import { useState, useEffect } from 'react';
import { Building2, MapPin, Plus, Edit } from 'lucide-react';

export default function CompaniesBranchesManager() {
  const [companies, setCompanies] = useState([
    {
      id: 'c1',
      name: 'Abuelita Serafina SuperMarket Bolivia S.A.',
      status: 'active',
      branches: [
        { id: 'b1', name: 'Sucursal Central', city: 'Cochabamba', status: 'active' },
        { id: 'b2', name: 'Sucursal Zona Norte', city: 'Cochabamba', status: 'active' }
      ]
    },
    {
      id: 'c2',
      name: 'OXXO Bolivia',
      status: 'active',
      branches: [
        { id: 'b3', name: 'Sucursal Prado', city: 'La Paz', status: 'active' },
        { id: 'b4', name: 'Sucursal El Alto', city: 'El Alto', status: 'active' }
      ]
    },
    {
      id: 'c3',
      name: 'Hipermaxi',
      status: 'active',
      branches: [
        { id: 'b5', name: 'Sucursal 1', city: 'Santa Cruz', status: 'active' }
      ]
    },
    {
      id: 'c4',
      name: 'IC Norte',
      status: 'active',
      branches: [
        { id: 'b6', name: 'Melchor Perez', city: 'Cochabamba', status: 'active' }
      ]
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, branchRes] = await Promise.all([
          fetch('http://localhost:3000/api/companies'),
          fetch('http://localhost:3000/api/branches')
        ]);
        if (compRes.ok && branchRes.ok) {
          const compData = await compRes.json();
          const branchData = await branchRes.json();
          
          if (compData.length > 0) {
            const formattedCompanies = compData.map((c: any) => ({
              id: c.id,
              name: c.name,
              status: 'active',
              branches: branchData
                .filter((b: any) => b.company_id === c.id)
                .map((b: any) => ({ id: b.id, name: b.name, city: b.address, status: 'active' }))
            }));
            setCompanies(formattedCompanies);
          }
        }
      } catch (err) {
        console.warn('Backend no disponible, usando fallback mock data', err);
      }
    };
    fetchData();
  }, []);

  const totalBranches = companies.reduce((acc, c) => acc + c.branches.length, 0);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Empresas y Sucursales</h1>
            <p className="text-secondary mt-1">Gestión de supermercados y sus puntos de venta.</p>
            {/* TODO Company Service: conectar POST /companies y POST /branches */}
          </div>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-5 h-5" />
            Nuevo Supermercado
          </button>
        </header>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-800 dark:text-blue-300 font-medium text-sm">
            Guía de demostración: Primero se registra el supermercado, luego sus sucursales, después se asigna inventario y finalmente se realizan ventas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <Building2 className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-3xl font-bold text-on-surface">{companies.length}</h3>
            <p className="text-sm text-secondary">Total Supermercados</p>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <MapPin className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-3xl font-bold text-on-surface">{totalBranches}</h3>
            <p className="text-sm text-secondary">Total Sucursales</p>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <h3 className="text-3xl font-bold text-on-surface">{totalBranches}</h3>
            <p className="text-sm text-secondary">Sucursales Activas</p>
          </div>
        </div>

        <div className="space-y-6">
          {companies.map(company => (
            <div key={company.id} className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high/30">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">{company.name}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1">
                      {company.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-secondary hover:text-primary transition-colors p-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 text-sm bg-surface text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary/5 transition-colors">
                    <Plus className="w-4 h-4" /> Sucursal
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {company.branches.map(branch => (
                    <div key={branch.id} className="bg-surface p-4 rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-on-surface">{branch.name}</h4>
                        <button className="opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-opacity">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center text-sm text-secondary gap-1 mb-2">
                        <MapPin className="w-4 h-4" />
                        {branch.city}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {branch.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
