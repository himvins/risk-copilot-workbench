
import React from 'react';
import { X } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  return (
    <div className={`relative bg-card rounded-lg shadow-lg border border-border ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Close widget"
        >
          <X size={16} />
        </button>
      )}
      <ResizablePanelGroup direction="vertical" className="min-h-[300px]">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="p-4">
                {children}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
