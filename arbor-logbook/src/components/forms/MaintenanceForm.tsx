import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Clock, HardHat, Info, Camera, Truck, 
  Trash2, Image as ImageIcon, CheckCircle2, X 
} from "lucide-react";
import type { Tree, MaintenanceTask } from "@/types";

interface MaintenanceFormProps {
  tree: Tree;
  existingTask?: MaintenanceTask; // Optionaler Task aus der Planung
  onSave: (task: MaintenanceTask) => void;
  onCancel: () => void;
}

export function MaintenanceForm({ tree, existingTask, onSave, onCancel }: MaintenanceFormProps) {
  // States initialisieren (bevorzugt aus bestehendem Task)
  const [type, setType] = useState<MaintenanceTask['type']>(existingTask?.type || "Kronenpflege");
  const [duration, setDuration] = useState("1.0");
  const [notes, setNotes] = useState(existingTask?.notes || "");
  const [woodChips, setWoodChips] = useState("Keines");
  const [image, setImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Finales Task-Objekt zusammenbauen
    const taskData: MaintenanceTask = {
      // Wenn bereits geplant, ID behalten, sonst neu
      id: existingTask?.id || crypto.randomUUID(), 
      treeId: tree.id,
      type,
      status: 'erledigt', // <--- Wichtig für den Flow
      priority: existingTask?.priority || (tree.status === 'critical' ? 'hoch' : 'mittel'),
      dueDate: new Date().toISOString(),
      duration: duration + " h",
      woodChips: woodChips !== "Keines" ? woodChips : undefined,
      image: image || undefined,
      notes 
    };
    onSave(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10 max-h-[85vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 border-slate-100">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{tree.idNumber}</span>
          <h3 className="text-xl font-black text-slate-900 leading-tight italic uppercase">
            {existingTask ? 'Maßnahme abschließen' : 'Maßnahme erfassen'}
          </h3>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="rounded-full h-8 w-8">
          <X size={18} />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Arbeitstyp */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <HardHat size={12} /> Arbeitstyp
          </label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
          >
            <option value="Kronenpflege">Kronenpflege</option>
            <option value="Totholz entfernen">Totholz entfernen</option>
            <option value="Lichtraumprofil">Lichtraumprofil</option>
            <option value="Fällung">Fällung</option>
            <option value="Kontrolle">Kontrolle</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> Dauer (h)
            </label>
            <Input 
              type="number" step="0.5" 
              className="h-12 font-bold text-slate-900 rounded-xl"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Truck size={12} /> Häckselgut
            </label>
            <select 
              value={woodChips}
              onChange={(e) => setWoodChips(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none appearance-none"
            >
              <option value="Keines">Keines</option>
              <option value="0.5 Container">0.5 Container</option>
              <option value="1 Container">1 Container</option>
              <option value="2 Container">2 Container</option>
            </select>
          </div>
        </div>

        {/* Notizen */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Info size={12} /> Notizen / Befund
          </label>
          <Textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] rounded-xl text-slate-900 border-slate-200"
            placeholder="Besonderheiten vor Ort..." 
          />
        </div>

        {/* Foto */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Camera size={12} /> Foto-Dokumentation
          </label>
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <ImageIcon className="text-slate-300 group-hover:text-emerald-600 mb-2" size={24} />
              <p className="text-xs font-bold text-slate-500 uppercase">Foto aufnehmen</p>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" capture="environment" className="hidden" />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-xl">
              <img src={image} alt="Vorschau" className="w-full h-48 object-cover" />
              <button type="button" onClick={() => setImage(null)} className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase text-slate-500" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button 
          type="submit"
          className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700 flex gap-2" 
        >
          <CheckCircle2 size={18} />
          {existingTask ? 'Abschließen' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}