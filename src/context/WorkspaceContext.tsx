
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { WidgetType, Widget } from "@/types";

// Extended context type to include reordering
interface WorkspaceContextType {
  placedWidgets: Widget[];
  addWidgetByType: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  removeWidgetByType: (widgetType: WidgetType) => void;
  addColumnToWidget: (widgetId: string, columnId: string) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: (context: WorkspaceContextType) => ReactNode }) {
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);

  const addWidgetByType = (widgetType: WidgetType) => {
    setPlacedWidgets((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: widgetType,
        columns: []
      }
    ]);
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
  
  // New function to reorder widgets
  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    setPlacedWidgets(prevWidgets => {
      const result = Array.from(prevWidgets);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  const value: WorkspaceContextType = {
    placedWidgets,
    addWidgetByType,
    removeWidget,
    removeWidgetByType,
    addColumnToWidget,
    reorderWidgets
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
