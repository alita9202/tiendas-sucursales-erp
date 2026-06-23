import { useState, useEffect } from 'react';
import {
  Bell,
  ShoppingCart,
  ArrowRightLeft,
  Award,
  AlertTriangle,
  Filter,
  RefreshCw,
  MessageSquare,
  Package,
  Boxes,
  CheckCircle,
} from 'lucide-react';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
};

export default function NotificationsManager() {
  const defaultNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'SaleCompleted',
      title: 'Venta Completada',
      message: 'Gracias por su compra Juanito Perez.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'TransferCompleted',
      title: 'Transferencia Completada',
      message: 'Transferencia de 50 unidades de Leche Pil 980cc desde Prado hacia El Alto completada.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'PointsAssigned',
      title: 'Puntos Asignados',
      message: 'Juanito Perez ganó 15 puntos por su compra.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      type: 'StockLow',
      title: 'Alerta de Stock Bajo',
      message: 'Stock bajo detectado para Leche Pil 980cc en Sucursal Prado.',
      createdAt: new Date().toISOString(),
    },
  ];

  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [backendError, setBackendError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/notifications');
      if (!res.ok) throw new Error('Response not ok');

      const rawData = await res.json();
      const data = Array.isArray(rawData)
        ? rawData
        : rawData?.data && Array.isArray(rawData.data)
          ? rawData.data
          : [];

      if (data.length > 0) {
        const normalized = data.map((n: any, index: number) => ({
          id: String(n.id ?? `${n.type ?? 'notification'}-${index}`),
          type: String(n.type ?? 'General'),
          title: String(n.title ?? 'Notificación'),
          message: String(n.message ?? 'Sin detalle'),
          createdAt: String(n.createdAt ?? n.created_at ?? n.time ?? new Date().toISOString()),
        }));

        setNotifications(normalized);
        setBackendError(false);
      } else {
        setNotifications([]);
        setBackendError(false);
      }
    } catch (e) {
      console.warn('Backend unavailable, using default notifications', e);
      setNotifications(defaultNotifications);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const filters = [
    { key: 'ALL', label: 'Todas' },
    { key: 'SaleCompleted', label: 'Ventas' },
    { key: 'TransferCompleted', label: 'Transferencias' },
    { key: 'InventoryLoad', label: 'Inventario' },
    { key: 'InventoryUpdated', label: 'Bajas/Reabastecer' },
    { key: 'ProductCreated', label: 'Productos' },
    { key: 'StockLow', label: 'Stock Bajo' },
    { key: 'PointsAssigned', label: 'Puntos' },
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'ALL') return true;

    if (activeFilter === 'InventoryUpdated') {
      return notif.type === 'InventoryUpdated' || notif.type === 'InventoryInput' || notif.type === 'InventoryOutput';
    }

    return notif.type === activeFilter;
  });

  const getIconConfig = (type: string) => {
    if (type === 'SaleCompleted') {
      return {
        Icon: ShoppingCart,
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        colorClass: 'text-green-500',
      };
    }

    if (type === 'TransferCompleted') {
      return {
        Icon: ArrowRightLeft,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        colorClass: 'text-blue-500',
      };
    }

    if (type === 'PointsAssigned') {
      return {
        Icon: Award,
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        colorClass: 'text-purple-500',
      };
    }

    if (type === 'StockLow') {
      return {
        Icon: AlertTriangle,
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        colorClass: 'text-red-500',
      };
    }

    if (type === 'ProductCreated' || type === 'ProductUpdated') {
      return {
        Icon: Package,
        bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
        colorClass: 'text-indigo-500',
      };
    }

    if (type === 'InventoryLoad' || type === 'InventoryUpdated' || type === 'InventoryInput' || type === 'InventoryOutput') {
      return {
        Icon: Boxes,
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        colorClass: 'text-orange-500',
      };
    }

    return {
      Icon: Bell,
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      colorClass: 'text-blue-500',
    };
  };

  const formatTime = (time: string) => {
    try {
      const dateObj = new Date(time);

      if (isNaN(dateObj.getTime())) {
        return 'Hace un momento';
      }

      return dateObj.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return 'Hace un momento';
    }
  };

  const totalNotifications = notifications.length;
  const salesCount = notifications.filter(n => n.type === 'SaleCompleted').length;
  const transferCount = notifications.filter(n => n.type === 'TransferCompleted').length;
  const inventoryCount = notifications.filter(n =>
    ['InventoryLoad', 'InventoryUpdated', 'InventoryInput', 'InventoryOutput'].includes(n.type)
  ).length;

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-5xl mx-auto space-y-6">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Notificaciones</h1>
            <p className="text-secondary mt-1">
              Eventos del sistema simulando Notification Service con consumo de eventos.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </header>

        {backendError && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded-r-lg">
            <p className="text-orange-800 dark:text-orange-300 font-medium text-xs">
              API no disponible. Se muestran notificaciones de ejemplo.
            </p>
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
          <MessageSquare className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Notification Service: escucha eventos del sistema como SaleCompleted, TransferCompleted, InventoryLoad, InventoryUpdated, ProductCreated y ProductUpdated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Total Eventos</p>
            <p className="text-2xl font-bold text-on-surface">{totalNotifications}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Ventas</p>
            <p className="text-2xl font-bold text-green-600">{salesCount}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Transferencias</p>
            <p className="text-2xl font-bold text-blue-600">{transferCount}</p>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
            <p className="text-sm text-secondary">Inventario</p>
            <p className="text-2xl font-bold text-orange-600">{inventoryCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-secondary mr-2">
            <Filter className="w-4 h-4" /> Filtros:
          </div>

          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface border border-outline-variant/30 text-secondary hover:bg-surface-container'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredNotifications.length > 0 ? filteredNotifications.map((notif, index) => {
            const type = notif.type ?? 'General';
            const keyId = notif.id ?? `${type}-${index}`;
            const title = notif.title ?? 'Notificación';
            const message = notif.message ?? 'Sin detalle';
            const time = notif.createdAt ?? new Date().toISOString();

            const { Icon, bgClass, colorClass } = getIconConfig(type);

            return (
              <div
                key={keyId}
                className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 flex gap-4 hover:border-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-on-surface flex items-center gap-2">
                      {title}
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Nuevo
                        </span>
                      )}
                    </h3>

                    <span className="text-xs font-medium text-secondary whitespace-nowrap ml-4">
                      {formatTime(time)}
                    </span>
                  </div>

                  <p className="text-sm text-secondary">{message}</p>

                  <span className="inline-block mt-2 text-[10px] font-mono bg-surface px-2 py-0.5 rounded text-on-surface-variant border border-outline-variant/20">
                    {type}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-8 text-center">
              <Bell className="w-10 h-10 mx-auto text-secondary mb-2" />
              <p className="font-bold text-on-surface">No hay notificaciones para este filtro.</p>
              <p className="text-sm text-secondary mt-1">
                Realiza una venta, transferencia, carga, baja o reabastecimiento para generar eventos.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
