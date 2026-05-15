import { useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./components/features/Dashboard";
import { TreeView } from "./components/map/TreeView";
import { DailyLog } from "./components/features/DailyLog";
import { TaskList } from "./components/features/TaskList"; // Sicherstellen, dass importiert
import { useLocalStorage } from "./hooks/useLocalStorage";
import { MOCK_TREES, MOCK_TASKS } from "./mock/data";
import type { MaintenanceTask, Tree } from "./types";
import { CheckSquare } from "lucide-react";

type TabType = 'start' | 'karte' | 'protokoll' | 'aufgaben';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('start');
  
  // Persistente States via LocalStorage Hook
  const [trees, setTrees] = useLocalStorage<Tree[]>('arbor_trees', MOCK_TREES);
  const [tasks, setTasks] = useLocalStorage<MaintenanceTask[]>('arbor_tasks', MOCK_TASKS);

  const [tour, setTour] = useLocalStorage<string[]>('arbor_tour', []);
  
  const [targetTreeId, setTargetTreeId] = useState<string | null>(null);

  const handleSelectTree = (treeId: string) => {
    setTargetTreeId(treeId);
    setActiveTab('karte');
  };

  // NEU: Funktion zum Hinzufügen eines Baums
  const addTree = (newTree: Tree) => {
    setTrees(prev => [...prev, newTree]);
  };

  const addTask = (newTask: MaintenanceTask) => {
    setTasks(prev => [newTask, ...prev]);
    
    // Den Status des Baums aktualisieren, wenn eine Maßnahme durchgeführt wurde
    setTrees(prevTrees => prevTrees.map(t => 
      t.id === newTask.treeId ? { ...t, status: 'healthy' as const } : t
    ));
  };

  const handleReset = () => {
    if (window.confirm("Alle Daten zurücksetzen?")) {
      localStorage.removeItem('arbor_trees');
      localStorage.removeItem('arbor_tasks');
      window.location.reload();
    }
  };

  const toggleTourTree = (treeId: string) => {
    setTour(prev => {
      if (prev.includes(treeId)) {
        return prev.filter(id => id !== treeId);
      } else {
        return [...prev, treeId];
      }
    });
  };

  const reorderTour = (newOrder: string[]) => {
    setTour(newOrder);
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'start' && (
        <Dashboard 
          onStartTour={() => setActiveTab('karte')} 
          onSelectTree={handleSelectTree} 
          tasks={tasks}
          trees={trees} 
          tour={tour}
        />
      )}
      
      {activeTab === 'karte' && (
        <TreeView 
          trees={trees} 
          onAddTree={addTree} // <--- HIER war die fehlende Verbindung!
          tasks={tasks} 
          onAddTask={addTask} 
          initialSelectedId={targetTreeId}
          onClearSelection={() => setTargetTreeId(null)} 
          tour={tour}
          onToggleTourTree={toggleTourTree}
        />
      )}

      {activeTab === 'protokoll' && (
        <DailyLog tasks={tasks} trees={trees} onReset={handleReset} />
      )}

      {activeTab === 'aufgaben' && (
        <TaskList 
    tasks={tasks} 
    trees={trees} 
    onSelectTree={handleSelectTree}
    tour={tour}
    onReorderTour={reorderTour}
    onToggleTourTree={toggleTourTree}
  />
      )}
    </MainLayout>
  );
}

export default App;