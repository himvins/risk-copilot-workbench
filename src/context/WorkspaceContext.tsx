
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { WidgetType, Widget, Message, MessageAction, WidgetCustomization, WorkspaceTab } from "@/types";

// Extended context type to include messaging and reordering capabilities
interface WorkspaceContextType {
  placedWidgets: Widget[];
  messages: Message[];
  isProcessing: boolean;
  workspaceTabs: WorkspaceTab[];
  activeTabId: string;
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
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: (context: WorkspaceContextType) => ReactNode }) {
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [widgetCustomizations, setWidgetCustomizations] = useState<Record<string, WidgetCustomization>>({});
  
  // Initialize with a default tab
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
        tabId: activeTabId // Associate widget with current active tab
      }
    ]);
  };

  // Helper function to generate widget titles based on type
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
  
  // Function to reorder widgets
  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    setPlacedWidgets(prevWidgets => {
      const result = Array.from(prevWidgets);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  // Function to get widget customizations
  const getWidgetCustomization = (widgetId: string): WidgetCustomization | undefined => {
    return widgetCustomizations[widgetId];
  };

  // Tab management functions
  const addWorkspaceTab = () => {
    const newTabId = uuidv4();
    setWorkspaceTabs(prev => {
      // Set all tabs to inactive
      const updatedTabs = prev.map(tab => ({ ...tab, isActive: false }));
      // Add new active tab
      return [...updatedTabs, { id: newTabId, name: `Tab ${updatedTabs.length + 1}`, isActive: true }];
    });
    setActiveTabId(newTabId);

    // Notify user
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
    // Don't remove if it's the last tab
    if (workspaceTabs.length <= 1) {
      toast({
        title: "Cannot remove tab",
        description: "At least one workspace tab must remain",
        variant: "destructive"
      });
      return;
    }

    // Remove the tab
    setWorkspaceTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== tabId);
      
      // If the active tab was removed, activate the first tab
      if (activeTabId === tabId && updatedTabs.length > 0) {
        updatedTabs[0].isActive = true;
        setActiveTabId(updatedTabs[0].id);
      }
      
      return updatedTabs;
    });

    // Remove widgets associated with this tab
    setPlacedWidgets(prev => prev.filter(widget => widget.tabId !== tabId));

    // Notify user
    toast({
      title: "Workspace tab removed",
      description: "All widgets in this tab have been removed"
    });
  };

  const renameWorkspaceTab = (tabId: string, name: string) => {
    setWorkspaceTabs(prev => 
      prev.map(tab => 
        tab.id === tabId ? { ...tab, name: name || `Tab ${Math.random().toString(36).substr(2, 5)}` } : tab
      )
    );
  };

  // Function to handle sending messages
  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: content,
      type: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      const aiMessage: Message = {
        id: uuidv4(),
        content: `I've received your message: "${content}". How else can I assist you?`,
        type: "ai",
        timestamp: new Date(),
        actions: [
          {
            id: uuidv4(),
            label: "Add risk widget",
            action: () => addWidgetByType("risk-exposure")
          }
        ]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  // Add toast import
  const toast = (props: any) => {
    // Forward to useToast implementation
    if (typeof window !== 'undefined' && window?.document) {
      // We're in a browser environment
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
    renameWorkspaceTab
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
