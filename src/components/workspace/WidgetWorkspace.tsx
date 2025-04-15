
import React, { useState, useRef } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { RiskExposureWidget } from "./widgets/RiskExposureWidget";
import { CounterpartyAnalysisWidget } from "./widgets/CounterpartyAnalysisWidget";
import { MarketVolatilityWidget } from "./widgets/MarketVolatilityWidget";
import { RiskAlertsWidget } from "./widgets/RiskAlertsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizableWidget } from "./ResizableWidget";
import { useToast } from "@/hooks/use-toast";

const widgetComponents: Record<string, React.FC<any>> = {
  "risk-exposure": RiskExposureWidget,
  "counterparty-analysis": CounterpartyAnalysisWidget,
  "market-volatility": MarketVolatilityWidget,
  "portfolio-heatmap": MarketVolatilityWidget, // Reusing for demo
  "transaction-volume": CounterpartyAnalysisWidget, // Reusing for demo
  "risk-alerts": RiskAlertsWidget,
};

export function WidgetWorkspace() {
  const { placedWidgets, removeWidget, reorderWidgets } = useWorkspace();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const findOptimalPosition = () => {
    if (!workspaceRef.current) return;

    const widgets = workspaceRef.current.querySelectorAll('[data-widget-id]');
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const occupiedSpaces: Array<DOMRect> = [];

    widgets.forEach((widget) => {
      const rect = widget.getBoundingClientRect();
      occupiedSpaces.push(rect);
    });

    // Start with a position at the top
    let optimalY = 16; // Initial padding
    
    // Find the first available vertical space
    occupiedSpaces.sort((a, b) => a.top - b.top).forEach((space) => {
      if (space.bottom + 16 > optimalY) {
        optimalY = space.bottom + 16; // Add padding
      }
    });

    return optimalY;
  };

  const handleWidgetRemove = (id: string) => {
    removeWidget(id);
    toast({
      title: "Widget removed",
      description: "The widget has been removed from your workspace"
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    if (result.destination && 
        result.source.droppableId === "workspace" && 
        result.destination.droppableId === "workspace" &&
        result.source.index !== result.destination.index) {
      
      reorderWidgets(result.source.index, result.destination.index);
      
      toast({
        title: "Widget repositioned",
        description: "The widget has been moved to a new position"
      });
    }
  };

  return (
    <div className="relative h-full" id="widget-workspace-container">
      <Droppable droppableId="workspace" direction="vertical" type="WIDGET">
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              if (workspaceRef.current !== el) {
                workspaceRef.current = el;
              }
            }}
            {...provided.droppableProps}
            className={`
              h-full p-4 overflow-auto ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4 auto-rows-min
              ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}
            `}
            style={{ display: 'block' }}
            data-droppable="true"
          >
            {placedWidgets.map((widget, index) => {
              const WidgetComponent = widgetComponents[widget.type];
              const optimalY = findOptimalPosition();
              
              return (
                <Draggable 
                  key={widget.id} 
                  draggableId={`placed-${widget.id}`} 
                  index={index}
                  disableInteractiveElementBlocking={true}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`min-h-[300px] w-full ${snapshot.isDragging ? "opacity-70" : ""}`}
                      style={{
                        ...provided.draggableProps.style,
                        position: 'absolute',
                        top: optimalY ? `${optimalY}px` : '16px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ResizableWidget 
                        id={widget.id}
                        onClose={() => handleWidgetRemove(widget.id)}
                      >
                        <WidgetComponent widget={widget} />
                      </ResizableWidget>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {placedWidgets.length === 0 && (
              <div className="col-span-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm mb-2">Drag widgets here to build your workspace</p>
                <p className="text-xs">
                  Add widgets from the gallery on the left or use the chatbot on the right
                </p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
