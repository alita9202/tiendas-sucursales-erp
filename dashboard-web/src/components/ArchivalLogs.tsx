import { useState, useMemo } from 'react';
import { ArchivalLog } from '../types';
import { Layers, Calendar, ChevronRight, Filter, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ArchivalLogsProps {
  logs: ArchivalLog[];
}

export default function ArchivalLogs({ logs }: ArchivalLogsProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchType = filterType === 'all' || log.type === filterType;
      const matchQuery =
        log.message.toLowerCase().includes(query.toLowerCase()) ||
        log.details.toLowerCase().includes(query.toLowerCase());
      return matchType && matchQuery;
    });
  }, [logs, filterType, query]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full overflow-y-auto no-scrollbar space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface">Historial y Evidencias</h2>
          <p className="text-on-surface-variant mt-2 font-body text-sm opacity-80 max-w-lg leading-relaxed">
            Libro de contabilidad inmutable y auditoría de flujo de stock en tiempo real.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bitácoras..."
              className="pl-9 pr-4 py-1.5 bg-surface-container border-none text-xs rounded-lg focus:ring-1 focus:ring-primary w-48 font-body outline-none text-on-surface"
            />
          </div>
        </div>
      </div>

      {/* Filter tab buttons */}
      <div className="flex gap-1 bg-surface-container p-1 rounded-xl w-fit">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'venta', label: 'Ventas' },
          { id: 'recepcion', label: 'Recepciones' },
          { id: 'despacho', label: 'Despachos' },
          { id: 'auditoria', label: 'Auditorías' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-label font-bold uppercase tracking-wider cursor-pointer transition-all ${
              filterType === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Logs timeline ledger list */}
      <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center p-16">
            <Layers className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-xs font-body font-bold text-on-surface-variant">Libro de registros vacío</p>
            <p className="text-[10px] font-label text-on-surface-variant opacity-75 mt-1">
              No hay logs que coincidan con la selección de filtrado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {filteredLogs.map((log) => {
              const date = new Date(log.date);

              return (
                <div
                  key={log.id}
                  className="p-6 transition-colors hover:bg-surface-bright flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Log status accent pill */}
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'recepcion'
                        ? 'bg-primary'
                        : log.type === 'venta'
                        ? 'bg-primary-container'
                        : log.type === 'despacho'
                        ? 'bg-tertiary-container'
                        : 'bg-neutral-500'
                    }`}></span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-[#5a5f63] font-bold">
                          {log.id}
                        </span>
                        <h4 className="font-headline font-bold text-xs text-on-surface">
                          {log.message}
                        </h4>
                      </div>
                      <p className="text-xs font-body text-on-surface-variant mt-1.5 opacity-85 leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-outline-variant/5 pt-3 sm:pt-0">
                    <span className="text-[9px] font-mono text-secondary-container-variant bg-surface-container px-2 py-0.5 rounded font-bold uppercase tracking-wider block sm:mb-2 text-[#5a5f63]">
                      {log.type}
                    </span>
                    
                    <div className="flex items-center gap-1 text-[#5a5f63] font-label text-[10px]">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>
                        {date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })} a las{' '}
                        {date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
