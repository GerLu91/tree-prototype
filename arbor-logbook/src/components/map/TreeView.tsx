import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Ruler, Activity, ClipboardCheck, Navigation, 
  CheckCircle2, Filter, AlertTriangle, AlertCircle, Wrench, Plus, 
  Route, ListPlus, ArrowUp, ArrowDown, Trash2, CalendarPlus
} from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceForm } from '@/components/forms/MaintenanceForm';
import { AddTreeForm } from '@/components/forms/AddTreeForm';
import type { MaintenanceTask, Tree } from '@/types';

// Asset Handling für Leaflet mit Vite Suffix ?url (Wichtig für Build-Check)
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';

import { InfoBox } from '../ui/infobox';
import { useToast } from '../features/ToastContext';

// Fix für die Default-Icons in Leaflet/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const TEAM_POSITION: [number, number] = [49.4505, 11.0820]; 

// --- HILFSKOMPONENTEN ---

function MapFocusHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

function MapBoundsHandler({ trees }: { trees: Tree[] }) {
  const map = useMap();
  useEffect(() => {
    if (trees.length > 0) {
      const bounds = L.latLngBounds(trees.map(t => [t.location.lat, t.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, animate: true });
    }
  }, [trees, map]);
  return null;
}

function MapCenterTracker({ onCenterChange }: { onCenterChange: (coords: {lat: number, lng: number}) => void }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    }
  });
  return null;
}

// --- ICON GENERATOREN (VEREDELT) ---

