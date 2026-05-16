import * as React from "react"
import { 
  HelpCircle, X, Lightbulb, Info
} from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface InfoBoxProps {
  title: string;
  description: string;
  proTip?: string;
  className?: string;
}

export function InfoBox({ title, description, proTip, className }: InfoBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={cn("text-slate-400 hover:text-emerald-600 transition-colors p-1", className)}
      >
        <HelpCircle size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Content */}
          <div className="relative bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                  <Info size={24} />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full -mr-2 -mt-2 h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {proTip && (
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex gap-3">
                  <Lightbulb size={24} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-800 font-medium leading-snug">
                    <span className="font-black uppercase block mb-0.5">Pro-Tipp</span>
                    {proTip}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase text-[11px] tracking-widest"
              >
                Verstanden
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}