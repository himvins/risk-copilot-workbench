
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileStack, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

const capitalData = {
  ratios: [
    { name: "CET1", value: 12.8, target: 10.5, bufferName: "Conservation" },
    { name: "Tier 1", value: 14.5, target: 12.0, bufferName: "Countercyclical" },
    { name: "Total", value: 17.2, target: 14.0, bufferName: "G-SIB" },
    { name: "Leverage", value: 5.1, target: 3.0, bufferName: "SLR" },
  ],
  rwa: {
    total: 450.6,
    breakdown: [
      { name: "Credit Risk", value: 325.2 },
      { name: "Market Risk", value: 68.7 },
      { name: "Operational Risk", value: 56.7 },
    ]
  },
  warnings: [
    { id: "W1", message: "CET1 ratio projected to decline in stress scenario", severity: "medium" },
    { id: "W2", message: "Internal capital generation below target", severity: "low" }
  ]
};

export function RegulatoryCapitalWidget({ widget, onClose }: WidgetComponentProps) {
  // Function to determine bar color based on relation to target
  const getBarColor = (value: number, target: number) => {
    const buffer = (value - target) / target * 100;
    if (buffer > 15) return "#10B981"; // Good buffer
    if (buffer > 5) return "#F59E0B"; // Moderate buffer
    return "#EF4444"; // Low buffer
  };

  // Calculate capital distribution
  const rwaPctData = capitalData.rwa.breakdown.map(item => ({
    name: item.name,
    percentage: Math.round(item.value / capitalData.rwa.total * 100)
  }));

  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileStack size={14} className="text-widget-accent" />
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium mb-2">Capital Ratios</div>
            <div className="space-y-3">
              {capitalData.ratios.map((ratio, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{ratio.name} Ratio</span>
                    <span className="font-medium">{ratio.value}%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center">
                      <div className="w-full">
                        <Progress 
                          value={(ratio.value / (ratio.target * 1.5)) * 100} 
                          className="h-2"
                          indicatorClassName={getBarColor(ratio.value, ratio.target)}
                        />
                      </div>
                      <div className="ml-2 text-xs text-muted-foreground">
                        {ratio.target}%
                      </div>
                    </div>
                    <div className="absolute top-1 h-4 border-l border-dashed border-muted-foreground" 
                      style={{ left: `${(ratio.target / (ratio.target * 1.5)) * 100}%`}}>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {ratio.bufferName} Buffer: +{(ratio.value - ratio.target).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-2">RWA Distribution (Total: ${capitalData.rwa.total}B)</div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rwaPctData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10 }} 
                    width={80}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#3B82F6" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20}
                    label={{ 
                      position: 'right', 
                      formatter: (value: number) => `${value}%`,
                      fontSize: 10
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {capitalData.warnings.length > 0 && (
          <div className="mt-4 border-t border-border/50 pt-3">
            <div className="text-xs font-medium mb-2">Alerts & Notifications</div>
            <div className="space-y-2">
              {capitalData.warnings.map((warning) => (
                <div 
                  key={warning.id} 
                  className={`flex items-start p-2 rounded text-xs
                    ${warning.severity === 'medium' 
                      ? 'bg-amber-500/10 border border-amber-500/30' 
                      : 'bg-blue-500/10 border border-blue-500/30'}`}
                >
                  <AlertTriangle 
                    size={14} 
                    className={warning.severity === 'medium' ? 'text-amber-500 mr-2' : 'text-blue-500 mr-2'} 
                  />
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
