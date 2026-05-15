import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[9999] w-full bg-white p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200 inset-x-0 bottom-0 border-t border-slate-100 rounded-t-[32px] max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {/* Ein kleiner Handle oben, damit es wie ein Mobile Sheet aussieht */}
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 -mt-2" />
      
      {children}
      
      <SheetPrimitive.Close className="absolute right-6 top-6 rounded-full p-2 bg-slate-100 opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
        <X className="h-4 w-4 text-slate-500" />
        <span className="sr-only">Schließen</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-black text-slate-900 leading-none", className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle }