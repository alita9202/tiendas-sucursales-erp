import { useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_LOGS } from './data';
import { Product, Transaction, ArchivalLog } from './types';
import SideNavBar from './components/SideNavBar';
import TopNavBar from './components/TopNavBar';
import POSCheckout from './components/POSCheckout';
import InventoryManager from './components/InventoryManager';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import SettingsView from './components/SettingsView';
import ArchivalLogs from './components/ArchivalLogs';

export default function App() {
  // Master state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [logs, setLogs] = useState<ArchivalLog[]>(INITIAL_LOGS);
  
  // Navigation & Search Query
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pos' | 'settings' | 'history'>('pos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Settings configs
  const [branchName, setBranchName] = useState('Sucursal Central');
  const [taxRate, setTaxRate] = useState(0.13); // 13% default

  // Shared updater actions
  const updateProductStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const addLog = (log: ArchivalLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface select-none font-body">
      {/* Editorial side bar layout */}
      <SideNavBar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setSearchQuery(''); // clear query on tab switch
      }} />

      {/* Main workspace container canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top bar header widgets */}
        <TopNavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
        />

        {/* Workspace body router */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'pos' && (
            <POSCheckout
              products={products}
              updateProductStock={updateProductStock}
              addTransaction={addTransaction}
              addLog={addLog}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              products={products}
              logs={logs}
              updateProductStock={updateProductStock}
              addLog={addLog}
            />
          )}

          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              transactions={transactions}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              branchName={branchName}
              setBranchName={setBranchName}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
            />
          )}

          {activeTab === 'history' && (
            <ArchivalLogs
              logs={logs}
            />
          )}
        </main>
      </div>
    </div>
  );
}
