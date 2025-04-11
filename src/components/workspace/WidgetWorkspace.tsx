
import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RiskExposureWidget } from "./widgets/RiskExposureWidget";
import { CounterpartyAnalysisWidget } from "./widgets/CounterpartyAnalysisWidget";
import { MarketVolatilityWidget } from "./widgets/MarketVolatilityWidget";
import { RiskAlertsWidget } from "./widgets/RiskAlertsWidget";

const widgetComponents: Record<string, React.FC<any>> = {
  "risk-exposure": RiskExposureWidget,
  "counterparty-analysis": CounterpartyAnalysisWidget,
  "market-volatility": MarketVolatilityWidget,
  "portfolio-heatmap": MarketVolatilityWidget, // Reusing for demo
  "transaction-volume": CounterpartyAnalysisWidget, // Reusing for demo
  "risk-alerts": RiskAlertsWidget,
};

export function WidgetWorkspace() {
  const { widgets, placedWidgets, placeWidget, removeWidget } = useWorkspace();

  // Handle drag end of a widget
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // If dragging from widget list to workspace
    if (source.droppableId === "widget-list" && destination.droppableId === "workspace") {
      // Calculate position based on drop location
      const position = {
        x: destination.index % 2 === 0 ? 0 : 400,
        y: Math.floor(destination.index / 2) * 350
      };
      
      placeWidget(draggableId, position);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="relative h-full">
        {/* Available widgets */}
        <Droppable droppableId="widget-list" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-2 p-3 overflow-x-auto border-b border-border bg-background/50"
            >
              {widgets.length === 0 ? (
                <div className="text-xs text-muted-foreground px-4 py-2">
                  No widgets available - add some from the gallery
                </div>
              ) : (
                widgets.map((widget, index) => {
                  const WidgetComponent = widgetComponents[widget.type];
                  return (
                    <Draggable
                      key={widget.id}
                      draggableId={widget.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            flex-shrink-0 w-[250px] h-[150px]
                            ${snapshot.isDragging ? "widget-dragging" : ""}
                          `}
                        >
                          <WidgetComponent
                            widget={widget}
                            onClose={removeWidget}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Workspace area */}
        <Droppable droppableId="workspace" direction="vertical">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                h-[calc(100%-76px)] p-6 overflow-auto grid grid-cols-2 gap-6 auto-rows-min
                ${snapshot.isDraggingOver ? "widget-drop-target" : ""}
              `}
            >
              {placedWidgets.map((widget, index) => {
                const WidgetComponent = widgetComponents[widget.type];
                return (
                  <div
                    key={widget.id}
                    className="min-h-[300px]"
                  >
                    <WidgetComponent
                      widget={widget}
                      onClose={removeWidget}
                    />
                  </div>
                );
              })}
              {placedWidgets.length === 0 && !snapshot.isDraggingOver && (
                <div className="col-span-2 h-full flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-sm mb-2">Drag widgets here to build your workspace</p>
                  <p className="text-xs">
                    Add widgets from the gallery on the left or from the toolbar above
                  </p>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
