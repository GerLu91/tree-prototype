import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Ruler, Activity, ClipboardCheck, Navigation, 
  CheckCircle2, Filter, AlertTriangle, AlertCircle, Wrench, Plus, 
  Route, ListPlus
} from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceForm } from '@/components/forms/MaintenanceForm';
import { AddTreeForm } from '@/components/forms/AddTreeForm';
import type { MaintenanceTask, Tree } from '@/types';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});


const TEAM_POSITION: [number, number] = [49.4505, 11.0820]; 

// Hilfskomponente für Kamera-Flug
function MapFocusHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Hilfskomponente zum automatischen Anpassen des Kartenausschnitts
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

// Tracker für die Kartenmitte (für die Ad-hoc Erfassung)
function MapCenterTracker({ onCenterChange }: { onCenterChange: (coords: {lat: number, lng: number}) => void }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    }
  });
  return null;
}

const createCustomIcon = (status: string, idNumber: string) => {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#059669';
  const html = renderToStaticMarkup(
    <div className="relative flex flex-col items-center">
      <div style={{ backgroundColor: color }} className="p-1.5 rounded-full border-2 border-white shadow-xl text-white">
        <MapPin size={18} />
      </div>
      <div className="bg-white/90 backdrop-blur-sm px-1 py-0.5 rounded text-[9px] font-black mt-0.5 shadow-sm border border-slate-200 text-slate-800 whitespace-nowrap">
        {idNumber}
      </div>
    </div>
  );
  return L.divIcon({ html, className: 'custom-tree-icon', iconSize: [40, 40], iconAnchor: [20, 40] });
};

// Spezielles Icon für Tour-Stopps
const createTourIcon = (index: number) => {
  const html = renderToStaticMarkup(
    <div className="relative flex flex-col items-center scale-110">
      <div className="bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-xl text-white">
        <MapPin size={18} fill="white" />
      </div>
      <div className="bg-blue-700 text-white px-2 py-0.5 rounded-full text-[10px] font-black -mt-2 shadow-lg z-10 border border-white">
        {index + 1}
      </div>
    </div>
  );
  return L.divIcon({ html, className: 'tour-marker-icon', iconSize: [40, 40], iconAnchor: [20, 40] });
};

interface TreeViewProps {
  trees: Tree[];
  onAddTree: (tree: Tree) => void;
  tasks: MaintenanceTask[];
  onAddTask: (task: any) => void;
  initialSelectedId: string | null;
  onClearSelection: () => void;
  tour: string[];
  onToggleTourTree: (id: string) => void;
}

