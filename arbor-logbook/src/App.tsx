import { useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./components/features/Dashboard";
import { TreeView } from "./components/map/TreeView";
import { DailyLog } from "./components/features/DailyLog";
import { TaskList } from "./components/features/TaskList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { MOCK_TREES, MOCK_TASKS } from "./mock/data";
import type { MaintenanceTask, Tree } from "./types";

type TabType = 'start' | 'karte' | 'protokoll' | 'aufgaben';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('start');
  
  const [trees, setTrees] = useLocalStorage<Tree[]>('arbor_trees', MOCK_TREES);
  const [tasks, setTasks] = useLocalStorage<MaintenanceTask[]>('arbor_tasks', MOCK_TASKS);
  const [tour, setTour] = useLocalStorage<string[]>('arbor_tour', []);
  
  const [targetTreeId, setTargetTreeId] = useState<string | null>(null);

  const handleSelectTree = (treeId: string) => {
    setTargetTreeId(treeId);
    setActiveTab('karte');
  };

  // 1. NEUEN BAUM ANLEGEN
  const addTree = (newTree: Tree) => {
    setTrees(prev => [...prev, newTree]);
  };

  // 2. MASSNAHME PLANEN (Quick-Add oder Büro)
  const addTask = (newTask: MaintenanceTask) => {
    setTasks(prev => [newTask, ...prev]);
    // Der Baumstatus bleibt hier wie er ist (z.B. kritisch), 
    // damit er auf der Karte weiterhin als "zu tun" markiert ist.
  };

  // 3. MASSNAHME ABSCHLIESSEN (Dokumentation im Feld)
  const completeTask = (newTask: MaintenanceTask) => {
    // Falls ein bestehender Task überschrieben wird (ID check) oder neu
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
  };

  const toggleTourTree = (treeId: string) => {
    setTour(prev => prev.includes(treeId) ? prev.filter(id => id !== treeId) : [...prev, treeId]);
  };

  const reorderTour = (newOrder: string[]) => setTour(newOrder);

  const handleReset = () => {
    if (window.confirm("Alle Daten zurücksetzen?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
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