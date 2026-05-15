import { useState, useRef } from "react"; // useRef für File-Input
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Clock, HardHat, Info, Camera, Truck, Trash2, Image as ImageIcon } from "lucide-react";
import type { Tree } from "@/types";

interface MaintenanceFormProps {
  tree: Tree;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function MaintenanceForm({ tree, onSave, onCancel }: MaintenanceFormProps) {
  const [type, setType] = useState("Kronenpflege");
  const [duration, setDuration] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [woodChips, setWoodChips] = useState("Keines"); // NEU: Häckselgut
  const [image, setImage] = useState<string | null>(null); // NEU: Foto-State
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Foto-Logik
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // Speichert Base64 (wird im LocalStorage persistiert!)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      treeId: tree.id,
      type,
      status: 'erledigt',
      priority: 'mittel',
      dueDate: new Date().toISOString(),
      duration: duration + " h",
      woodChips, // NEU im Objekt
      image,     // NEU im Objekt
      notes 
    };
    onSave(newTask);
  };

  return (
    <div className="space-y-6 pb-8 max-h-[80vh] overflow-y-auto pr-2">
      <div>
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{tree.idNumber}</span>
        <h3 className="text-xl font-black text-slate-900 leading-tight">Maßnahme dokumentieren</h3>
      </div>

      <div className="space-y-5">
        {/* Arbeitstyp */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <HardHat size={12} /> Arbeitstyp
          </label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="Kronenpflege">Kronenpflege</option>
            <option value="Totholz entfernen">Totholz entfernen</option>
            <option value="Lichtraumprofil">Lichtraumprofil</option>
            <option value="Fällung">Fällung</option>
            <option value="Sicherung">Sicherung</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Dauer */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> Dauer (h)
            </label>
            <Input 
              type="number" 
              step="0.5" 
              className="h-12 font-bold"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Häckselgut */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Truck size={12} /> Häckselgut
            </label>
            <select 
              value={woodChips}
              onChange={(e) => setWoodChips(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
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
            <Info size={12} /> Notizen
          </label>
          <Textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
            placeholder="Besonderheiten vor Ort..." 
          />
        </div>

        {/* FOTO-UPLOAD (NEU) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Camera size={12} /> Fotodokumentation
          </label>
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="bg-white p-3 rounded-full shadow-sm text-slate-400 mb-2">
                <ImageIcon size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Foto aufnehmen</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200">
              <img src={image} alt="Vorschau" className="w-full h-40 object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest" 
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button 
          className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary" 
          onClick={handleSubmit}
        >
          Abschließen
        </Button>
      </div>
    </div>
  );
}