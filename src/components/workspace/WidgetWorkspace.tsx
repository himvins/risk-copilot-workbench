import React, { useState, useRef } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RiskExposureWidget } from "./widgets/RiskExposureWidget";
import { CounterpartyAnalysisWidget } from "./widgets/CounterpartyAnalysisWidget";
import { MarketVolatilityWidget } from "./widgets/MarketVolatilityWidget";
import { RiskAlertsWidget } from "./widgets/RiskAlertsWidget";
import { CreditRiskMetricsWidget } from "./widgets/CreditRiskMetricsWidget";
import { LiquidityCoverageWidget } from "./widgets/LiquidityCoverageWidget";
import { RegulatoryCapitalWidget } from "./widgets/RegulatoryCapitalWidget";
import { StressTestScenariosWidget } from "./widgets/StressTestScenariosWidget";
import { OperationalRiskEventsWidget } from "./widgets/OperationalRiskEventsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizableWidget } from "./ResizableWidget";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

const widgetComponents: Record<string, React.FC<any>> = {
  "risk-exposure": RiskExposureWidget,
  "counterparty-analysis": CounterpartyAnalysisWidget,
  "market-volatility": MarketVolatilityWidget,
  "portfolio-heatmap": MarketVolatilityWidget, // Reusing for demo
  "transaction-volume": CounterpartyAnalysisWidget, // Reusing for demo
  "risk-alerts": RiskAlertsWidget,
  "credit-risk-metrics": CreditRiskMetricsWidget,
  "liquidity-coverage-ratio": LiquidityCoverageWidget,
  "regulatory-capital": RegulatoryCapitalWidget,
  "stress-test-scenarios": StressTestScenariosWidget,
  "operational-risk-events": OperationalRiskEventsWidget,
};

export function WidgetWorkspace() {
  const { 
    placedWidgets, 
    removeWidget, 
    reorderWidgets, 
    workspaceTabs, 
    activeTabId, 
    setActiveTab,
    addWorkspaceTab,
    removeWorkspaceTab
  } = useWorkspace();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  const findOptimalPosition = () => {
    if (!workspaceRef.current) return;

    const widgets = workspaceRef.current.querySelectorAll('[data-widget-id]');
    const occupiedSpaces: Array<DOMRect> = [];

    widgets.forEach((widget) => {
      const rect = widget.getBoundingClientRect();
      occupiedSpaces.push(rect);
    });

    const columnWidth = workspaceRef.current.clientWidth / 2;
    const columnSpaces: { left: number[], right: number[] } = { left: [], right: [] };
    
    occupiedSpaces.forEach((space) => {
      if (space.left < columnWidth) {
        columnSpaces.left.push(space.bottom + 16);
      } else {
        columnSpaces.right.push(space.bottom + 16);
      }
    });

    const leftY = columnSpaces.left.length ? Math.max(...columnSpaces.left) : 16;
    const rightY = columnSpaces.right.length ? Math.max(...columnSpaces.right) : 16;

    return {
      x: leftY <= rightY ? 0 : columnWidth,
      y: leftY <= rightY ? leftY : rightY
    };
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

  const tabWidgets = placedWidgets.filter(widget => widget.tabId === activeTabId);
  
  const handleRemoveTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeWorkspaceTab(tabId);
  };

  return (
    <div className="relative h-full flex flex-col" id="widget-workspace-container">
      <Tabs 
        value={activeTabId} 
        onValueChange={setActiveTab}
        className="w-full flex flex-col h-full"
      >
        <div className="flex items-center border-b px-4">
          <TabsList className="h-10 flex-grow">
            {workspaceTabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 px-4"
              >
                <span>{tab.name}</span>
                {workspaceTabs.length > 1 && (
                  <button
                    onClick={(e) => handleRemoveTab(tab.id, e)}
                    className="p-0.5 hover:bg-secondary rounded-full"
                  >
                    <X size={14} />
                  </button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button 
            variant="ghost" 
            size="sm"
            className="ml-2" 
            onClick={addWorkspaceTab}
          >
            <Plus size={16} className="mr-1" />
            New Tab
          </Button>
        </div>

        {workspaceTabs.map(tab => (
          <TabsContent 
            key={tab.id} 
            value={tab.id}
            className="flex-1 relative mt-4 overflow-hidden"
          >
            <Droppable droppableId="workspace" direction="vertical" type="WIDGET">
              {(provided, snapshot) => (
                <div
                  ref={(el) => {
                    provided.innerRef(el);
                    if (workspaceRef.current !== el && tab.id === activeTabId) {
                      workspaceRef.current = el;
                    }
                  }}
                  {...provided.droppableProps}
                  className={`
                    h-full p-4 overflow-auto relative
                    ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}
                  `}
                  style={{ display: 'block' }}
                  data-droppable="true"
                >
                  {tab.id === activeTabId && tabWidgets.map((widget, index) => {
                    const WidgetComponent = widgetComponents[widget.type];
                    const optimalPosition = findOptimalPosition();
                    
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
                            className={`
                              min-h-[300px] w-[calc(50% - 16px)] 
                              ${snapshot.isDragging ? "opacity-70" : ""}
                            `}
                            style={{
                              ...provided.draggableProps.style,
                              position: 'absolute',
                              top: optimalPosition?.y ?? '16px',
                              left: optimalPosition?.x ?? '0',
                              transition: 'all 0.3s ease',
                            }}
                            data-widget-id={widget.id}
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
                  {tabWidgets.length === 0 && (
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
