import { useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./components/features/Dashboard";
import { TreeView } from "./components/map/TreeView";
import { DailyLog } from "./components/features/DailyLog";
import { TaskList } from "./components/features/TaskList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { MOCK_TREES, MOCK_TASKS } from "./mock/data";
import type { DailyReport, MaintenanceTask, Tree } from "./types";
import { ToastProvider, useToast } from "./components/features/ToastContext";

type TabType = 'start' | 'karte' | 'protokoll' | 'aufgaben';

/**
 * AppContent enthält die eigentliche Logik. 
 * Wir trennen das, damit wir innerhalb dieser Komponente den useToast Hook nutzen können.
 */
function AppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('start');
  
  const [trees, setTrees] = useLocalStorage<Tree[]>('arbor_trees', MOCK_TREES);
  const [tasks, setTasks] = useLocalStorage<MaintenanceTask[]>('arbor_tasks', MOCK_TASKS);
  const [tour, setTour] = useLocalStorage<string[]>('arbor_tour', []);
  const [reports, setReports] = useLocalStorage<DailyReport[]>('arbor_reports', []);
  
  const [targetTreeId, setTargetTreeId] = useState<string | null>(null);

  const handleSelectTree = (treeId: string) => {
    setTargetTreeId(treeId);
    setActiveTab('karte');
  };

  // 1. NEUEN BAUM ANLEGEN
  const addTree = (newTree: Tree) => {
    setTrees(prev => [...prev, newTree]);
    setTimeout(() => {
      showToast(`${newTree.species} erfolgreich erfasst`, "success");
    }, 500);
  };

  // 2. MASSNAHME PLANEN
  const addTask = (newTask: MaintenanceTask) => {
    setTasks(prev => [newTask, ...prev]);
    setTimeout(() => {
      showToast(
        `${newTask.type} für ${newTask.treeId.split('-')[1]} geplant`, 
        "info"
      );
    }, 800);
  };

  // 3. MASSNAHME ABSCHLIESSEN
  const completeTask = (newTask: MaintenanceTask) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === newTask.id);
      if (exists) {
        return prev.map(t => t.id === newTask.id ? newTask : t);
      }
      return [newTask, ...prev];
    });
    
    // Baum wieder auf 'healthy' setzen
    setTrees(prevTrees => prevTrees.map(t => 
      t.id === newTask.treeId ? { ...t, status: 'healthy' as const } : t
    ));

    // Aus der Tour entfernen
    setTour(prevTour => prevTour.filter(id => id !== newTask.treeId));
    
     setTimeout(() => {
      showToast("Maßnahme erfolgreich dokumentiert", "success");
    }, 600);
  };

  const toggleTourTree = (treeId: string) => {
    const isInTour = tour.includes(treeId);
    setTour(prev => isInTour ? prev.filter(id => id !== treeId) : [...prev, treeId]);
    
     setTimeout(() => {
      showToast(
        isInTour ? "Von Tour entfernt" : "Zur Tour hinzugefügt", 
        isInTour ? "info" : "success"
      );
    }, 400);
  };

  const reorderTour = (newOrder: string[]) => setTour(newOrder);

  const handleReset = () => {
    if (window.confirm("Alle Daten zurücksetzen?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Tageszettel abschließen und archivieren
  const submitReport = () => {
    const completedTasks = tasks.filter(t => t.status === 'erledigt');
    
    if (completedTasks.length === 0) {
      showToast("Keine erledigten Aufgaben zum Senden", "warning");
      return;
    }

    const totalHours = completedTasks.reduce((acc, t) => acc + parseFloat(t.duration || "0"), 0);
    const uniqueTrees = new Set(completedTasks.map(t => t.treeId)).size;

    const newReport: DailyReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      tasks: completedTasks,
      totalHours,
      treeCount: uniqueTrees
    };

    setReports(prev => [newReport, ...prev]);
    setTasks(prev => prev.filter(t => t.status !== 'erledigt'));
    
    showToast("Tageszettel erfolgreich archiviert", "success");
  };

return (
    /* 
      Wir stellen sicher, dass das MainLayout die volle dynamische Höhe (dvh) einnimmt 
      und niemals scrollt. 
    */
    <div className="h-dvh w-full overflow-hidden flex flex-col">
      <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {/* 
          Dieser Container nimmt den Restplatz ein. 
          Für die Karte setzen wir 'overflow-hidden', damit sie nicht scrollt.
          Die anderen Ansichten (Dashboard, Log) brauchen 'overflow-y-auto' 
          innerhalb ihrer eigenen Dateien, um scrollbar zu sein.
        */}
        <div className="flex-1 relative h-full w-full overflow-hidden">
          {activeTab === 'start' && (
            <Dashboard 
              onStartTour={() => setActiveTab('aufgaben')} 
              onSelectTree={handleSelectTree} 
              tasks={tasks}
              trees={trees} 
              tour={tour}
            />
          )}

          {activeTab === 'karte' && (
            <TreeView 
              trees={trees} 
              onAddTree={addTree}
              tasks={tasks} 
              onAddTask={addTask} 
              onCompleteTask={completeTask}
              tour={tour}
              onToggleTourTree={toggleTourTree}
              onReorderTour={reorderTour}
              initialSelectedId={targetTreeId}
              onClearSelection={() => setTargetTreeId(null)} 
            />
          )}

          {activeTab === 'protokoll' && (
            <div className="h-full overflow-y-auto"> {/* Scroll-Container für lange Listen */}
              <DailyLog 
                tasks={tasks} 
                trees={trees} 
                reports={reports}
                onSubmitReport={submitReport}
                onReset={handleReset} 
              />
            </div>
          )}

          {activeTab === 'aufgaben' && (
            <div className="h-full overflow-y-auto"> {/* Scroll-Container für lange Listen */}
              <TaskList 
                tasks={tasks} 
                trees={trees} 
                onSelectTree={handleSelectTree}
                tour={tour}
                onReorderTour={reorderTour}
                onToggleTourTree={toggleTourTree}
              />
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}

/**
 * Root-Komponente mit Provider-Kapselung
 */
export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}