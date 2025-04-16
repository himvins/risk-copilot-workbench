
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlarmClock, AlertOctagon, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const operationalRiskData = {
  summary: {
    totalEvents: 87,
    openEvents: 23,
    totalLosses: 12.4,
    nearMisses: 34
  },
  byCategory: [
    { category: "Internal Fraud", count: 5, loss: 2.8, trend: "increasing" },
    { category: "External Fraud", count: 18, loss: 3.5, trend: "stable" },
    { category: "Employment Practices", count: 12, loss: 1.2, trend: "decreasing" },
    { category: "Clients & Products", count: 14, loss: 3.8, trend: "increasing" },
    { category: "Business Disruption", count: 22, loss: 0.7, trend: "stable" },
    { category: "Execution Errors", count: 16, loss: 0.4, trend: "decreasing" }
  ],
  recentEvents: [
    { id: "OR001", title: "Trading System Outage", category: "Business Disruption", date: "2d ago", loss: 0.35, status: "Open" },
    { id: "OR002", title: "Payment Processing Error", category: "Execution Errors", date: "3d ago", loss: 0.12, status: "Open" },
    { id: "OR003", title: "Data Access Control Breach", category: "Internal Fraud", date: "5d ago", loss: 1.2, status: "Investigating" },
    { id: "OR004", title: "KYC Documentation Failure", category: "Clients & Products", date: "1w ago", loss: 0.85, status: "Resolved" },
    { id: "OR005", title: "Malware Attack Attempt", category: "External Fraud", date: "1w ago", loss: 0.0, status: "Prevented" },
  ]
};

export function OperationalRiskEventsWidget({ widget, onClose }: WidgetComponentProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Internal Fraud": return "text-red-500";
      case "External Fraud": return "text-orange-500";
      case "Employment Practices": return "text-yellow-500";
      case "Clients & Products": return "text-blue-500";
      case "Business Disruption": return "text-purple-500";
      case "Execution Errors": return "text-green-500";
      default: return "text-gray-500";
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": 
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Open</Badge>;
      case "Investigating": 
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">Investigating</Badge>;
      case "Resolved": 
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Resolved</Badge>;
      case "Prevented": 
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">Prevented</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <span className="text-red-500">↑</span>;
      case "decreasing":
        return <span className="text-green-500">↓</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlarmClock size={14} className="text-widget-red" />
          {widget.title}
        </CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-xs text-muted-foreground">Total Events</div>
            <div className="text-lg font-semibold">{operationalRiskData.summary.totalEvents}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-xs text-muted-foreground">Open Events</div>
            <div className="text-lg font-semibold text-red-500">{operationalRiskData.summary.openEvents}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-xs text-muted-foreground">Total Losses</div>
            <div className="text-lg font-semibold">${operationalRiskData.summary.totalLosses}M</div>
          </div>
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-xs text-muted-foreground">Near Misses</div>
            <div className="text-lg font-semibold">{operationalRiskData.summary.nearMisses}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="text-xs font-medium">Loss by Category</div>
            <div className="text-xs text-muted-foreground">YTD</div>
          </div>
          
          <div className="space-y-1.5">
            {operationalRiskData.byCategory.map((category, i) => (
              <div key={i} className="flex items-center text-xs">
                <div className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(category.category).replace('text-', 'bg-')}`}></div>
                <div className="w-1/3">{category.category}</div>
                <div className="w-1/3">
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getCategoryColor(category.category).replace('text-', 'bg-')}`} 
                      style={{ width: `${(category.loss / 4) * 100}%` }} 
                    ></div>
                  </div>
                </div>
                <div className="w-1/6 pl-2">${category.loss}M</div>
                <div className="w-1/6 text-right">{getTrendIcon(category.trend)}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2 flex items-center">
            <AlertOctagon size={12} className="mr-1 text-red-500" />
            Recent Risk Events
          </div>
          <div className="space-y-1 max-h-[120px] overflow-y-auto">
            {operationalRiskData.recentEvents.map((event, i) => (
              <div key={i} className="p-2 border border-border/30 rounded-sm hover:bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium">{event.title}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className={`${getCategoryColor(event.category)}`}>{event.category}</span>
                      <span>•</span>
                      <span>{event.date}</span>
                      {event.loss > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-500">${event.loss}M loss</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
