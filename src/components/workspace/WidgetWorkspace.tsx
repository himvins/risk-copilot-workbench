
import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable } from "@hello-pangea/dnd";
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
  const { placedWidgets, removeWidget } = useWorkspace();

  return (
    <div className="relative h-full">
      {/* Workspace area - now takes up the full height */}
      <Droppable droppableId="workspace" direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              h-full p-6 overflow-auto grid grid-cols-2 gap-6 auto-rows-min
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
