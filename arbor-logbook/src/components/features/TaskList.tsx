import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Map, ListTodo, AlertCircle, 
  ArrowUp, ArrowDown, Trash2, Plus, Route, CheckCircle2 
} from "lucide-react";
import type { MaintenanceTask, Tree } from "@/types";

interface TaskListProps {
  tasks: MaintenanceTask[];
  trees: Tree[];
  onSelectTree: (id: string) => void;
  tour: string[];
  onReorderTour: (newOrder: string[]) => void;
  onToggleTourTree: (id: string) => void;
}

export function TaskList({ 
  tasks, 
  trees, 
  onSelectTree, 
  tour, 
  onReorderTour, 
  onToggleTourTree 
}: TaskListProps) {
  
  // 1. Validierung der Tour-IDs
  const validTourIds = tour.filter(id => trees.some(t => t.id === id));
  const tourStops = validTourIds.map(id => trees.find(t => t.id === id)!);

  // 2. NUR echte, offene Aufgaben anzeigen (Keine erledigten, keine Geister)
  const availableTasks = tasks.filter(task => 
    task.status === 'offen' && !validTourIds.includes(task.treeId)
  );

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...validTourIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onReorderTour(newOrder);
  };

  return (
    <div className="p-4 space-y-8 max-w-md mx-auto pb-40">
      <header className="space-y-1">
        <h2 className="text-2xl font-black italic tracking-tight text-slate-800 flex items-center gap-2">
          <Route className="text-blue-600" size={24} />
          Einsatzplanung
        </h2>
        <p className="text-slate-500 text-sm">Organisiere deine Route für heute</p>
      </header>

      {/* SEKTION 1: DIE AKTIVE TOUR */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Aktuelle Route ({tourStops.length} Stopps)
        </h3>

        <div className="space-y-3">
          {tourStops.length > 0 ? (
            tourStops.map((tree, index) => {
              // Finde den spezifisch offenen Task für diesen Stopp
              const task = tasks.find(t => t.treeId === tree.id && t.status === 'offen');
              return (
                <Card key={`tour-${tree.id}-${index}`} className="border-none shadow-md bg-white overflow-hidden ring-1 ring-slate-100">
                  <div className="flex">
                    <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center gap-2 py-2">
                      <Button variant="ghost" size="sm" onClick={() => moveStep(index, 'up')} disabled={index === 0} className="h-8 w-8 p-0 text-slate-400 disabled:opacity-10"><ArrowUp size={16} /></Button>
                      <span className="font-black text-blue-600 text-lg">{index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => moveStep(index, 'down')} disabled={index === tourStops.length - 1} className="h-8 w-8 p-0 text-slate-400 disabled:opacity-10"><ArrowDown size={16} /></Button>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 leading-tight truncate">{tree.species}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 border-slate-200">{tree.idNumber}</Badge>
                            {task && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter truncate">{task.type}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 shrink-0" onClick={() => onToggleTourTree(tree.id)}><Trash2 size={16} /></Button>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                         <p className="text-[10px] text-slate-400 italic truncate max-w-[120px]">📍 {tree.location.address}</p>
                        <Button size="sm" onClick={() => onSelectTree(tree.id)} className="rounded-xl h-8 bg-blue-600 shadow-md text-[9px] font-black uppercase">
                          <Map size={12} className="mr-1.5" /> Anfahrt
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2">
              <CheckCircle2 className="text-slate-300" size={24} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Keine Ziele in der Route</p>
            </div>
          )}
        </div>
      </section>

      {/* SEKTION 2: VERFÜGBARE OFFENE AUFGABEN */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Verfügbare Planungen ({availableTasks.length})
        </h3>
        
        {availableTasks.length > 0 ? (
          <div className="space-y-2">
            {availableTasks.map(task => {
              const tree = trees.find(t => t.id === task.treeId);
              if (!tree) return null;
              return (
                <div key={`available-${task.id}`} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <ListTodo size={14} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{tree.species}</h5>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{task.type}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl border-slate-200 text-[9px] font-black uppercase hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => onToggleTourTree(task.treeId)}>
                    <Plus size={14} className="mr-1" /> Tour
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight">Alles geplant! Keine offenen Aufgaben im Pool.</p>
          </div>
        )}
      </section>

      <div className="bg-slate-900 p-4 rounded-2xl flex gap-3 shadow-xl shadow-slate-900/20">
        <AlertCircle className="text-blue-400 shrink-0" size={18} />
        <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
          <strong>Pro-Tipp:</strong> Füge Bäume direkt von der Karte zum Tour-Modus hinzu, um eine Route ohne explizite Aufgabe zu erstellen.
        </p>
      </div>
    </div>
  );
}