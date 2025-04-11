
import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BarChart3, Activity, LineChart, AlertCircle, Scale, BarChart, DollarSign } from "lucide-react";

interface WidgetTemplate {
  type: string;
  title: string;
  icon: React.ReactNode;
  description: string;
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

export function WidgetGallery() {
  const { widgets, addWidget } = useWorkspace();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    // Handle dropping of widget onto main workspace
    // This would be handled by the workspace component
  };

  // Filter out widgets already added to the workspace or placed on the stage
  const availableWidgetTypes = new Set(widgets.map(w => w.type));

  return (
    <div className="h-full bg-secondary/30 p-3 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-sm font-medium mb-2">Widget Gallery</h2>
        <p className="text-xs text-muted-foreground">
          Drag widgets to the workspace or click to add
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widget-gallery">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {availableWidgets.map((widget, index) => (
                <Draggable
                  key={widget.type}
                  draggableId={widget.type}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        p-3 rounded-md border cursor-pointer
                        ${snapshot.isDragging ? "opacity-50" : ""}
                        ${availableWidgetTypes.has(widget.type as any) 
                          ? "bg-muted/20 border-border/50 text-muted-foreground" 
                          : "bg-card hover:bg-card/80 border-border"}
                      `}
                      onClick={() => 
                        !availableWidgetTypes.has(widget.type as any) && 
                        addWidget(widget.type as any, widget.title)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/50 p-2 rounded-md">
                          {widget.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">{widget.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
