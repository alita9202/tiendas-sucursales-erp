import { Bell, ShoppingCart, ArrowRightLeft, Award, AlertTriangle, Filter } from 'lucide-react';

export default function NotificationsManager() {
  const notifications = [
    {
      id: 1,
      type: 'SaleCompleted',
      title: 'Venta Completada',
      message: 'Gracias por su compra Juanito Perez.',
      time: 'Hace 5 min',
      icon: ShoppingCart,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      id: 2,
      type: 'TransferCompleted',
      title: 'Transferencia Completada',
      message: 'Transferencia de 50 unidades de Leche Pil 980cc desde Prado hacia El Alto completada.',
      time: 'Hace 15 min',
      icon: ArrowRightLeft,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 3,
      type: 'PointsAssigned',
      title: 'Puntos Asignados',
      message: 'Juanito Perez ganó 15 puntos por su compra.',
      time: 'Hace 5 min',
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      id: 4,
      type: 'StockLow',
      title: 'Alerta de Stock Bajo',
      message: 'Stock bajo detectado para Leche Pil 980cc en Sucursal Prado (Quedan 48).',
      time: 'Hace 20 min',
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-100 dark:bg-red-900/30'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Notificaciones</h1>
            <p className="text-secondary mt-1">Eventos del sistema en tiempo real.</p>
          </div>
        </header>

        {/* TODO Notification Service: conectar GET /notifications */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <Bell className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Customer + Notification Service. Pendiente: conectar eventos RabbitMQ o endpoint GET /notifications.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-secondary mr-2">
            <Filter className="w-4 h-4" /> Filtros:
          </div>
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-on-primary whitespace-nowrap">Todas</button>
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-surface border border-outline-variant/30 text-secondary hover:bg-surface-container whitespace-nowrap">Ventas</button>
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-surface border border-outline-variant/30 text-secondary hover:bg-surface-container whitespace-nowrap">Transferencias</button>
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-surface border border-outline-variant/30 text-secondary hover:bg-surface-container whitespace-nowrap">Puntos</button>
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-surface border border-outline-variant/30 text-secondary hover:bg-surface-container whitespace-nowrap">Stock Bajo</button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div key={notif.id} className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 flex gap-4 hover:border-primary/30 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bg}`}>
                  <Icon className={`w-6 h-6 ${notif.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-on-surface">{notif.title}</h3>
                    <span className="text-xs font-medium text-secondary whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="text-sm text-secondary">{notif.message}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono bg-surface px-2 py-0.5 rounded text-on-surface-variant border border-outline-variant/20">
                    {notif.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
