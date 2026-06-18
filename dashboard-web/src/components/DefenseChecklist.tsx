import { ClipboardCheck, CheckCircle2, Circle, Eye, Upload } from 'lucide-react';

export default function DefenseChecklist() {
  const tasks = [
    {
      id: 1,
      module: 'Arquitectura e integración',
      owner: 'Edson',
      status: 'Pendiente revisión final',
      missing: 'Diagrama, puertos, contratos REST, eventos',
      completed: false
    },
    {
      id: 2,
      module: 'PM / Coordinación',
      owner: 'Alejandra',
      status: 'En curso',
      missing: 'Guion de defensa, checklist final, evidencias',
      completed: false
    },
    {
      id: 3,
      module: 'DBB / DevOps de datos',
      owner: 'Alejandra',
      status: 'Listo MVP',
      missing: 'Evidencias y capturas\nComandos:\ndocker compose up -d postgres rabbitmq\n.\\database\\scripts\\reset-mvp-database.ps1',
      completed: true
    },
    {
      id: 4,
      module: 'Company Service',
      owner: 'Iver',
      status: 'Pendiente',
      missing: 'Endpoints compañías/sucursales',
      completed: false
    },
    {
      id: 5,
      module: 'Product Service',
      owner: 'Alejandro o asignado',
      status: 'Pendiente',
      missing: 'CRUD productos, categorías, marcas',
      completed: false
    },
    {
      id: 6,
      module: 'Inventory Service',
      owner: 'Alejandro / apoyo DBB',
      status: 'Parcial visual',
      missing: 'Carga Excel, transferencias, kardex real',
      completed: false
    },
    {
      id: 7,
      module: 'Sales Service',
      owner: 'Alberto',
      status: 'Parcial visual',
      missing: 'POST /sales, comprobante, conexión con inventario',
      completed: false
    },
    {
      id: 8,
      module: 'Customer + Notification',
      owner: 'Alizon / Jimmy Pablo',
      status: 'Pendiente',
      missing: 'Clientes, puntos, notificaciones simuladas',
      completed: false
    },
    {
      id: 9,
      module: 'QA / Evidencias',
      owner: 'Jimmy Pablo o asignado',
      status: 'Pendiente',
      missing: 'Postman, capturas, pruebas negativas',
      completed: false
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-primary text-on-primary p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8" />
              Checklist de Defensa
            </h1>
            <p className="text-on-primary/80 max-w-2xl text-lg">
              Coordinación del equipo para la demostración final. Cada responsable debe marcar su módulo como listo al terminar.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 opacity-10">
            <ClipboardCheck className="w-64 h-64" />
          </div>
        </header>

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-secondary">
                  <th className="p-4 w-12 text-center">✓</th>
                  <th className="p-4">Módulo</th>
                  <th className="p-4">Responsable</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Qué falta</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-surface-container-high/30 transition-colors ${task.completed ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                    <td className="p-4 text-center">
                      <button className="text-secondary hover:text-primary transition-colors">
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 opacity-50" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 font-bold text-on-surface">{task.module}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                          {task.owner.charAt(0)}
                        </div>
                        <span className="font-medium">{task.owner}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        task.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : task.status.includes('Parcial') 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-surface-container-highest text-secondary'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <pre className="font-sans whitespace-pre-wrap text-sm text-secondary bg-surface p-2 rounded border border-outline-variant/10">
                        {task.missing}
                      </pre>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-secondary hover:text-primary bg-surface border border-outline-variant/20 rounded transition-colors" title="Ver endpoints pendientes">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-secondary hover:text-green-600 bg-surface border border-outline-variant/20 rounded transition-colors" title="Agregar evidencia">
                          <Upload className="w-4 h-4" />
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
