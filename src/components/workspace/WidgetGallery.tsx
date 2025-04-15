
import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BarChart3, Activity, LineChart, AlertCircle, Scale, DollarSign } from "lucide-react";
import { WidgetType } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface WidgetTemplate {
  type: WidgetType;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface WidgetGalleryProps {
  iconOnly?: boolean;
}

const availableWidgets: WidgetTemplate[] = [
  {
    type: "risk-exposure",
    title: "Risk Exposure",
    icon: <BarChart3 size={18} className="text-widget-accent" />,
    description: "View exposure across asset classes",
  },
  {
    type: "counterparty-analysis",
    title: "Counterparty Analysis",
    icon: <Scale size={18} className="text-widget-amber" />,
    description: "Analyze counterparty risk metrics",
  },
  {
    type: "market-volatility",
    title: "Market Volatility",
    icon: <Activity size={18} className="text-widget-green" />,
    description: "Track market volatility indices",
  },
  {
    type: "risk-alerts",
    title: "Risk Alerts",
    icon: <AlertCircle size={18} className="text-widget-red" />,
    description: "Recent risk threshold breaches",
  },
  {
    type: "portfolio-heatmap",
    title: "Portfolio Heatmap",
    icon: <LineChart size={18} className="text-widget-accent" />,
    description: "Visualize portfolio performance",
  },
  {
    type: "transaction-volume",
    title: "Transaction Volume",
    icon: <DollarSign size={18} className="text-widget-amber" />,
    description: "Monitor trading activity",
  }
];

export function WidgetGallery({ iconOnly = false }: WidgetGalleryProps) {
  const { placedWidgets, addWidgetByType } = useWorkspace();
  const isMobile = useIsMobile();
  
  // Filter out widgets that are already placed on the workspace
  const placedWidgetTypes = new Set(placedWidgets.map(w => w.type));
  
  return (
    <div className="h-full bg-secondary/30 p-3 overflow-y-auto">
      {!isMobile && !iconOnly && (
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2">Widget Gallery</h2>
          <p className="text-xs text-muted-foreground">
            Drag widgets to the workspace or click to add
          </p>
        </div>
      )}

      <Droppable droppableId="widget-gallery" isDropDisabled type="WIDGET">
        {(provided) => (
          <div 
            className={`space-y-2 ${iconOnly ? "flex flex-col items-center" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {availableWidgets.map((widget, index) => {
              const isPlaced = placedWidgetTypes.has(widget.type);
              
              return (
                <Draggable
                  key={`gallery-${widget.type}`}
                  draggableId={`gallery-${widget.type}`}
                  index={index}
                  isDragDisabled={isPlaced}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        ${iconOnly || isMobile ? "p-2 w-10" : "p-3"} rounded-md border cursor-pointer
                        ${snapshot.isDragging ? "opacity-50 ring-2 ring-primary" : ""}
                        ${isPlaced 
                          ? "bg-muted/20 border-border/50 text-muted-foreground" 
                          : "bg-card hover:bg-card/80 border-border"}
                      `}
                      onClick={() => 
                        !isPlaced && 
                        addWidgetByType(widget.type)
                      }
                    >
                      <div className={`flex ${iconOnly || isMobile ? "flex-col items-center" : "items-center gap-3"}`}>
                        <div className={`bg-secondary/50 p-2 rounded-md ${iconOnly || isMobile ? "mb-1" : ""}`}>
                          {widget.icon}
                        </div>
                        {!iconOnly && !isMobile && (
                          <div>
                            <h3 className="text-sm font-medium">{widget.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {widget.description}
                            </p>
                            {isPlaced && (
                              <span className="text-xs inline-block mt-1 px-1.5 py-0.5 bg-muted/30 rounded">
                                Added
                              </span>
                            )}
                          </div>
                        )}
                        {(iconOnly || isMobile) && isPlaced && (
                          <span className="text-[10px] px-1 py-0.5 bg-muted/30 rounded">
                            Added
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
