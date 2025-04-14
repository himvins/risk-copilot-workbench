import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable } from "@hello-pangea/dnd";
import { RiskExposureWidget } from "./widgets/RiskExposureWidget";
import { CounterpartyAnalysisWidget } from "./widgets/CounterpartyAnalysisWidget";
import { MarketVolatilityWidget } from "./widgets/MarketVolatilityWidget";
import { RiskAlertsWidget } from "./widgets/RiskAlertsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizableWidget } from "./ResizableWidget";

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
  const isMobile = useIsMobile();

  return (
    <div className="relative h-full" id="widget-workspace-container">
      <Droppable droppableId="workspace" direction="vertical" type="WIDGET">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              h-full p-4 overflow-auto grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4 auto-rows-min
              ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}
            `}
            data-droppable="true"
          >
            {placedWidgets.map((widget) => {
              const WidgetComponent = widgetComponents[widget.type];
              return (
                <div
                  key={widget.id}
                  className="min-h-[300px] w-full"
                  data-widget-id={widget.id}
                >
                  <ResizableWidget onClose={() => removeWidget(widget.id)}>
                    <WidgetComponent widget={widget} onClose={removeWidget} />
                  </ResizableWidget>
                </div>
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
