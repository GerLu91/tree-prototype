import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.Fragment

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
const TabsList = ({ className, ...props }: TabsListProps) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  />
)

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeValue?: string;
  setActiveValue?: (val: string) => void;
}
const TabsTrigger = ({ className, value, activeValue, setActiveValue, ...props }: TabsTriggerProps) => (
  <button
    type="button"
    onClick={() => setActiveValue?.(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeValue === value
        ? "bg-white text-slate-950 shadow-sm"
        : "hover:bg-white/50 hover:text-slate-900",
      className
    )}
    {...props}
  />
)

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue?: string;
}
const TabsContent = ({ className, value, activeValue, ...props }: TabsContentProps) => {
  if (value !== activeValue) return null;
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }