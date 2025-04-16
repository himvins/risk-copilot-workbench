
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
