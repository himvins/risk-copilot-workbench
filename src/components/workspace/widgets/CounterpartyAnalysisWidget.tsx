
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle, ShieldCheck, Info, Sparkles } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const baseCounterpartyData = [
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

// Extended data for AI columns
const extendedData = {
  profitability: {
    "CP001": { value: "+$2.3M", trend: "up" },
    "CP015": { value: "+$1.1M", trend: "up" },
    "CP023": { value: "-$0.8M", trend: "down" },
    "CP008": { value: "+$1.5M", trend: "up" },
    "CP045": { value: "-$0.4M", trend: "down" },
  },
  sentiment: {
    "CP001": { value: "Positive", score: 82 },
    "CP015": { value: "Neutral", score: 56 },
    "CP023": { value: "Negative", score: 34 },
    "CP008": { value: "Positive", score: 78 },
    "CP045": { value: "Negative", score: 29 },
  },
  volatility: {
    "CP001": { value: "Low", percent: "3.2%" },
    "CP015": { value: "Medium", percent: "5.7%" },
    "CP023": { value: "High", percent: "8.9%" },
    "CP008": { value: "Low", percent: "2.8%" },
    "CP045": { value: "High", percent: "9.2%" },
  }
};

export function CounterpartyAnalysisWidget({ widget, onClose }: WidgetComponentProps) {
  const { getWidgetCustomization } = useWorkspace();
  
  // Get widget-specific customizations (columns)
  const customization = getWidgetCustomization(widget.id);
  const additionalColumns = customization?.additionalColumns || [];
  
  // Calculate total columns (base + additional)
  const totalColumnCount = 5 + additionalColumns.length;

  // Function to render the appropriate value for each added column
  const getExtendedDataValue = (cpId: string, columnName: string) => {
    const data = extendedData[columnName as keyof typeof extendedData];
    if (!data || !data[cpId]) return "N/A";
    
    const value = data[cpId].value;
    
    // Add color based on the sentiment or trend
    if (columnName === "profitability") {
      return (
        <span className={data[cpId].trend === "up" ? "text-widget-green" : "text-widget-red"}>
          {value}
        </span>
      );
    } else if (columnName === "sentiment") {
      let colorClass = "text-widget-amber";
      if (data[cpId].score >= 70) colorClass = "text-widget-green";
      if (data[cpId].score <= 40) colorClass = "text-widget-red";
      return <span className={colorClass}>{value}</span>;
    } else if (columnName === "volatility") {
      let colorClass = "text-widget-amber";
      if (value === "Low") colorClass = "text-widget-green";
      if (value === "High") colorClass = "text-widget-red";
      return (
        <span className={colorClass}>
          {value} ({data[cpId].percent})
        </span>
      );
    }
    
    return value;
  };

  // Generate grid template columns CSS
  const gridTemplateColumns = `repeat(${totalColumnCount}, minmax(80px, 1fr))`;

  return (
    <Card className="widget min-h-[300px] overflow-hidden">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex flex-col">
        {/* Fixed Header */}
        <div 
          className="p-2 text-xs font-medium border-b border-border bg-muted/30 sticky top-0 z-10"
          style={{ display: 'grid', gridTemplateColumns }}
        >
          <div className="px-2">ID</div>
          <div className="px-2">Name</div>
          <div className="px-2">Exposure</div>
          <div className="px-2">Rating</div>
          <div className="px-2">Risk</div>
          
          {/* Additional AI-powered columns */}
          {additionalColumns.map(column => (
            <div 
              key={column.id} 
              className="flex items-center gap-1 text-primary px-2 mx-1 py-0.5 bg-primary/5 rounded-sm"
            >
              <Sparkles size={12} className="text-primary" />
              {column.name}
            </div>
          ))}
        </div>

        {/* Scrollable Data Area */}
        <ScrollArea className="max-h-[230px]">
          <div>
            {baseCounterpartyData.map((cp) => (
              <div 
                key={cp.id} 
                className="p-2 text-xs border-b border-border/50 hover:bg-muted/20"
                style={{ display: 'grid', gridTemplateColumns }}
              >
                <div className="px-2">{cp.id}</div>
                <div className="px-2 font-medium">{cp.name}</div>
                <div className="px-2">{cp.exposure}</div>
                <div className="px-2">{cp.rating}</div>
                <div className={`flex items-center gap-1 px-2 ${cp.riskColor}`}>
                  {cp.riskScore === "Low" && <ShieldCheck size={14} />}
                  {cp.riskScore === "Medium" && <Info size={14} />}
                  {cp.riskScore === "High" && <AlertTriangle size={14} />}
                  {cp.riskScore}
                </div>
                
                {/* Values for additional columns */}
                {additionalColumns.map(column => (
                  <div 
                    key={column.id} 
                    className="px-2 mx-1 py-1 flex items-center gap-1 bg-primary/5 rounded-sm"
                  >
                    {getExtendedDataValue(cp.id, column.type)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 flex justify-between text-xs text-muted-foreground mt-auto">
          <span>Total Counterparties: 42</span>
          <span>Total Exposure: $132.7M</span>
        </div>
      </CardContent>
    </Card>
  );
}
