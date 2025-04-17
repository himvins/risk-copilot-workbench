import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { WidgetType, Widget, Message, MessageAction, WidgetCustomization, WorkspaceTab } from "@/types";

interface WorkspaceContextType {
  placedWidgets: Widget[];
  messages: Message[];
  isProcessing: boolean;
  workspaceTabs: WorkspaceTab[];
  activeTabId: string;
  selectedWidgetId: string | null;
  addWidgetByType: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  removeWidgetByType: (widgetType: WidgetType) => void;
  addColumnToWidget: (widgetId: string, columnId: string) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  sendMessage: (content: string) => void;
  getWidgetCustomization: (widgetId: string) => WidgetCustomization | undefined;
  addWorkspaceTab: () => void;
  setActiveTab: (tabId: string) => void;
  removeWorkspaceTab: (tabId: string) => void;
  renameWorkspaceTab: (tabId: string, name: string) => void;
  selectWidget: (widgetId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: (context: WorkspaceContextType) => ReactNode }) {
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [widgetCustomizations, setWidgetCustomizations] = useState<Record<string, WidgetCustomization>>({});
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  
  const defaultTabId = uuidv4();
  const [workspaceTabs, setWorkspaceTabs] = useState<WorkspaceTab[]>([
    { id: defaultTabId, name: "Overview", isActive: true }
  ]);
  const [activeTabId, setActiveTabId] = useState(defaultTabId);

  const addWidgetByType = (widgetType: WidgetType) => {
    setPlacedWidgets((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: widgetType,
        title: getWidgetTitle(widgetType),
        columns: [],
        tabId: activeTabId
      }
    ]);
  };

  const getWidgetTitle = (widgetType: WidgetType): string => {
    switch (widgetType) {
      case "risk-exposure":
        return "Risk Exposure";
      case "counterparty-analysis":
        return "Counterparty Analysis";
      case "market-volatility":
        return "Market Volatility";
      case "portfolio-heatmap":
        return "Portfolio Heatmap";
      case "transaction-volume":
        return "Transaction Volume";
      case "risk-alerts":
        return "Risk Alerts";
      case "credit-risk-metrics":
        return "Credit Risk Metrics";
      case "liquidity-coverage-ratio":
        return "Liquidity Coverage";
      case "regulatory-capital":
        return "Regulatory Capital";
      case "stress-test-scenarios":
        return "Stress Testing";
      case "operational-risk-events":
        return "Operational Risk";
      default:
        return "Widget";
    }
  };

  const removeWidget = (widgetId: string) => {
    setPlacedWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const removeWidgetByType = (widgetType: WidgetType) => {
    setPlacedWidgets((prev) => prev.filter((w) => w.type !== widgetType));
  };

  const addColumnToWidget = (widgetId: string, columnId: string) => {
    setPlacedWidgets((prev) =>
      prev.map((widget) => {
        if (widget.id === widgetId) {
          return {
            ...widget,
            columns: [...widget.columns, columnId]
          };
        }
        return widget;
      })
    );
  };

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    setPlacedWidgets(prevWidgets => {
      const result = Array.from(prevWidgets);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  const getWidgetCustomization = (widgetId: string): WidgetCustomization | undefined => {
    return widgetCustomizations[widgetId];
  };

  const addWorkspaceTab = () => {
    const newTabId = uuidv4();
    setWorkspaceTabs(prev => {
      const updatedTabs = prev.map(tab => ({ ...tab, isActive: false }));
      return [...updatedTabs, { id: newTabId, name: `Tab ${updatedTabs.length + 1}`, isActive: true }];
    });
    setActiveTabId(newTabId);

    toast({
      title: "New workspace tab created",
      description: "You can now add widgets to this tab"
    });
  };

  const setActiveTab = (tabId: string) => {
    if (tabId === activeTabId) return;

    setWorkspaceTabs(prev => 
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    );
    setActiveTabId(tabId);
  };

  const removeWorkspaceTab = (tabId: string) => {
    if (workspaceTabs.length <= 1) {
      toast({
        title: "Cannot remove tab",
        description: "At least one workspace tab must remain",
        variant: "destructive"
      });
      return;
    }

    setWorkspaceTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== tabId);
      
      if (activeTabId === tabId && updatedTabs.length > 0) {
        updatedTabs[0].isActive = true;
        setActiveTabId(updatedTabs[0].id);
      }
      
      return updatedTabs;
    });

    setPlacedWidgets(prev => prev.filter(widget => widget.tabId !== tabId));

    toast({
      title: "Workspace tab removed",
      description: "All widgets in this tab have been removed"
    });
  };

  const renameWorkspaceTab = (tabId: string, name: string) => {
    if (!name.trim()) return;
    
    setWorkspaceTabs(prev => 
      prev.map(tab => 
        tab.id === tabId ? { ...tab, name } : tab
      )
    );

    toast({
      title: "Tab renamed",
      description: `The tab has been renamed to "${name}"`
    });
  };

  const selectWidget = (widgetId: string | null) => {
    setSelectedWidgetId(widgetId);
    
    if (widgetId) {
      const selectedWidget = placedWidgets.find(w => w.id === widgetId);
      if (selectedWidget) {
        const systemMessage: Message = {
          id: uuidv4(),
          content: `You've selected the "${selectedWidget.title}" widget. You can ask questions about it or request modifications.`,
          type: "system",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content: content,
      type: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    setTimeout(() => {
      let responseContent = `I've received your message: "${content}". How else can I assist you?`;
      let responseActions: MessageAction[] = [
        {
          id: uuidv4(),
          label: "Add risk widget",
          action: () => addWidgetByType("risk-exposure")
        }
      ];
      
      if (selectedWidgetId) {
        const selectedWidget = placedWidgets.find(w => w.id === selectedWidgetId);
        if (selectedWidget) {
          responseContent = `Regarding the "${selectedWidget.title}" widget: I'll help you with "${content}". What specific changes would you like to make?`;
          responseActions = [
            {
              id: uuidv4(),
              label: `Customize ${selectedWidget.title}`,
              action: () => {
                toast({
                  title: "Customization requested",
                  description: `Customization for ${selectedWidget.title} would happen here`
                });
              }
            },
            {
              id: uuidv4(),
              label: "Deselect widget",
              action: () => selectWidget(null)
            }
          ];
        }
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        type: "ai",
        timestamp: new Date(),
        actions: responseActions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const toast = (props: any) => {
    if (typeof window !== 'undefined' && window?.document) {
      const { toast: showToast } = require('@/hooks/use-toast');
      showToast(props);
    }
  };

  const value: WorkspaceContextType = {
    placedWidgets,
    messages,
    isProcessing,
    workspaceTabs,
    activeTabId,
    selectedWidgetId,
    addWidgetByType,
    removeWidget,
    removeWidgetByType,
    addColumnToWidget,
    reorderWidgets,
    sendMessage,
    getWidgetCustomization,
    addWorkspaceTab,
    setActiveTab,
    removeWorkspaceTab,
    renameWorkspaceTab,
    selectWidget
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
