import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
   CheckCircle2, Clock, 
  TreeDeciduous, ListTodo, Route, 
  TrendingUp, AlertTriangle, PartyPopper, Check
} from "lucide-react";
import type { MaintenanceTask, Tree } from "@/types";
import { InfoBox } from "../ui/infobox";

interface DashboardProps {
  onStartTour: () => void;
  onSelectTree: (id: string) => void;
  tasks: MaintenanceTask[];
  trees: Tree[];
  tour: string[];
}

export function Dashboard({ onStartTour, onSelectTree, tasks, trees, tour }: DashboardProps) {
  // --- SYNCHRONISIERTE LOGIK ---
  // Wir zählen nur Tasks, die explizit den Status 'offen' haben (wie in TaskList.tsx)
  const openTasks = tasks.filter(t => t.status === 'offen');
  const completedToday = tasks.filter(t => t.status === 'erledigt').length;
  
  // Nächsten Stopp ermitteln
  const nextTreeId = tour.length > 0 ? tour[0] : null;
  const nextTree = trees.find(t => t.id === nextTreeId);
  const nextTask = tasks.find(t => t.treeId === nextTreeId && t.status === 'offen');

  // Fortschrittsberechnung auf Basis der konsistenten Stati
  const totalWorkPool = completedToday + openTasks.length;
  const progressPercent = totalWorkPool > 0 
    ? Math.round((completedToday / totalWorkPool) * 100) 
    : 0;

  // Der Tag ist fertig, wenn keine 'offen' Tasks mehr da sind UND heute schon was geleistet wurde
  const isDayFinished = openTasks.length === 0 && completedToday > 0;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 max-w-md mx-auto pb-32 scrollbar-hide">
      {/* HEADER */}
      <header className="flex justify-between items-end pt-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arbor Logbook Pro</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Moin, Max!</h1>
        </div>
        <div className="text-right">
          <Badge variant="outline" className={`${isDayFinished ? 'bg-emerald-500 text-white border-none' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} font-bold transition-colors`}>
            {isDayFinished ? 'Feierabend!' : 'Einsatzbereit'}
          </Badge>
        </div>
      </header>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-none shadow-sm bg-white ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Route size={18} /></div>
            <span className="text-[10px] font-black uppercase text-slate-400">Tour</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{tour.length}</span>
            <span className="text-xs font-bold text-slate-400">Stopps</span>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-white ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 size={18} /></div>
            <span className="text-[10px] font-black uppercase text-slate-400">Erledigt</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{completedToday}</span>
            <span className="text-xs font-bold text-slate-400">heute</span>
          </div>
        </Card>
      </div>

      {/* MAIN ACTION */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
          <Clock size={12} /> Aktueller Fokus
        </h3>

        {nextTree ? (
          <Card className="relative overflow-hidden border-none shadow-xl shadow-blue-900/5 ring-1 ring-blue-100">
            <div className="absolute top-0 right-0 p-8 opacity-5"><TreeDeciduous size={120} /></div>
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
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm"><ListTodo size={14} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-400 leading-none mb-1">Aufgabe</p>
                      <p className="text-xs font-bold text-blue-800">{nextTask.type}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white shadow-lg font-black uppercase tracking-widest text-sm" onClick={() => onSelectTree(nextTree.id)}>
                Einsatz starten
              </Button>
            </div>
          </Card>
        ) : isDayFinished ? (
          <Card className="p-8 border-none bg-emerald-600 text-white flex flex-col items-center text-center space-y-4 rounded-3xl animate-in zoom-in-95 shadow-xl">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30"><PartyPopper size={32} /></div>
            <div>
              <h4 className="font-black text-xl italic uppercase tracking-tight">Alles erledigt!</h4>
              <p className="text-xs text-emerald-100 mt-1">Keine offenen Aufgaben mehr. Zeit für den Feierabend.</p>
            </div>
            <Button variant="secondary" className="w-full rounded-xl bg-white text-emerald-700 font-black uppercase text-[10px]" onClick={onStartTour}>Neue Tour planen</Button>
          </Card>
        ) : (
          <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-4 rounded-3xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 border border-slate-100"><Route size={32} /></div>
            <h4 className="font-bold text-slate-800 text-sm">Bereit für den Tag?</h4>
            <Button variant="outline" className="rounded-xl border-slate-200 font-black text-[10px] uppercase" onClick={onStartTour}>Route planen</Button>
          </Card>
        )}
      </section>

      {/* PROGRESS SECTION */}
      <section className="bg-white p-5 rounded-3xl ring-1 ring-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Tagesfortschritt</h4>
              <InfoBox title="Fortschritt" description="Zeigt das Verhältnis von geplanten (offenen) zu abgeschlossenen Aufgaben." />
            </div>
            <p className="text-2xl font-black text-slate-800">{progressPercent}% <span className="text-xs font-bold text-slate-400 uppercase">Fertig</span></p>
          </div>
          {isDayFinished ? <Check className="text-emerald-500" size={28} strokeWidth={3} /> : <TrendingUp className="text-emerald-500" size={24} />}
        </div>
        
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex gap-4 pt-1">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500 uppercase">{completedToday} Erledigt</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200" /><span className="text-[10px] font-bold text-slate-500 uppercase">{openTasks.length} Offen</span></div>
        </div>
      </section>

      {/* KRITISCHE BÄUME */}
      {trees.some(t => t.status === 'critical') && (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <p className="text-[11px] text-red-700 leading-tight">Es befinden sich Bäume mit Status <strong>Kritisch</strong> in deinem Gebiet.</p>
        </div>
      )}
    </div>
  );
}