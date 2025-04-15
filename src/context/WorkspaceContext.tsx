
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { WidgetType, Widget, Message, MessageAction, WidgetCustomization } from "@/types";

// Extended context type to include messaging and reordering capabilities
interface WorkspaceContextType {
  placedWidgets: Widget[];
  messages: Message[];
  isProcessing: boolean;
  addWidgetByType: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  removeWidgetByType: (widgetType: WidgetType) => void;
  addColumnToWidget: (widgetId: string, columnId: string) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  sendMessage: (content: string) => void;
  getWidgetCustomization: (widgetId: string) => WidgetCustomization | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: (context: WorkspaceContextType) => ReactNode }) {
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [widgetCustomizations, setWidgetCustomizations] = useState<Record<string, WidgetCustomization>>({});

  const addWidgetByType = (widgetType: WidgetType) => {
    setPlacedWidgets((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: widgetType,
        title: getWidgetTitle(widgetType),
        columns: []
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

  const value: WorkspaceContextType = {
    placedWidgets,
    messages,
    isProcessing,
    addWidgetByType,
    removeWidget,
    removeWidgetByType,
    addColumnToWidget,
    reorderWidgets,
    sendMessage,
    getWidgetCustomization
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
