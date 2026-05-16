import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Map, ListTodo, AlertCircle, 
  ArrowUp, ArrowDown, Trash2, Plus, Route 
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
  
  // 1. WICHTIG: Nur IDs behalten, zu denen es auch wirklich Bäume gibt (Vermeidet Index-Fehler)
  const validTourIds = tour.filter(id => trees.some(t => t.id === id));
  
  // 2. Die Baum-Objekte in der korrekten Reihenfolge laden
  const tourStops = validTourIds.map(id => trees.find(t => t.id === id)!);

  // 3. Offene Aufgaben finden, die NOCH NICHT in der Tour sind
  const availableTasks = tasks.filter(task => 
    task.status !== 'erledigt' && !validTourIds.includes(task.treeId)
  );

  // 4. Sicherere Tausch-Funktion
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...validTourIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Klassischer Tausch
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    onReorderTour(newOrder);
  };

  return (
    <div className="p-4 space-y-8 max-w-md mx-auto pb-40"> {/* Mehr Padding unten */}
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
          Aktuelle Tour ({tourStops.length} Stopps)
        </h3>

        <div className="space-y-3">
          {tourStops.length > 0 ? (
            tourStops.map((tree, index) => {
              const task = tasks.find(t => t.treeId === tree.id && t.status !== 'erledigt');
              return (
                <Card key={`tour-${tree.id}-${index}`} className="border-none shadow-md bg-white overflow-hidden ring-1 ring-slate-100">
                  <div className="flex">
                    {/* Index & Sortierung */}
                    <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center gap-2 py-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0 text-slate-400 disabled:opacity-10"
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <span className="font-black text-blue-600 text-lg">{index + 1}</span>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === tourStops.length - 1}
                        className="h-8 w-8 p-0 text-slate-400 disabled:opacity-10"
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 leading-tight truncate">{tree.species}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 border-slate-200">
                              {tree.idNumber}
                            </Badge>
                            {task && (
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter truncate">
                                {task.type}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-300 hover:text-red-500 shrink-0"
                          onClick={() => onToggleTourTree(tree.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                         <p className="text-[10px] text-slate-400 italic truncate max-w-[120px]">
                          📍 {tree.location.address}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => onSelectTree(tree.id)}
                          className="rounded-xl h-8 bg-blue-600 shadow-md text-[9px] font-black uppercase"
                        >
                          <Map size={12} className="mr-1.5" />
                          Anfahrt
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Noch keine Stopps geplant</p>
            </div>
          )}
        </div>
      </section>

      {/* SEKTION 2: VERFÜGBARE AUFGABEN */}
      {availableTasks.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Offene Aufgaben ({availableTasks.length})
          </h3>
          
          <div className="space-y-2">
            {availableTasks.map(task => {
              const tree = trees.find(t => t.id === task.treeId);
              if (!tree) return null;
              return (
                <div 
                  key={`available-${task.id}`} 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                      <ListTodo size={14} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{tree.species}</h5>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{task.type}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-xl border-slate-200 text-[9px] font-black uppercase"
                    onClick={() => onToggleTourTree(task.treeId)}
                  >
                    <Plus size={14} className="mr-1" />
                    Tour
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* HINWEIS-BOX */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
        <AlertCircle className="text-amber-600 shrink-0" size={18} />
        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
          <strong>Hinweis:</strong> Du kannst die Reihenfolge der Stopps jederzeit anpassen. Der nächste Halt wird automatisch auf deinem Dashboard angezeigt.
        </p>
      </div>
    </div>
  );
}