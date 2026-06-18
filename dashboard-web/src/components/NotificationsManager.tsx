import { useState, useEffect } from 'react';
import { Bell, ShoppingCart, ArrowRightLeft, Award, AlertTriangle, Filter, RefreshCw, MessageSquare } from 'lucide-react';

export default function NotificationsManager() {
  const mockNotifications = [
    {
      id: '1',
      type: 'SaleCompleted',
      title: 'Venta Completada',
      message: 'Gracias por su compra Juanito Perez.',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'TransferCompleted',
      title: 'Transferencia Completada',
      message: 'Transferencia de 50 unidades de Leche Pil 980cc desde Prado hacia El Alto completada.',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      type: 'PointsAssigned',
      title: 'Puntos Asignados',
      message: 'Juanito Perez ganó 15 puntos por su compra.',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      type: 'StockLow',
      title: 'Alerta de Stock Bajo',
      message: 'Stock bajo detectado para Leche Pil 980cc en Sucursal Prado.',
      createdAt: new Date().toISOString()
    }
  ];

  const [notifications, setNotifications] = useState<any[]>(mockNotifications);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/notifications');
        if (!res.ok) throw new Error('Response not ok');
        
        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData : (rawData?.data && Array.isArray(rawData.data) ? rawData.data : null);

        if (data && data.length > 0) {
          setNotifications(data);
          setBackendError(false);
        } else if (data && data.length === 0) {
          setNotifications(mockNotifications);
          setBackendError(true);
        } else {
          setNotifications(mockNotifications);
          setBackendError(true);
        }
      } catch (e) {
        console.warn('Backend unavailable, using mock notifications', e);
        setNotifications(mockNotifications);
        setBackendError(true);
      }
    };
    
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Notificaciones</h1>
            <p className="text-secondary mt-1">Eventos del sistema en tiempo real.</p>
          </div>
          <button className="flex items-center gap-2 bg-surface text-secondary border border-outline-variant/30 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualizar (Polling Automático 3s)
          </button>
        </header>

        {backendError && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded-r-lg">
            <p className="text-orange-800 dark:text-orange-300 font-medium text-xs">
              Estado actual: notificaciones demo disponibles. Pendiente del responsable: persistir eventos reales y mejorar integración con ventas, transferencias o RabbitMQ.
            </p>
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start">
          <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
            Responsable: Customer + Notification Service. Estado actual: lectura por API y notificaciones demo. Pendiente: persistir eventos reales y preparar integración con RabbitMQ si el equipo lo requiere.
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
          {Array.isArray(notifications) && notifications.map((notif, index) => {
            const type = notif.type ?? 'general';
            const keyId = notif.id ?? `${type}-${index}`;
            const title = notif.title ?? 'Notificación';
            const message = notif.message ?? 'Sin detalle';
            const time = notif.createdAt ?? notif.time ?? new Date().toISOString();
            
            // Determinar icon y colores según el tipo
            let Icon = Bell;
            let bgClass = 'bg-blue-100 dark:bg-blue-900/30';
            let colorClass = 'text-blue-500';

            if (type === 'SaleCompleted') {
              Icon = ShoppingCart;
              colorClass = 'text-green-500';
              bgClass = 'bg-green-100 dark:bg-green-900/30';
            } else if (type === 'TransferCompleted') {
              Icon = ArrowRightLeft;
              colorClass = 'text-blue-500';
              bgClass = 'bg-blue-100 dark:bg-blue-900/30';
            } else if (type === 'PointsAssigned') {
              Icon = Award;
              colorClass = 'text-purple-500';
              bgClass = 'bg-purple-100 dark:bg-purple-900/30';
            } else if (type === 'StockLow') {
              Icon = AlertTriangle;
              colorClass = 'text-red-500';
              bgClass = 'bg-red-100 dark:bg-red-900/30';
            }

            // Si vienen de la base de datos o local, override si están presentes
            if (notif.icon) Icon = notif.icon;
            if (notif.bg) bgClass = notif.bg;
            if (notif.color) colorClass = notif.color;

            // Formatear la fecha evitando NaN
            let displayTime = time;
            try {
              if (time) {
                const dateObj = new Date(time);
                if (isNaN(dateObj.getTime())) {
                  displayTime = 'Hace un momento';
                } else {
                  displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              } else {
                displayTime = 'Hace un momento';
              }
            } catch (e) {
              displayTime = 'Hace un momento';
            }

            return (
              <div key={keyId} className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 flex gap-4 hover:border-primary/30 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-on-surface">{title}</h3>
                    <span className="text-xs font-medium text-secondary whitespace-nowrap ml-4">{displayTime}</span>
                  </div>
                  <p className="text-sm text-secondary">{message}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono bg-surface px-2 py-0.5 rounded text-on-surface-variant border border-outline-variant/20">
                    {type}
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
