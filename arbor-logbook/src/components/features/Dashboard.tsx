import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, Map, CheckCircle2, Clock, 
  ChevronRight, TreeDeciduous, ListTodo, Route, 
  TrendingUp, AlertTriangle
} from "lucide-react";
import type { MaintenanceTask, Tree } from "@/types";

interface DashboardProps {
  onStartTour: () => void;
  onSelectTree: (id: string) => void;
  tasks: MaintenanceTask[];
  trees: Tree[];
  tour: string[]; // NEU
}

export function Dashboard({ onStartTour, onSelectTree, tasks, trees, tour }: DashboardProps) {
  // Stats berechnen
  const openTasks = tasks.filter(t => t.status !== 'erledigt');
  const completedToday = tasks.filter(t => t.status === 'erledigt').length;
  
  // Nächsten Stopp aus der Tour ermitteln
  const nextTreeId = tour.length > 0 ? tour[0] : null;
  const nextTree = trees.find(t => t.id === nextTreeId);
  const nextTask = tasks.find(t => t.treeId === nextTreeId && t.status !== 'erledigt');

  // Fortschritt berechnen
  const totalStops = tour.length;
  const progressPercent = totalStops > 0 ? Math.round((completedToday / (completedToday + openTasks.length)) * 100) : 0;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pb-24">
      {/* HEADER: Begrüßung & Status */}
      <header className="flex justify-between items-end pt-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arbor Logbook Pro</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Moin, Max!</h1>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
            Einsatzbereit
          </Badge>
        </div>
      </header>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-none shadow-sm bg-white ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Route size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400">Tour</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{tour.length}</span>
            <span className="text-xs font-bold text-slate-400">Stopps</span>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-white ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400">Erledigt</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{completedToday}</span>
            <span className="text-xs font-bold text-slate-400">heute</span>
          </div>
        </Card>
      </div>

      {/* MAIN ACTION: NÄCHSTER HALT */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Clock size={12} /> Aktueller Fokus
          </h3>
          {tour.length > 0 && (
             <span className="text-[10px] font-bold text-blue-600">Reihenfolge aktiv</span>
          )}
        </div>

        {nextTree ? (
          <Card className="relative overflow-hidden border-none shadow-xl shadow-blue-900/5 ring-1 ring-blue-100">
            {/* Dekorativer Hintergrund-Akzent */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TreeDeciduous size={120} />
            </div>
            
            <div className="p-5 space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 bg-blue-600 text-white border-none text-[9px] uppercase font-black">Nächster Stopp</Badge>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{nextTree.species}</h2>
                  <p className="text-xs text-slate-500 font-medium">📍 {nextTree.location.address}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center min-w-[60px]">
                  <p className="text-[8px] font-black uppercase text-slate-400">ID</p>
                  <p className="font-bold text-slate-800">{nextTree.idNumber}</p>
                </div>
              </div>

              {nextTask && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <ListTodo size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-400 leading-none mb-1">Aufgabe</p>
                      <p className="text-xs font-bold text-blue-800">{nextTask.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-600 border-blue-200 font-bold">
                    {nextTask.priority}
                  </Badge>
                </div>
              )}

              <Button 
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center gap-3 group transition-all active:scale-[0.98]"
                onClick={() => onSelectTree(nextTree.id)}
              >
                <Play size={18} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                <span className="font-black uppercase tracking-widest text-sm">Einsatz starten</span>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-4 rounded-3xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
              <Route size={32} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Keine Tour aktiv</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1">Plane deine Route im Einsatzplan oder direkt auf der Karte.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs" onClick={onStartTour}>
              Tour planen
            </Button>
          </Card>
        )}
      </section>

      {/* PROGRESS SECTION */}
      <section className="bg-white p-5 rounded-3xl ring-1 ring-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Tagesfortschritt</h4>
            <p className="text-2xl font-black text-slate-800">{progressPercent}% <span className="text-xs font-bold text-slate-400">erledigt</span></p>
          </div>
          <TrendingUp className="text-emerald-500" size={24} />
        </div>
        
        {/* Simple Progress Bar */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex gap-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{completedToday} Erledigt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{openTasks.length} Offen</span>
          </div>
        </div>
      </section>

      {/* HINWEIS: KRITISCHE BÄUME */}
      {trees.some(t => t.status === 'critical') && (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <div>
            <p className="text-[10px] text-red-800 font-black uppercase tracking-tight">Dringende Warnung</p>
            <p className="text-[11px] text-red-700 leading-tight mt-1">
              Es befinden sich Bäume mit Status <strong>Kritisch</strong> in deinem Gebiet. Bitte priorisiere die Kontrolle.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}