
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
}

export type WidgetType = 
  | "risk-exposure"
  | "counterparty-analysis"
  | "market-volatility"
  | "portfolio-heatmap"
  | "transaction-volume"
  | "risk-alerts";

export interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
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
