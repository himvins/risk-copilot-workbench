
import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";

interface ResizableWidgetProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const ResizableWidget: React.FC<ResizableWidgetProps> = ({ 
  children, 
  onClose,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleResize = () => {
    setIsExpanded(!isExpanded);
    toast({
      title: isExpanded ? "Widget collapsed" : "Widget expanded",
      description: "You can resize the widget using the resize handles"
    });
  };

  return (
    <div className={`relative bg-card rounded-lg shadow-lg border border-border ${className} ${
      isExpanded ? 'z-10 absolute inset-4' : 'z-0'
    }`}>
      <div className="absolute top-2 right-2 flex items-center space-x-1">
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
      <ResizablePanelGroup direction="vertical" className="min-h-[300px]">
        <ResizablePanel defaultSize={100} minSize={30}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={100} minSize={30}>
              <div className="p-4 pt-10">
                {children}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
