import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, Clock, TreeDeciduous, 
  Send, RefreshCw, 
  History, Calendar, CheckCircle2
} from "lucide-react"; 
import type { MaintenanceTask, Tree } from "@/types";
import { TabsList, TabsTrigger} from "../ui/tabs";
import { InfoBox } from "../ui/infobox";

interface DailyLogProps {
  tasks: MaintenanceTask[];
  trees: Tree[];
  reports: any[]; 
  onSubmitReport: () => void;
  onReset: () => void;
}

export function DailyLog({ tasks, trees, reports, onSubmitReport, onReset }: DailyLogProps) {
  const [activeTab, setActiveTab] = useState("today"); // Manueller State für Tabs
  
  const completedTasks = tasks.filter(t => t.status === 'erledigt');

  const totalHours = completedTasks.reduce((acc, task) => {
    const hours = parseFloat(task.duration?.split(' ')[0] || "0");
    return acc + hours;
  }, 0);

  const uniqueTrees = new Set(completedTasks.map(t => t.treeId)).size;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pb-24 text-slate-900">
      <section className="space-y-1">
        <h2 className="text-2xl font-black italic tracking-tight uppercase">Leistungsnachweis</h2>
        <p className="text-slate-500 text-sm font-medium">Dokumentation & Archiv</p>
      </section>

      <div className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="today" 
            activeValue={activeTab} 
            setActiveValue={setActiveTab}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Heute ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            activeValue={activeTab} 
            setActiveValue={setActiveTab}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Historie ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: HEUTE */}
        {activeTab === "today" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-white ring-1 ring-black/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700"><Clock size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Dauer</p>
                    <p className="text-lg font-black">{totalHours} h</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white ring-1 ring-black/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700"><TreeDeciduous size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Bäume</p>
                    <p className="text-lg font-black">{uniqueTrees}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => {
                  const tree = trees.find(t => t.id === task.treeId);
                  return (
                    <Card key={task.id} className="border-none shadow-md overflow-hidden ring-1 ring-black/5 bg-white">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-emerald-700 font-black text-[10px]">
                              {tree?.idNumber.split('-')[1] || 'BA'}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm leading-tight">{tree?.species}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{task.type}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-black">{task.duration}</Badge>
                        </div>
                        {task.notes && <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">"{task.notes}"</p>}
                        {task.image && (
                          <div className="relative rounded-xl overflow-hidden h-24 border border-slate-100">
                            <img src={task.image} className="w-full h-full object-cover grayscale-[30%]" />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                   <ClipboardCheck className="mx-auto text-slate-300 mb-2" size={32} />
                   <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">Alles erledigt!</p>
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="pt-4">
                <Button 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex gap-2"
                  onClick={onSubmitReport}
                >
                  <Send size={18} />
                  Tageszettel senden
                </Button>
                 <div className="flex items-center gap-1">
    <InfoBox 
      title="Zettel Senden" 
      description="Beim Absenden wird dein aktueller Fortschritt in die Historie verschoben und die aktive Liste geleert."
      proTip="Archivierte Zettel können im Tab 'Historie' jederzeit eingesehen, aber nicht mehr bearbeitet werden."
    />
    <p className="text-[10px] text-slate-400 uppercase font-bold">
      Information zum Abschluss
    </p>
  </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORIE */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id} className="border-none shadow-sm ring-1 ring-black/5 bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {new Date(report.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase flex gap-2">
                            <span>{report.tasks.length} Maßnahmen</span>
                            <span>•</span>
                            <span>{report.totalHours} h</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-emerald-600">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                       {report.tasks.map((t: any, i: number) => (
                         <Badge key={i} variant="outline" className="bg-white text-[8px] whitespace-nowrap opacity-70">
                           {t.type}
                         </Badge>
                       ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <History className="mx-auto mb-2 opacity-20" size={32} />
                <p className="text-sm font-bold uppercase tracking-widest">Keine alten Zettel</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100">
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="w-full text-slate-300 hover:text-red-500 transition-colors text-[9px] font-black uppercase"
        >
          <RefreshCw size={12} className="mr-2" />
          Datenbank zurücksetzen
        </Button>
      </div>
    </div>
  );
}