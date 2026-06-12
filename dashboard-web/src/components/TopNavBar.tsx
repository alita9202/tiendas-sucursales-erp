import { useRef, useEffect } from 'react';
import { Search, Building, MapPin, User, Keyboard } from 'lucide-react';

interface TopNavBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
}

export default function TopNavBar({ searchQuery, setSearchQuery, activeTab }: TopNavBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'pos':
        return 'Buscar productos (F1)...';
      case 'inventory':
        return 'Buscar en el inventario...';
      case 'dashboard':
        return 'Buscar reportes o transacciones...';
      default:
        return 'Buscar...';
    }
  };

  return (
    <header className="w-full sticky top-0 bg-surface-container-lowest dark:bg-surface-dim z-40 transition-colors duration-300 border-b border-outline-variant/10 shadow-sm">
      <div className="flex justify-between items-center px-8 h-16 w-full">
        {/* Brand Logo & Search */}
        <div className="flex items-center gap-8">
          <span className="text-2xl font-headline font-bold text-primary dark:text-primary-fixed-dim tracking-tight cursor-default">
            Alexandria ERP
          </span>
          <div className="relative group hidden md:block">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
              <Search className="w-4 h-4 opacity-75" />
            </span>
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary w-96 font-body text-sm outline-none transition-all duration-200 text-on-surface placeholder:text-on-surface-variant/50"
              placeholder={getPlaceholder()}
              type="text"
            />
            <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
              <span className="text-[10px] bg-surface-container-high text-on-surface-variant/70 border border-outline-variant/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm">
                <Keyboard className="w-2.5 h-2.5" /> F1
              </span>
            </div>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 rounded-full cursor-pointer relative group">
            <Building className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 font-label pointer-events-none transition-all shadow-md">
              Corporativo
            </span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 rounded-full cursor-pointer relative group">
            <MapPin className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 font-label pointer-events-none transition-all shadow-md">
              Dirección
            </span>
          </button>

          <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>

          {/* User info */}
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-label font-bold text-on-surface leading-none">
                Admin Usuario
              </p>
              <p className="text-[10px] font-label text-on-surface-variant opacity-70 mt-1">
                Sucursal Central
              </p>
            </div>
            <button className="p-1.5 bg-primary/10 rounded-full text-primary hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
