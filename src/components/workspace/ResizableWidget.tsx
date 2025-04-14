
import React, { useState, useRef } from 'react';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";

interface ResizableWidgetProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  id: string; // For tracking widget positions
}

export const ResizableWidget: React.FC<ResizableWidgetProps> = ({ 
  children, 
  onClose,
  className = '',
  id
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dimensions, setDimensions] = useState({ height: 300, width: '100%' });
  const widgetRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // For resize tracking
  const startResizePosition = useRef<{ x: number, y: number } | null>(null);
  const startDimensions = useRef<{ height: number, width: number }>({ height: 300, width: 0 });

  const handleResize = () => {
    setIsExpanded(!isExpanded);
    toast({
      title: isExpanded ? "Widget collapsed" : "Widget expanded",
      description: "You can resize the widget using the resize handles"
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startResizePosition.current = { x: e.clientX, y: e.clientY };
    
    if (widgetRef.current) {
      startDimensions.current = {
        height: widgetRef.current.clientHeight,
        width: widgetRef.current.clientWidth
      };
    }
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    toast({
      title: "Resizing widget",
      description: "Drag to resize the widget"
    });
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (!startResizePosition.current) return;
    
    const deltaX = e.clientX - startResizePosition.current.x;
    const deltaY = e.clientY - startResizePosition.current.y;
    
    setDimensions({
      height: Math.max(200, startDimensions.current.height + deltaY),
      width: `${Math.max(200, startDimensions.current.width + deltaX)}px`
    });
  };
  
  const handleResizeEnd = () => {
    startResizePosition.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Return custom dimensions for expanded state
  const getWidgetStyle = () => {
    if (isExpanded) {
      return {
        zIndex: 10,
        position: 'absolute' as const,
        inset: '1rem',
        height: 'calc(100% - 2rem)',
        width: 'calc(100% - 2rem)'
      };
    }
    
    return {
      height: `${dimensions.height}px`,
      width: dimensions.width,
      zIndex: 0
    };
  };

  return (
    <div 
      ref={widgetRef}
      className={`relative bg-card rounded-lg shadow-lg border border-border ${className}`}
      style={getWidgetStyle()}
      data-widget-id={id}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-1 z-20">
        <button
          onClick={handleResize}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label={isExpanded ? "Minimize widget" : "Maximize widget"}
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close widget"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Resize handle for manual resizing */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
        onMouseDown={handleResizeStart}
      >
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-transparent border-b-[6px] border-b-muted-foreground border-r-[6px] border-r-muted-foreground" />
      </div>
      
      {/* Move handle */}
      <div className="absolute top-2 left-2 p-1 hover:bg-muted rounded-md transition-colors z-20 cursor-move" aria-label="Move widget">
        <Move size={16} className="text-muted-foreground" />
      </div>
      
      <div className="p-4 pt-10 h-full overflow-auto">
        {children}
      </div>
    </div>
  );
};
