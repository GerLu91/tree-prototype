import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  TreeDeciduous, MapPin, Ruler, 
  Activity, Info, AlertCircle 
} from "lucide-react";

export function AddTreeForm({ onSave, onCancel, coords }: { 
  onSave: (tree: any) => void, 
  onCancel: () => void,
  coords: { lat: number, lng: number }
}) {
  const [species, setSpecies] = useState("");
  const [status, setStatus] = useState("healthy");
  const [height, setHeight] = useState("");
  const [circumference, setCircumference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const newTree = {
      id: Math.random().toString(36).substr(2, 9),
      idNumber: `NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      species: species || "Unbekannte Art",
      status: status,
      location: {
        lat: coords.lat,
        lng: coords.lng,
        address: "Manuell erfasst"
      },
      nextCheck: new Date().toISOString(),
      // Technische Daten konvertieren
      height: parseFloat(height) || 0,
      trunkCircumference: parseFloat(circumference) || 0,
      notes: notes || "Neu erfasster Baum im Feld."
    };
    onSave(newTree);
  };

  return (
    <div className="space-y-6 pb-8 max-h-[85vh] overflow-y-auto pr-2 text-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
          <TreeDeciduous size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Neuer Baum</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} className="text-emerald-500" /> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Baumart */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            Art / Gattung
          </label>
          <Input 
            placeholder="z.B. Winter-Linde" 
            value={species} 
            onChange={e => setSpecies(e.target.value)}
            className="h-12 font-bold focus-visible:ring-emerald-500"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
             Gesundheitszustand
          </label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="healthy">Vital</option>
            <option value="warning">Prüfung nötig</option>
            <option value="critical">Gefahr im Verzug</option>
          </select>
        </div>

        {/* Technische Daten (Grid) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Ruler size={12} className="text-emerald-600" /> Höhe (m)
            </label>
            <Input 
              type="number" 
              placeholder="0" 
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="h-12 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Activity size={12} className="text-emerald-600" /> Umfang (cm)
            </label>
            <Input 
              type="number" 
              placeholder="0" 
              value={circumference}
              onChange={e => setCircumference(e.target.value)}
              className="h-12 font-bold"
            />
          </div>
        </div>

        {/* Notizfeld */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Info size={12} className="text-emerald-600" /> Zusätzliche Notizen
          </label>
          <Textarea 
            placeholder="Besonderheiten, Umfeldbedingungen..." 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[100px] font-medium"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest border-slate-200" 
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button 
          className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700" 
          onClick={handleSubmit}
        >
          Baum anlegen
        </Button>
      </div>
    </div>
  );
}