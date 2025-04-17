
import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil } from "lucide-react";
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
import { WorkspaceTab } from "@/types";

const widgetComponents: Record<string, React.FC<any>> = {
  "risk-exposure": RiskExposureWidget,
  "counterparty-analysis": CounterpartyAnalysisWidget,
  "market-volatility": MarketVolatilityWidget,
  "portfolio-heatmap": MarketVolatilityWidget,
  "transaction-volume": CounterpartyAnalysisWidget,
  "risk-alerts": RiskAlertsWidget,
  "credit-risk-metrics": CreditRiskMetricsWidget,
  "liquidity-coverage-ratio": LiquidityCoverageWidget,
  "regulatory-capital": RegulatoryCapitalWidget,
  "stress-test-scenarios": StressTestScenariosWidget,
  "operational-risk-events": OperationalRiskEventsWidget,
};

interface EditableTabProps {
  tab: WorkspaceTab;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

const EditableTab = ({ tab, onRename, onRemove }: EditableTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editValue.trim()) {
      onRename(tab.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditValue(tab.name); // Reset to original name
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleClickOutside = (e: React.FocusEvent) => {
    handleSubmit(e);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 px-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-6 w-24 text-xs"
          autoFocus
          onBlur={handleClickOutside}
          onKeyDown={handleKeyDown}
        />
        <span
          onClick={(e) => handleCancel(e as React.MouseEvent)}
          className="p-0.5 hover:bg-secondary rounded-full cursor-pointer"
        >
          <X size={14} />
        </span>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <span>{tab.name}</span>
      <div className="flex gap-1">
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-0.5 hover:bg-secondary rounded-full cursor-pointer"
        >
          <Pencil size={14} />
        </span>
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(tab.id, e);
          }}
          className="p-0.5 hover:bg-secondary rounded-full cursor-pointer"
        >
          <X size={14} />
        </span>
      </div>
    </div>
  );
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
    removeWorkspaceTab,
    renameWorkspaceTab
  } = useWorkspace();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  
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
                <EditableTab
                  tab={tab}
                  onRename={renameWorkspaceTab}
                  onRemove={handleRemoveTab}
                />
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
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    h-full p-4 overflow-auto relative
                    ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}
                  `}
                  style={{ display: 'block', position: 'relative' }}
                  data-droppable="true"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tab.id === activeTabId && tabWidgets.map((widget, index) => {
                      const WidgetComponent = widgetComponents[widget.type];
                      
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
                              {...provided.dragHandleProps}
                              className={`
                                widget-container min-h-[300px]
                                ${snapshot.isDragging ? "opacity-70" : ""}
                              `}
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
                  </div>
                  
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
