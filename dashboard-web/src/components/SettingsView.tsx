import { useState, FormEvent } from 'react';
import { Settings, Shield, Globe, HardDrive, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  branchName: string;
  setBranchName: (name: string) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
}

export default function SettingsView({
  branchName,
  setBranchName,
  taxRate,
  setTaxRate,
}: SettingsViewProps) {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [automaticReorder, setAutomaticReorder] = useState(true);
  const [securityLevel, setSecurityLevel] = useState('Alta (JWT + SSL)');

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    alert('Configuración corporativa almacenada exitosamente.');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto no-scrollbar space-y-8 pb-24">
      {/* Header section */}
      <div>
        <h2 className="text-4xl font-headline font-bold text-on-surface">Configuración de Sistema</h2>
        <p className="text-on-surface-variant mt-2 font-body text-sm opacity-80 max-w-lg leading-relaxed">
          Defina los parámetros fiscales, generales e institucionales que rigen Doña Serafina ERP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar inside settings */}
        <div className="space-y-2 col-span-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-surface-container-high/60 text-primary font-bold text-xs rounded-xl text-left border-l-4 border-primary">
            <Settings className="w-4 h-4" />
            <span>Parámetros Generales</span>
          </button>
          <button onClick={() => alert('Parámetros de seguridad de solo lectura.')} className="w-full flex items-center gap-3 px-4 py-3 text-secondary font-semibold text-xs rounded-xl text-left hover:bg-surface-container opacity-85">
            <Shield className="w-4 h-4" />
            <span>Seguridad Institucional</span>
          </button>
          <button onClick={() => alert('Configuración regional de solo lectura.')} className="w-full flex items-center gap-3 px-4 py-3 text-secondary font-semibold text-xs rounded-xl text-left hover:bg-surface-container opacity-85">
            <Globe className="w-4 h-4" />
            <span>Localización Regional</span>
          </button>
        </div>

        {/* Configurations Form Panel */}
        <div className="md:col-span-2 space-y-6 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/15 shadow-sm">
          <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Información de Sucursal</h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#5a5f63] font-label font-bold uppercase tracking-wider block mb-1">
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#5a5f63] font-label font-bold uppercase tracking-wider block mb-1">
                  Impuesto de Venta (IVA %)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                  className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#5a5f63] font-label font-bold uppercase tracking-wider block mb-1">
                  Símbolo de Divisa
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full text-xs font-body p-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-semibold"
                >
                  <option value="$">DOLARES ($)</option>
                  <option value="Bs.">BOLIVIANOS (Bs.)</option>
                  <option value="€">EUROS (€)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#5a5f63] font-label font-bold uppercase tracking-wider block mb-1">
                  Algoritmo de Encriptación
                </label>
                <input
                  type="text"
                  disabled
                  value={securityLevel}
                  className="w-full text-xs font-body p-2 bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface opacity-75 font-semibold"
                />
              </div>
            </div>

            <div className="border-t border-outline-variant/10 pt-4 space-y-4">
              <span className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider block mb-2">
                Automatización Inteligente
              </span>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Auto-Reabastecimiento predictivo</p>
                  <p className="text-[10px] text-[#5a5f63] font-body mt-0.5">Sugerir reordenamiento automático al descender de 5 existencias.</p>
                </div>
                <input
                  type="checkbox"
                  checked={automaticReorder}
                  onChange={(e) => setAutomaticReorder(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/10">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold font-label uppercase tracking-widest cursor-pointer shadow-md shadow-primary/25 hover:opacity-95 active:scale-95 transition-all"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* System info footer container */}
      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-xs font-label text-secondary justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Doña Serafina ERP Systems</p>
            <p className="text-[10px] opacity-75 mt-0.5">Versión actual: 4.2.0-Editorial. Licenciado para Sucursal Central.</p>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-wide opacity-80">
          UAC: Secure Kernel Verified
        </p>
      </div>

    </div>
  );
}
