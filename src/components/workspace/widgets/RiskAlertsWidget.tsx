
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, Bell } from "lucide-react";

const alertsData = [
  {
    id: "ALT001",
    title: "Counterparty Credit Downgrade",
    description: "Credit Suisse downgraded to BBB- by S&P",
    severity: "high",
    time: "15m ago",
  },
  {
    id: "ALT002",
    title: "Position Limit Breach",
    description: "US Treasuries position exceeding 120% of limit",
    severity: "high",
    time: "45m ago",
  },
  {
    id: "ALT003",
    title: "Market Volatility Alert",
    description: "VIX up 25% in last trading session",
    severity: "medium",
    time: "2h ago",
  },
  {
    id: "ALT004",
    title: "Liquidity Warning",
    description: "EM Bond portfolio liquidity below threshold",
    severity: "medium",
    time: "3h ago",
  },
  {
    id: "ALT005",
    title: "Concentration Risk",
    description: "Financial sector exposure above 30%",
    severity: "low",
    time: "5h ago",
  }
];

export function RiskAlertsWidget({ widget, onClose }: WidgetComponentProps) {
  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell size={14} className="text-widget-red" />
          {widget.title}
        </CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[260px] overflow-y-auto">
          {alertsData.map((alert) => (
            <div key={alert.id} className="p-3 border-b border-border/50 hover:bg-muted/20">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                  {alert.severity === "high" && (
                    <AlertTriangle size={16} className="text-widget-red mt-0.5" />
                  )}
                  {alert.severity === "medium" && (
                    <AlertTriangle size={16} className="text-widget-amber mt-0.5" />
                  )}
                  {alert.severity === "low" && (
                    <AlertTriangle size={16} className="text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-muted-foreground">{alert.description}</div>
                  </div>
                </div>
                <div>
                  <Badge 
                    variant={
                      alert.severity === "high" 
                        ? "destructive" 
                        : alert.severity === "medium" 
                          ? "outline" 
                          : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground text-right">
                {alert.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
