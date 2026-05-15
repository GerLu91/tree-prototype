import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, Clock, TreeDeciduous, 
  Send, RefreshCw, Truck, Image as ImageIcon 
} from "lucide-react"; 
import type { MaintenanceTask, Tree } from "@/types";

interface DailyLogProps {
  tasks: MaintenanceTask[];
  trees: Tree[];
  onReset: () => void;
}

export function DailyLog({ tasks, trees, onReset }: DailyLogProps) {
  // Nur erledigte Aufgaben
  const completedTasks = tasks.filter(t => t.status === 'erledigt');

  // Berechnungen
  const totalHours = completedTasks.reduce((acc, task) => {
    const hours = parseFloat(task.duration?.split(' ')[0] || "0");
    return acc + hours;
  }, 0);

  const uniqueTrees = new Set(completedTasks.map(t => t.treeId)).size;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pb-24 text-slate-900">
      <section className="space-y-1">
        <h2 className="text-2xl font-black italic tracking-tight">Tagesprotokoll</h2>
        <p className="text-slate-500 text-sm">Übersicht der heutigen Einsätze</p>
      </section>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white ring-1 ring-black/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Arbeitszeit</p>
              <p className="text-lg font-black text-slate-800">{totalHours} h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white ring-1 ring-black/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <TreeDeciduous size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Bäume</p>
              <p className="text-lg font-black text-slate-800">{uniqueTrees}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste der Einträge */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Einzelnachweise</h3>
        
        {completedTasks.length > 0 ? (
          completedTasks.map((task: any) => { // any genutzt, da wir MaintenanceTask dynamisch erweitert haben
            const tree = trees.find(t => t.id === task.treeId);
            return (
              <Card key={task.id} className="border-none shadow-md overflow-hidden ring-1 ring-black/5 bg-white">
                <div className="p-4 space-y-3">
                  {/* Header: Baum & Dauer */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-black text-[10px]">
                        {tree?.idNumber.split('-')[1]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{tree?.species}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{task.type}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-black">{task.duration}</Badge>
                  </div>

                  {/* Details: Häckselgut & Notizen */}
                  <div className="flex flex-wrap gap-2">
                    {task.woodChips && task.woodChips !== "Keines" && (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                        <Truck size={12} />
                        <span className="text-[10px] font-bold uppercase">{task.woodChips}</span>
                      </div>
                    )}
                    {task.notes && (
                      <p className="text-[11px] text-slate-500 italic w-full bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{task.notes}"
                      </p>
                    )}
                  </div>

                  {/* Foto-Anzeige */}
                  {task.image && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                      <img 
                        src={task.image} 
                        alt="Dokumentation" 
                        className="w-full h-32 object-cover grayscale-[20%] hover:grayscale-0 transition-all"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white p-1 rounded-md">
                        <ImageIcon size={12} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl">
             <ClipboardCheck className="mx-auto text-slate-300 mb-2" size={32} />
             <p className="text-sm text-slate-400 font-medium">Noch keine Einträge für heute.</p>
          </div>
        )}
      </div>

      {/* Abschluss Button */}
      {completedTasks.length > 0 && (
        <div className="pt-4">
          <Button 
            className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex gap-2"
            onClick={() => alert("Tageszettel wurde erfolgreich an das Büro übermittelt!")}
          >
            <Send size={18} />
            Tageszettel senden
          </Button>
          <p className="text-center text-[10px] text-slate-400 mt-4 px-6 uppercase font-bold tracking-tighter leading-tight">
            Nach dem Absenden können Einträge nur noch über das Büro geändert werden.
          </p>
        </div>
      )}

      {/* Reset Bereich */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">System-Admin</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onReset}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-[10px] font-bold uppercase h-8"
          >
            <RefreshCw size={12} className="mr-2" />
            Datenbank leeren
          </Button>
        </div>
      </div>
    </div>
  );
}