const createCustomIcon = (status: string, idNumber: string, hasOpenTask: boolean) => {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#059669';
  
  const html = renderToStaticMarkup(
    <div className="relative flex flex-col items-center">
      {/* Pulsierender Ring bei offenen Aufgaben (Smart Marker) */}
      {hasOpenTask && (
        <div className="absolute inset-0 -m-1 w-11 h-11 animate-marker-pulse bg-yellow-500/20 rounded-full z-0" />
      )}
      
      <div style={{ backgroundColor: color }} className="relative p-1.5 rounded-full border-2 border-white shadow-xl text-white z-10">
        <MapPin size={18} />
        
        {/* Kleines Werkzeug-Badge am Marker */}
        {hasOpenTask && (
          <div className="absolute -top-1.5 -right-1.5 bg-white text-yellow-600 rounded-full p-0.5 shadow-xs border border-yellow-200">
            <Wrench size={8} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-sm px-1 py-0.5 rounded text-[9px] font-black mt-0.5 shadow-sm border border-slate-200 text-slate-800 whitespace-nowrap z-10">
        {idNumber}
      </div>
    </div>
  );
  return L.divIcon({ html, className: 'custom-tree-icon', iconSize: [44, 44], iconAnchor: [22, 40] });
};

const createTourIcon = (index: number, hasOpenTask: boolean) => {
  const html = renderToStaticMarkup(
    <div className="relative flex flex-col items-center scale-110">
      {/* Pulsierender Ring auch im Tour-Modus */}
      {hasOpenTask && (
        <div className="absolute inset-0 -m-1 w-11 h-11 animate-marker-pulse bg-yellow-400/30 rounded-full z-0" />
      )}

      <div className="relative bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-xl text-white z-10">
        <MapPin size={18} fill="white" />
        {hasOpenTask && (
          <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white rounded-full p-0.5 shadow-xs border border-white">
            <Wrench size={8} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="bg-blue-700 text-white px-2 py-0.5 rounded-full text-[10px] font-black -mt-2 shadow-lg z-20 border border-white">
        {index + 1}
      </div>
    </div>
  );
  return L.divIcon({ html, className: 'tour-marker-icon', iconSize: [44, 44], iconAnchor: [22, 40] });
};

// --- HAUPTKOMPONENTE ---

interface TreeViewProps {
  trees: Tree[];
  onAddTree: (tree: Tree) => void;
  tasks: MaintenanceTask[];
  onAddTask: (task: MaintenanceTask) => void;
  onCompleteTask: (task: MaintenanceTask) => void;
  initialSelectedId: string | null;
  onClearSelection: () => void;
  tour: string[];
  onToggleTourTree: (id: string) => void;
  onReorderTour: (newOrder: string[]) => void;
}

export function TreeView({ 
  trees, onAddTree, tasks, onAddTask, onCompleteTask, initialSelectedId, onClearSelection,
  tour, onToggleTourTree, onReorderTour 
}: TreeViewProps) {
  const { showToast } = useToast();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // States für Ad-hoc Erfassung
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 49.4521, lng: 11.0767 });
  const [isTourMode, setIsTourMode] = useState(false);

  const activeTask = useMemo(() => {
    if (!selectedTree) return undefined;
    return tasks.find(t => t.treeId === selectedTree.id && t.status === 'offen');
  }, [tasks, selectedTree]);

  const treeTasks = useMemo(() => {
    return tasks.filter(t => t.treeId === selectedTree?.id);
  }, [tasks, selectedTree]);

  const tourCoords = useMemo(() => {
    if (tour.length === 0) return null;
    const coords: [number, number][] = [TEAM_POSITION];
    tour.forEach(id => {
      const tree = trees.find(t => t.id === id);
      if (tree) coords.push([tree.location.lat, tree.location.lng]);
    });
    return coords;
  }, [tour, trees]);

  const handleStartNavigation = (tree: Tree) => {
    setIsTourMode(false); 
    setRouteCoords([TEAM_POSITION, [tree.location.lat, tree.location.lng]]);
    showToast(`Navigation zu ${tree.idNumber} gestartet`, "info");
  };

  const handleQuickPlan = (type: MaintenanceTask['type']) => {
    if (!selectedTree) return;
    const newTask: MaintenanceTask = {
      id: crypto.randomUUID(),
      treeId: selectedTree.id,
      type: type,
      status: 'offen',
      priority: selectedTree.status === 'critical' ? 'hoch' : 'mittel',
      dueDate: new Date().toISOString(),
    };
    onAddTask(newTask);
    showToast(`${type} für ${selectedTree.idNumber} geplant`, "info");
  };

  const filteredTrees = useMemo(() => {
    return trees.filter(tree => {
      if (activeFilter === 'all') return true;
      return tree.status === activeFilter;
    });
  }, [trees, activeFilter]);

  const filterOptions = [
    { id: 'all', label: 'Alle', color: 'bg-slate-500', icon: Filter },
    { id: 'healthy', label: 'Vital', color: 'bg-emerald-600', icon: CheckCircle2 },
    { id: 'warning', label: 'Warnung', color: 'bg-yellow-500', icon: AlertTriangle },
    { id: 'critical', label: 'Kritisch', color: 'bg-red-500', icon: AlertCircle },
  ];

  useEffect(() => {
    if (initialSelectedId) {
      const tree = trees.find(t => t.id === initialSelectedId);
      if (tree) {
        setSelectedTree(tree);
        handleStartNavigation(tree);
        onClearSelection();
      }
    }
  }, [initialSelectedId, trees, onClearSelection]);

  return (
    <div className="w-full h-full relative border-t border-slate-200 overflow-hidden">
      
      {/* FILTER BAR OVERLAY */}
      {!isAddingMode && (
        <div className="absolute top-4 left-0 right-0 z-[500] px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-lg transition-all active:scale-95 ${
                  activeFilter === opt.id 
                    ? `${opt.color} text-white border-transparent` 
                    : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200'
                }`}
              >
                <opt.icon size={14} />
                <span className="text-[11px] font-black uppercase tracking-wider">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TOUR MODE TOGGLE & STATUS */}
      {!isAddingMode && (
        <div className="absolute top-20 right-4 z-[500] flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-[9px] font-black text-slate-400 uppercase">Hilfe</span>
            <InfoBox 
              title="Tour-Modus" 
              description="Im Tour-Modus (blau) kannst du Bäume per Klick zur Tagesroute hinzufügen. Die Route berechnet automatisch den Weg ab deinem Standort."
              proTip="Du kannst die Reihenfolge der Stopps direkt im Baum-Detail mit den Pfeiltasten anpassen."
            />
          </div>
          <button 
            onClick={() => setIsTourMode(!isTourMode)}
            className={`p-4 rounded-2xl shadow-2xl transition-all border-2 active:scale-95 ${
              isTourMode ? 'bg-blue-600 text-white border-blue-400' : 'bg-white text-slate-600 border-slate-100'
            }`}
          >
            <Route size={24} strokeWidth={isTourMode ? 3 : 2} />
          </button>
        </div>
      )}

      {/* TOUR STATUS BADGE */}
      {isTourMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] pointer-events-none text-slate-900">
          <Badge className="bg-blue-600 text-white px-4 py-2 shadow-xl border-none flex gap-2 items-center animate-in slide-in-from-top-4">
            <ListPlus size={14} />
            <span className="uppercase font-black text-[10px] tracking-widest">Planung: {tour.length} Stopps</span>
          </Badge>
        </div>
      )}

      {/* FAB - Ad-hoc Erfassung */}
      {!isAddingMode && !isTourMode && (
        <button 
          onClick={() => setIsAddingMode(true)}
          className="absolute bottom-36 right-4 z-[500] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center gap-3 border-2 border-white/20"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-sm font-black uppercase tracking-widest">Baum erfassen</span>
        </button>
      )}

      {/* FADENKREUZ (Add Mode) */}
      {isAddingMode && (
        <>
          <div className="absolute inset-0 z-[499] pointer-events-none flex items-center justify-center">
             <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-500 rounded-full animate-ping opacity-30"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-emerald-500"></div>
              <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-emerald-600 drop-shadow-md" size={40} fill="white" />
            </div>
          </div>
          <div className="absolute bottom-28 left-4 right-4 z-[500] flex flex-col gap-2">
             <Button 
               className="w-full h-16 rounded-2xl shadow-2xl bg-emerald-600 text-lg font-black uppercase"
               onClick={() => { setIsAddingMode(false); setIsAddSheetOpen(true); }}
             >
               Position bestätigen
             </Button>
             <Button variant="secondary" className="w-full h-12 rounded-xl bg-white/90 font-bold uppercase text-xs" onClick={() => setIsAddingMode(false)}>
               Abbrechen
             </Button>
          </div>
        </>
      )}

      <MapContainer center={TEAM_POSITION} zoom={16} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {isAddingMode && <MapCenterTracker onCenterChange={setMapCenter} />}
        {activeFilter !== 'all' && <MapBoundsHandler trees={filteredTrees} />}
        {selectedTree && <MapFocusHandler target={[selectedTree.location.lat, selectedTree.location.lng]} />}

        {filteredTrees.map((tree) => {
          const tourIndex = tour.indexOf(tree.id);
          const isInTour = tourIndex !== -1;
          const hasOpenTask = tasks.some(t => t.treeId === tree.id && t.status === 'offen');

          return (
            <Marker 
              key={tree.id} 
              position={[tree.location.lat, tree.location.lng]}
              icon={isInTour && isTourMode ? createTourIcon(tourIndex, hasOpenTask) : createCustomIcon(tree.status, tree.idNumber, hasOpenTask)}
              eventHandlers={{ 
                click: () => { 
                  if (isTourMode) {
                    if (isInTour) { setSelectedTree(tree); setIsFormOpen(false); } 
                    else { onToggleTourTree(tree.id); }
                  } else {
                    setSelectedTree(tree); setIsFormOpen(false); 
                  }
                } 
              }}
            />
          );
        })}

        <Marker position={TEAM_POSITION} icon={L.divIcon({ 
          html: renderToStaticMarkup(<div className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white"><Navigation size={16} fill="currentColor" /></div>),
          className: 'team-icon'
        })} />

        {isTourMode && tourCoords && <Polyline positions={tourCoords} pathOptions={{ color: '#2563eb', weight: 4, dashArray: '1, 10', opacity: 0.7 }} />}
        {!isTourMode && routeCoords && <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }} />}
      </MapContainer>

      {/* Navigations-Overlay Badge */}
      {routeCoords && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2">
          <Badge className="bg-blue-600 text-white px-4 py-1.5 shadow-xl border-none animate-pulse">Navigation aktiv</Badge>
          <Button variant="secondary" className="bg-white/90 shadow-md h-7 px-3 text-[10px] font-black uppercase rounded-full" onClick={() => setRouteCoords(null)}>Abbrechen</Button>
        </div>
      )}

      {/* Legende */}
      <div className="absolute bottom-5 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border border-slate-100 flex justify-between items-center z-[490]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vital</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prüfung</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kritisch</span>
        </div>
      </div>

      {/* SHEET FÜR BESTEHENDE BÄUME */}
      <Sheet open={!!selectedTree} onOpenChange={(open) => !open && setSelectedTree(null)}>
        <SheetContent>
          {selectedTree && (
            !isFormOpen ? (
              <div className="space-y-6">
                <SheetHeader>
                  <div className="flex justify-between items-start text-slate-900">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedTree.idNumber}</span>
                      <SheetTitle className="text-2xl">{selectedTree.species}</SheetTitle>
                      <p className="text-sm text-slate-400 italic">{selectedTree.latinName}</p>
                    </div>
                    <Badge variant={selectedTree.status === 'critical' ? 'destructive' : 'secondary'}>{selectedTree.status.toUpperCase()}</Badge>
                  </div>
                </SheetHeader>

                {/* TOUR-STEUERUNG IM SHEET */}
                {isTourMode && tour.includes(selectedTree.id) && (
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex justify-between items-center text-slate-900">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <Route size={12} /> Stopp #{tour.indexOf(selectedTree.id) + 1}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase p-0 px-2" onClick={() => { onToggleTourTree(selectedTree.id); setSelectedTree(null); }}>
                        <Trash2 size={12} className="mr-1" /> Entfernen
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-10 bg-white border-blue-200 text-blue-600" disabled={tour.indexOf(selectedTree.id) === 0} onClick={() => {
                          const idx = tour.indexOf(selectedTree.id);
                          const newTour = [...tour];
                          [newTour[idx], newTour[idx-1]] = [newTour[idx-1], newTour[idx]];
                          onReorderTour(newTour);
                        }}>
                        <ArrowUp size={16} />
                      </Button>
                      <Button variant="outline" className="flex-1 h-10 bg-white border-blue-200 text-blue-600" disabled={tour.indexOf(selectedTree.id) === tour.length - 1} onClick={() => {
                          const idx = tour.indexOf(selectedTree.id);
                          const newTour = [...tour];
                          [newTour[idx], newTour[idx+1]] = [newTour[idx+1], newTour[idx]];
                          onReorderTour(newTour);
                        }}>
                        <ArrowDown size={16} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 border border-slate-100 text-slate-900">
                    <div className="text-primary bg-primary/10 p-2 rounded-lg"><Ruler size={18} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Höhe</p>
                      <p className="font-bold">{selectedTree.height}m</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 border border-slate-100 text-slate-900">
                    <div className="text-primary bg-primary/10 p-2 rounded-lg"><Activity size={18} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Umfang</p>
                      <p className="font-bold">{selectedTree.trunkCircumference}cm</p>
                    </div>
                  </div>
                </div>

                {/* SCHNELL-PLANUNG */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarPlus size={12} /> Schnell-Planung</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Kronenpflege', 'Kontrolle', 'Totholz entfernen'].map((type) => (
                      <Button key={type} variant="outline" className="h-8 text-[9px] font-black uppercase border-slate-200 rounded-lg px-3 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" onClick={() => handleQuickPlan(type as any)}>
                        + {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* HISTORIE */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ClipboardCheck size={12} /> Historie</h4>
                  <div className="space-y-3 max-h-[120px] overflow-y-auto pr-1 text-slate-900">
                    {treeTasks.length > 0 ? (
                        treeTasks.map(task => (
                            <div key={task.id} className={`p-3 rounded-xl border shadow-sm space-y-1 ${task.status === 'erledigt' ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-slate-800 text-[10px] uppercase tracking-tight">{task.type}</span>
                                    <Badge variant="outline" className="text-[8px] font-bold py-0">{task.status}</Badge>
                                </div>
                            </div>
                        ))
                    ) : ( <p className="text-[10px] text-slate-400 text-center py-2">Keine Historie</p> )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  <Button variant="outline" className="col-span-2 h-14 rounded-2xl border-slate-200 flex flex-col gap-1 items-center justify-center group text-slate-900" onClick={() => handleStartNavigation(selectedTree)}>
                    <Navigation size={18} className="text-blue-600 group-active:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Anfahrt</span>
                  </Button>
                  <Button className="col-span-3 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-emerald-600" onClick={() => setIsFormOpen(true)}>
                    {activeTask ? 'Maßnahme fortführen' : 'Maßnahme starten'}
                  </Button>
                </div>
              </div>
            ) : (
              <MaintenanceForm 
                tree={selectedTree} 
                existingTask={activeTask} 
                onCancel={() => setIsFormOpen(false)} 
                onSave={(newTask) => {
                  onCompleteTask(newTask); 
                  showToast("Maßnahme erfolgreich dokumentiert", "success");
                  setIsFormOpen(false);
                  setSelectedTree(null);
                }} 
              />
            )
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <AddTreeForm coords={mapCenter} onCancel={() => setIsAddSheetOpen(false)} onSave={(newTree) => { onAddTree(newTree); setIsAddSheetOpen(false); setSelectedTree(newTree); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}