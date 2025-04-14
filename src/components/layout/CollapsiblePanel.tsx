
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResizablePanel } from "@/components/ui/resizable";

interface CollapsiblePanelProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  side: "left" | "right";
  defaultSize: number;
  minSize: number;
  maxSize?: number;
}

export function CollapsiblePanel({
  children,
  isCollapsed,
  onToggle,
  side,
  defaultSize,
  minSize,
  maxSize,
}: CollapsiblePanelProps) {
  return (
    <ResizablePanel 
      defaultSize={defaultSize} 
      minSize={isCollapsed ? 3 : minSize}
      maxSize={maxSize}
      className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : ''}`}
    >
      <div className="relative h-full">
        <button 
          onClick={onToggle}
          className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-4 z-10 bg-card border border-border ${
            side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'
          } p-1.5 shadow-md hover:bg-muted transition-colors`}
          aria-label={isCollapsed ? `Expand ${side} panel` : `Collapse ${side} panel`}
        >
          {side === 'left' 
            ? (isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)
            : (isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)
          }
        </button>
        
        <div className={`w-full transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
          {children}
        </div>
      </div>
    </ResizablePanel>
  );
}
