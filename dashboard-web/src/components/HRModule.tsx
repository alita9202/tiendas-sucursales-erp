import { useState, useMemo } from 'react';
import { Employee } from '../types';
import { BRANCHES, COMPANIES } from '../data';
import { Users, Plus, Search, X, Building2, Banknote, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HRModuleProps {
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  activeCompany: string;
}

const DEPARTMENTS = ['Ventas', 'Logística', 'Finanzas', 'Gerencia', 'Recursos Humanos', 'TI', 'Operaciones'];
const ROLES = ['Cajero', 'Supervisor de Caja', 'Encargado de Inventario', 'Administrador de Sucursal', 'Contador', 'Contadora', 'Analista de RRHH', 'Jefe de Operaciones'];
const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Activo', color: 'text-emerald-500', icon: CheckCircle },
  inactive: { label: 'Inactivo', color: 'text-rose-500', icon: XCircle },
  on_leave: { label: 'Con Licencia', color: 'text-amber-500', icon: Clock },
};

const blankEmployee = (): Omit<Employee, 'id'> => ({
  name: '',
  ci: '',
  role: ROLES[0],
  department: DEPARTMENTS[0],
  salary: 3500,
  branch: 'Hipermaxi Central',
  company: 'Hipermaxi S.A.',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active',
  phone: '',
  email: '',
});

export default function HRModule({ employees, addEmployee, activeCompany }: HRModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState(blankEmployee);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchQuery =
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase()) ||
        e.ci.includes(query);
      const matchBranch = filterBranch === 'all' || e.branch === filterBranch;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchQuery && matchBranch && matchStatus;
    });
  }, [employees, query, filterBranch, filterStatus]);

  const payrollStats = useMemo(() => {
    const total = employees.filter((e) => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);
    const byBranch: Record<string, number> = {};
    employees.filter((e) => e.status === 'active').forEach((e) => {
      byBranch[e.branch] = (byBranch[e.branch] || 0) + e.salary;
    });
    return { total, byBranch };
  }, [employees]);

  const handleSave = (ev: React.FormEvent) => {
    ev.preventDefault();
    addEmployee({
      ...form,
      id: `EMP-${Date.now()}`,
    });
    setForm(blankEmployee());
    setShowModal(false);
  };

  const availableBranches = BRANCHES.filter(
    (b) => activeCompany === 'all' || COMPANIES.find((c) => c.name === activeCompany)?.id === b.companyId
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Recursos Humanos</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Gestión de personal, nómina y estructura organizacional por sucursal.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={16} />
          Nuevo Empleado
        </button>
      </div>

      {/* Payroll KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-xs font-label uppercase tracking-wider opacity-60">Empleados Activos</span>
          <span className="text-3xl font-headline font-bold text-primary">
            {employees.filter((e) => e.status === 'active').length}
          </span>
          <span className="text-xs opacity-60">de {employees.length} registrados</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-xs font-label uppercase tracking-wider opacity-60">Masa Salarial Total</span>
          <span className="text-2xl font-headline font-bold text-on-surface">
            Bs. {payrollStats.total.toLocaleString('es-BO')}
          </span>
          <span className="text-xs opacity-60">mensual — todas las sucursales</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-xs font-label uppercase tracking-wider opacity-60">Sucursales con Personal</span>
          <span className="text-3xl font-headline font-bold text-on-surface">
            {Object.keys(payrollStats.byBranch).length}
          </span>
          <span className="text-xs opacity-60">en la empresa activa</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-xs font-label uppercase tracking-wider opacity-60">Departamentos</span>
          <span className="text-3xl font-headline font-bold text-on-surface">
            {[...new Set(employees.map((e) => e.department))].length}
          </span>
          <span className="text-xs opacity-60">áreas organizacionales</span>
        </div>
      </div>

      {/* Nómina por Sucursal */}
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Banknote size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-base">Nómina por Sucursal</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(payrollStats.byBranch).map(([branch, total]) => (
            <div key={branch} className="flex justify-between items-center bg-surface-container p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-primary opacity-70" />
                <span className="font-medium truncate max-w-[140px]">{branch}</span>
              </div>
              <span className="font-bold text-primary">Bs. {total.toLocaleString('es-BO')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, CI o cargo..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container border border-outline-variant/20 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="text-xs bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="all">Todas las sucursales</option>
            {availableBranches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="on_leave">Con Licencia</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/10 text-left text-[10px] uppercase tracking-wider opacity-60">
                <th className="py-3 pr-4 font-semibold">Empleado</th>
                <th className="py-3 pr-4 font-semibold">CI</th>
                <th className="py-3 pr-4 font-semibold">Cargo / Dpto.</th>
                <th className="py-3 pr-4 font-semibold">Sucursal</th>
                <th className="py-3 pr-4 font-semibold">Salario</th>
                <th className="py-3 pr-4 font-semibold">Estado</th>
                <th className="py-3 font-semibold">Ingreso</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEmployees.map((emp) => {
                  const st = STATUS_LABELS[emp.status];
                  const Icon = st.icon;
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-outline-variant/5 hover:bg-surface-container/40 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                            {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{emp.name}</p>
                            {emp.email && <p className="opacity-50 text-[10px]">{emp.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono">{emp.ci}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{emp.role}</p>
                        <p className="opacity-50">{emp.department}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-primary/8 text-primary font-medium text-[10px]">
                          {emp.branch}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-on-surface">
                        Bs. {emp.salary.toLocaleString('es-BO')}
                      </td>
                      <td className="py-3 pr-4">
                        <div className={`flex items-center gap-1 ${st.color}`}>
                          <Icon size={12} />
                          <span className="font-semibold">{st.label}</span>
                        </div>
                      </td>
                      <td className="py-3 opacity-60">
                        {new Date(emp.hireDate).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center opacity-40 text-sm">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    No se encontraron empleados con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Employee Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl border border-outline-variant/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg">Registrar Nuevo Empleado</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
                {[
                  { label: 'Nombre Completo', key: 'name', type: 'text', required: true },
                  { label: 'CI / Cédula de Identidad', key: 'ci', type: 'text', required: true },
                  { label: 'Teléfono', key: 'phone', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Salario Mensual (Bs.)', key: 'salary', type: 'number', required: true },
                  { label: 'Fecha de Ingreso', key: 'hireDate', type: 'date', required: true },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-label uppercase tracking-wider opacity-60 mb-1">{label}</label>
                    <input
                      type={type}
                      required={required}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full text-xs bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
                {[
                  { label: 'Cargo', key: 'role', options: ROLES },
                  { label: 'Departamento', key: 'department', options: DEPARTMENTS },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-label uppercase tracking-wider opacity-60 mb-1">{label}</label>
                    <select
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full text-xs bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 focus:outline-none focus:border-primary"
                    >
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-wider opacity-60 mb-1">Compañía</label>
                  <select
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 focus:outline-none focus:border-primary"
                  >
                    {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-wider opacity-60 mb-1">Sucursal</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 focus:outline-none focus:border-primary"
                  >
                    {BRANCHES.map((b) => <option key={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-outline-variant/10">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-xs font-semibold rounded-xl border border-outline-variant/20 cursor-pointer hover:bg-surface-container transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-md shadow-primary/20">
                    Registrar Empleado
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
