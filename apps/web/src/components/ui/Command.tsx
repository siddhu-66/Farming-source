import * as React from "react"
import { Dialog } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"

export const CommandDialog = ({ children, open, onOpenChange }: any) => {
  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)} className="p-0">
      <div className="overflow-hidden p-0 shadow-lg">
        <div className="flex flex-col">{children}</div>
      </div>
    </Dialog>
  )
}

export const CommandInput = ({ placeholder, ...props }: any) => {
  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Input
        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none shadow-none focus-visible:ring-0"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

export const CommandList = ({ children }: any) => {
  return (
    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
      {children}
    </div>
  )
}

export const CommandEmpty = ({ children }: any) => {
  return <div className="py-6 text-center text-sm">{children}</div>
}

export const CommandGroup = ({ heading, children }: any) => {
  return (
    <div className="overflow-hidden p-1 text-foreground">
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
}

export const CommandItem = ({ children, onSelect }: any) => {
  return (
    <div
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
      onClick={onSelect}
    >
      {children}
    </div>
  )
}
