import { ReactNode } from "react";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  position?: {
    x: number;
    y: number;
  };
  isPlaced?: boolean;
  columns: string[];
  tabId?: string;
}

export type WidgetType = 
  | "risk-exposure"
  | "counterparty-analysis"
  | "market-volatility"
  | "portfolio-heatmap"
  | "transaction-volume"
  | "risk-alerts"
  | "credit-risk-metrics"
  | "liquidity-coverage-ratio"
  | "regulatory-capital"
  | "stress-test-scenarios"
  | "operational-risk-events";

export interface Message {
  id: string;
  content: string;
  type: "user" | "ai" | "system";
  timestamp: Date;
  actions?: MessageAction[];
  isProcessing?: boolean;
}

export interface MessageAction {
  id: string;
  label: string;
  action: () => void;
}

export interface WidgetComponentProps {
  widget: Widget;
  onClose: (id: string) => void;
  onResize?: (id: string, size: string) => void;
}

export interface WidgetCustomization {
  additionalColumns?: {
    id: string;
    type: string;
    name: string;
  }[];
}

export interface WorkspaceTab {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface WorkspaceContextType {
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
