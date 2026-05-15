import React from "react";
import { Home, Map as MapIcon, ClipboardList, CheckSquare } from "lucide-react";

type TabType = 'start' | 'karte' | 'protokoll' | 'aufgaben';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center rotate-3 shadow-lg">
            <MapIcon className="text-white w-5 h-5 -rotate-3" />
          <div className="w-4 h-4 bg-white rounded-sm italic font-black text-primary text-[10px] flex items-center justify-center">A</div>
          </div>
          <h1 className="font-black text-lg tracking-tighter text-primary uppercase leading-none">Arbor Log</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">MO</div>
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lokal gesichert</span>
        </div>
      </header>

      {/* Main Content Area - Scrollbar machen */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation - WICHTIG: Fixed und extrem hoher Z-Index */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 flex justify-around items-center px-2 py-3 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavItem 
          icon={<Home size={22} />} 
          label="Start" 
          active={activeTab === 'start'} 
          onClick={() => onTabChange('start')}
        />
        <NavItem 
          icon={<MapIcon size={22} />} 
          label="Karte" 
          active={activeTab === 'karte'} 
          onClick={() => onTabChange('karte')}
        />
        <NavItem 
          icon={<ClipboardList size={22} />} 
          label="Log" 
          active={activeTab === 'protokoll'} 
          onClick={() => onTabChange('protokoll')}
        />
        <NavItem 
          icon={<CheckSquare size={22} />} 
          label="Tasks" 
          active={activeTab === 'aufgaben'} 
          onClick={() => onTabChange('aufgaben')}
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex flex-col items-center gap-1 px-3 py-1 transition-all active:scale-90 ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      <div className={`${active ? 'bg-primary/10 p-1 rounded-md' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );
}