import { useState, useEffect } from 'react';
import { Building2, MapPin, Plus, Edit, X, Trash2 } from 'lucide-react';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CompaniesBranchesManager() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA MODALES ---
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // --- ESTADOS PARA EDICIÓN ---
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // --- ESTADOS PARA FORMULARIOS ---
  const [companyForm, setCompanyForm] = useState({
    name: '',
    nit: '',
    status: 'active'
  });

  const [branchForm, setBranchForm] = useState({
    name: '',
    city: '',
    address: '',
    status: 'active',
    company_id: ''
  });

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, branchRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/branches')
      ]);

      if (compRes.ok && branchRes.ok) {
        const compData = await compRes.json();
        const branchData = await branchRes.json();
        
        const formattedCompanies = compData.map((c: any) => ({
          id: c.id,
          name: c.name,
          nit: c.nit,
          status: c.status || 'active',
          branches: branchData
            .filter((b: any) => b.company_id === c.id)
            .map((b: any) => ({ 
              id: b.id, 
              name: b.name, 
              city: b.city || 'No especificada', 
              address: b.address, 
              status: b.status || 'active',
              company_id: b.company_id
            }))
        }));
        setCompanies(formattedCompanies);
      }
    } catch (err) {
      console.error('Error conectando al backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNCIONES PARA CERRAR MODALES LIMPIAMENTE ---
  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setIsEditingCompany(false);
    setEditingCompanyId(null);
    setCompanyForm({ name: '', nit: '', status: 'active' });
  };

  const closeBranchModal = () => {
    setIsBranchModalOpen(false);
    setIsEditingBranch(false);
    setEditingBranchId(null);
    setSelectedCompanyId(null);
    setBranchForm({ name: '', city: '', address: '', status: 'active', company_id: '' });
  };

  // --- HANDLERS PARA ABRIR MODO EDICIÓN ---
  const handleEditCompanyClick = (company: any) => {
    setCompanyForm({ name: company.name, nit: company.nit || '', status: company.status });
    setEditingCompanyId(company.id);
    setIsEditingCompany(true);
    setIsCompanyModalOpen(true);
  };

  const handleEditBranchClick = (branch: any) => {
    setBranchForm({ 
      name: branch.name, 
      city: branch.city === 'No especificada' ? '' : branch.city, 
      address: branch.address || '', 
      status: branch.status,
      company_id: branch.company_id
    });
    setEditingBranchId(branch.id);
    setIsEditingBranch(true);
    setIsBranchModalOpen(true);
  };

  // --- GUARDAR / EDITAR EMPRESA ---
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingCompany 
      ? `/api/companies/${editingCompanyId}`
      : '/api/companies';
    const method = isEditingCompany ? 'PUT' : 'POST';

    const payload = isEditingCompany 
      ? companyForm 
      : { ...companyForm };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        closeCompanyModal();
        fetchData();
      } else {
        const error = await response.json().catch(() => null);
        alert(error?.message || 'Error al guardar la empresa.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- GUARDAR / EDITAR SUCURSAL ---
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingBranch 
      ? `/api/branches/${editingBranchId}`
      : '/api/branches';
    const method = isEditingBranch ? 'PUT' : 'POST';

    const companyId = isEditingBranch ? editingBranchId : selectedCompanyId; // Actually we shouldn't use editingBranchId for company_id, we should use branchForm.company_id
    
    const payload = {
      name: branchForm.name.trim(),
      company_id: isEditingBranch ? branchForm.company_id : selectedCompanyId,
      city: branchForm.city.trim(),
      address: branchForm.address.trim(),
      status: branchForm.status
    };

    if (!payload.company_id || !payload.name || !payload.city || !payload.address) {
      alert("No se pudo guardar la sucursal. Seleccione una empresa y complete nombre, ciudad y dirección.");
      return;
    }

    console.log("Payload sucursal enviado:", payload);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        closeBranchModal();
        fetchData();
      } else {
        const error = await response.json().catch(() => null);
        alert(error?.message || 'Error al guardar la sucursal.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- ELIMINAR EMPRESA ---
  const handleDeleteCompany = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el supermercado "${name}"? \n\nTen en cuenta que no podrás eliminarlo si aún tiene sucursales registradas.`)) return;
    
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Error: No se pudo eliminar. Verifica que la empresa no tenga sucursales asignadas.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ELIMINAR SUCURSAL ---
  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la sucursal "${name}"?`)) return;
    
    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Error al eliminar la sucursal.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalBranches = companies.reduce((acc, c) => acc + (c.branches?.length || 0), 0);
  const activeBranches = companies.reduce((acc, c) => acc + (c.branches?.filter((b: any) => b.status === 'active').length || 0), 0);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Empresas y Sucursales</h1>
            <p className="text-secondary mt-1">Gestión de supermercados y sus puntos de venta.</p>
          </div>
          <button 
            onClick={() => setIsCompanyModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Supermercado
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <Building2 className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-3xl font-bold">{companies.length}</h3>
            <p className="text-sm text-secondary">Total Supermercados</p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-3xl font-bold">{totalBranches}</h3>
            <p className="text-sm text-secondary">Total Sucursales</p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <h3 className="text-3xl font-bold">{activeBranches}</h3>
            <p className="text-sm text-secondary">Sucursales Activas</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10">Cargando datos del sistema...</p>
        ) : (
          <div className="space-y-6">
            {companies.map(company => (
              <div key={company.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{company.name}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        {company.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditCompanyClick(company)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                      title="Editar Empresa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Eliminar Empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCompanyId(company.id);
                        setIsBranchModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors ml-2"
                    >
                      <Plus className="w-4 h-4" /> Sucursal
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {company.branches.length === 0 ? (
                    <p className="text-sm text-gray-400 italic p-2">No hay sucursales registradas para esta empresa.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {company.branches.map((branch: any) => (
                        <div key={branch.id} className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 group hover:border-blue-300 transition-colors relative">
                          
                          <div className="flex justify-between items-start mb-2 pr-14">
                            <h4 className="font-semibold">{branch.name}</h4>
                          </div>

                          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditBranchClick(branch)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Editar Sucursal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBranch(branch.id, branch.name)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Eliminar Sucursal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 gap-1 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{branch.city}: {branch.address}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${branch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {branch.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* MODAL: EMPRESA */}
        {isCompanyModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {isEditingCompany ? 'Editar Supermercado' : 'Registrar Supermercado'}
                </h2>
                <button onClick={closeCompanyModal}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveCompany} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre (Alias) *</label>
                  <input type="text" required className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIT</label>
                  <input type="text" className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={companyForm.nit} onChange={e => setCompanyForm({...companyForm, nit: e.target.value})} />
                </div>
                {isEditingCompany && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={companyForm.status} onChange={e => setCompanyForm({...companyForm, status: e.target.value})}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                )}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium mt-4">
                  {isEditingCompany ? 'Guardar Cambios' : 'Guardar Empresa'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SUCURSAL */}
        {isBranchModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {isEditingBranch ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}
                </h2>
                <button onClick={closeBranchModal}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveBranch} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de Sucursal *</label>
                  <input type="text" required className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad *</label>
                  <input type="text" required placeholder="Ej. Cochabamba" className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={branchForm.city} onChange={e => setBranchForm({...branchForm, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección Exacta *</label>
                  <input type="text" required className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                </div>
                {isEditingBranch && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" value={branchForm.status} onChange={e => setBranchForm({...branchForm, status: e.target.value})}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                )}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium mt-4">
                  {isEditingBranch ? 'Guardar Cambios' : 'Guardar Sucursal'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}