export function TreeView({ 
  trees, onAddTree, tasks, onAddTask, initialSelectedId, onClearSelection,
  tour, onToggleTourTree 
}: TreeViewProps) {
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // States für Ad-hoc Erfassung
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 49.4521, lng: 11.0767 });

  // NEU: Tour-Modus State
  const [isTourMode, setIsTourMode] = useState(false);

  const treeTasks = useMemo(() => {
    return tasks.filter(t => t.treeId === selectedTree?.id);
  }, [tasks, selectedTree]);

  // NEU: Berechnung der Tour-Linie
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
    setIsTourMode(false); // Navigation beendet Tour-Planung-Sicht
    setRouteCoords([TEAM_POSITION, [tree.location.lat, tree.location.lng]]);
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
    { id: 'maintenance', label: 'Maßnahme', color: 'bg-blue-500', icon: Wrench },
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
    <div className="w-full h-[calc(100vh-130px)] relative border-t border-slate-200 overflow-hidden">
      
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
          <button 
            onClick={() => setIsTourMode(!isTourMode)}
            className={`p-4 rounded-2xl shadow-2xl transition-all border-2 active:scale-95 ${
              isTourMode 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-white text-slate-600 border-slate-100'
            }`}
          >
            <Route size={24} strokeWidth={isTourMode ? 3 : 2} />
          </button>
        </div>
      )}

      {/* TOUR STATUS BADGE */}
      {isTourMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
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
          className="absolute bottom-28 right-4 z-[500] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center gap-3 border-2 border-white/20"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-sm font-black uppercase tracking-widest">Baum erfassen</span>
        </button>
      )}

      {/* FADENKREUZ */}
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
               onClick={() => {
                 setIsAddingMode(false);
                 setIsAddSheetOpen(true);
               }}
             >
               Position bestätigen
             </Button>
             <Button 
               variant="secondary"
               className="w-full h-12 rounded-xl bg-white/90 font-bold uppercase text-xs"
               onClick={() => setIsAddingMode(false)}
             >
               Abbrechen
             </Button>
          </div>
        </>
      )}

      <MapContainer center={TEAM_POSITION} zoom={16} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {isAddingMode && <MapCenterTracker onCenterChange={setMapCenter} />}
        {activeFilter !== 'all' && <MapBoundsHandler trees={filteredTrees} />}
        {selectedTree && <MapFocusHandler target={[selectedTree.location.lat, selectedTree.location.lng]} />}

        {filteredTrees.map((tree) => {
          const tourIndex = tour.indexOf(tree.id);
          const isInTour = tourIndex !== -1;

          return (
            <Marker 
              key={tree.id} 
              position={[tree.location.lat, tree.location.lng]}
              icon={isInTour && isTourMode ? createTourIcon(tourIndex) : createCustomIcon(tree.status, tree.idNumber)}
              eventHandlers={{ 
                click: () => { 
                  if (isTourMode) {
                    onToggleTourTree(tree.id);
                  } else {
                    setSelectedTree(tree); 
                    setIsFormOpen(false); 
                  }
                } 
              }}
            />
          );
        })}

        <Marker 
          position={TEAM_POSITION} 
          icon={L.divIcon({ 
            html: renderToStaticMarkup(
              <div className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white">
                <Navigation size={16} fill="currentColor" /> 
              </div>
            ),
            className: 'team-icon'
          })} 
        />

        {/* TOUR LINIE */}
        {isTourMode && tourCoords && (
          <Polyline 
            positions={tourCoords} 
            pathOptions={{ color: '#2563eb', weight: 4, dashArray: '1, 10', opacity: 0.7 }} 
          />
        )}

        {/* EINZEL-NAVIGATION LINIE */}
        {!isTourMode && routeCoords && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }} 
          />
        )}
      </MapContainer>

      {/* Navigations-Overlay Badge */}
      {routeCoords && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2">
          <Badge className="bg-blue-600 text-white px-4 py-1.5 shadow-xl border-none animate-pulse">
            Navigation aktiv
          </Badge>
          <Button 
            variant="secondary" 
            className="bg-white/90 shadow-md h-7 px-3 text-[10px] font-black uppercase rounded-full"
            onClick={() => setRouteCoords(null)}
          >
            Abbrechen
          </Button>
        </div>
      )}

      {/* Legende */}
      <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-slate-100 flex justify-between items-center z-[500]">
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
                    <Badge variant={selectedTree.status === 'critical' ? 'destructive' : 'secondary'}>
                      {selectedTree.status.toUpperCase()}
                    </Badge>
                  </div>
                </SheetHeader>
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
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ClipboardCheck size={12} /> Historie
                  </h4>
                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {treeTasks.length > 0 ? (
                        treeTasks.map(task => (
                            <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-1">
                                <div className="flex justify-between items-center text-slate-900">
                                    <span className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{task.type}</span>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] text-slate-400 text-center py-2">Keine Historie</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 pt-2">
                  <Button 
                    variant="outline"
                    className="col-span-2 h-14 rounded-2xl border-slate-200 flex flex-col gap-1 items-center justify-center group text-slate-900"
                    onClick={() => handleStartNavigation(selectedTree)}
                  >
                    <Navigation size={18} className="text-blue-600 group-active:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Anfahrt</span>
                  </Button>
                  <Button 
                    className="col-span-3 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    onClick={() => setIsFormOpen(true)}
                  >
                    Maßnahme
                  </Button>
                </div>
              </div>
            ) : (
              <MaintenanceForm 
                tree={selectedTree} 
                onCancel={() => setIsFormOpen(false)} 
                onSave={(newTask) => {
                  onAddTask(newTask);
                  setIsFormOpen(false);
                }} 
              />
            )
          )}
        </SheetContent>
      </Sheet>

      {/* SHEET FÜR AD-HOC ERFASSUNG */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <AddTreeForm 
            coords={mapCenter} 
            onCancel={() => setIsAddSheetOpen(false)}
            onSave={(newTree) => {
              onAddTree(newTree);
              setIsAddSheetOpen(false);
              setSelectedTree(newTree);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}