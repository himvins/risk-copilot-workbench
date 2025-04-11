
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle, ShieldCheck, Info } from "lucide-react";

const counterpartyData = [
  { 
    id: "CP001", 
    name: "Goldman Sachs", 
    exposure: "$24.5M",
    rating: "AA",
    riskScore: "Low",
    riskColor: "text-widget-green", 
  },
  { 
    id: "CP015", 
    name: "Deutsche Bank", 
    exposure: "$18.3M",
    rating: "BBB+",
    riskScore: "Medium",
    riskColor: "text-widget-amber", 
  },
  { 
    id: "CP023", 
    name: "Credit Suisse", 
    exposure: "$15.7M",
    rating: "BBB",
    riskScore: "Medium",
    riskColor: "text-widget-amber", 
  },
  { 
    id: "CP008", 
    name: "Barclays", 
    exposure: "$12.2M",
    rating: "A-",
    riskScore: "Low",
    riskColor: "text-widget-green", 
  },
  { 
    id: "CP045", 
    name: "Nomura Securities", 
    exposure: "$8.5M",
    rating: "BB+",
    riskScore: "High",
    riskColor: "text-widget-red", 
  }
];

export function CounterpartyAnalysisWidget({ widget, onClose }: WidgetComponentProps) {
  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-5 p-2 text-xs font-medium border-b border-border bg-muted/30">
          <div>ID</div>
          <div>Name</div>
          <div>Exposure</div>
          <div>Rating</div>
          <div>Risk</div>
        </div>
        <div className="max-h-[230px] overflow-y-auto">
          {counterpartyData.map((cp) => (
            <div key={cp.id} className="grid grid-cols-5 p-2 text-xs border-b border-border/50 hover:bg-muted/20">
              <div>{cp.id}</div>
              <div className="font-medium">{cp.name}</div>
              <div>{cp.exposure}</div>
              <div>{cp.rating}</div>
              <div className={`flex items-center gap-1 ${cp.riskColor}`}>
                {cp.riskScore === "Low" && <ShieldCheck size={14} />}
                {cp.riskScore === "Medium" && <Info size={14} />}
                {cp.riskScore === "High" && <AlertTriangle size={14} />}
                {cp.riskScore}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 flex justify-between text-xs text-muted-foreground">
          <span>Total Counterparties: 42</span>
          <span>Total Exposure: $132.7M</span>
        </div>
      </CardContent>
    </Card>
  );
}
