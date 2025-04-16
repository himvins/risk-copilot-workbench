
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Gauge, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const liquidityData = {
  lcrRatio: 128.5,
  lcrTarget: 120,
  hqlaTotal: 342.8,
  netOutflows: 266.8,
  lcrTrend: [
    { month: "Jan", value: 118 },
    { month: "Feb", value: 121 },
    { month: "Mar", value: 119 },
    { month: "Apr", value: 125 },
    { month: "May", value: 129 },
  ],
  hqlaComposition: [
    { name: "Level 1", value: 245, color: "#3B82F6" },
    { name: "Level 2A", value: 68, color: "#10B981" },
    { name: "Level 2B", value: 30, color: "#F59E0B" },
  ],
  cashOutflows: [
    { name: "Retail deposits", value: 85, change: -2.3 },
    { name: "Wholesale funding", value: 145, change: 4.8 },
    { name: "Secured funding", value: 62, change: -1.5 },
    { name: "Other outflows", value: 98, change: 2.2 },
  ]
};

export function LiquidityCoverageWidget({ widget, onClose }: WidgetComponentProps) {
  // Calculate progress percentage for LCR
  const lcrProgress = Math.min(Math.round((liquidityData.lcrRatio / liquidityData.lcrTarget) * 100), 150);
  
  // Determine status color based on LCR value
  const getStatusColor = () => {
    if (liquidityData.lcrRatio >= 120) return "text-green-500";
    if (liquidityData.lcrRatio >= 100) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Gauge size={14} className="text-widget-green" />
          {widget.title}
        </CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Liquidity Coverage Ratio</span>
              <span className={`text-sm font-medium flex items-center ${getStatusColor()}`}>
                <TrendingUp size={12} className="mr-1" />
                {liquidityData.lcrRatio}%
              </span>
            </div>
            <Progress value={lcrProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>Target: {liquidityData.lcrTarget}%</span>
              <span>150%+</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground">HQLA</div>
                <div className="text-sm font-medium">${liquidityData.hqlaTotal}M</div>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground">Net Outflows</div>
                <div className="text-sm font-medium">${liquidityData.netOutflows}M</div>
              </div>
            </div>
          </div>

          <div className="h-[130px]">
            <div className="text-xs mb-1">HQLA Composition</div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liquidityData.hqlaComposition}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {liquidityData.hqlaComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle"
                  align="right"
                  iconSize={8}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">Cash Outflows Breakdown</div>
          <div className="space-y-1.5">
            {liquidityData.cashOutflows.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs">{item.name}</span>
                <div className="flex items-center">
                  <span className="text-xs mr-2">${item.value}M</span>
                  <span 
                    className={`text-xs flex items-center ${
                      item.change > 0 ? "text-financial-positive" : "text-financial-negative"
                    }`}
                  >
                    {item.change > 0 ? (
                      <ArrowUpRight size={10} />
                    ) : (
                      <ArrowDownRight size={10} />
                    )}
                    {Math.abs(item.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
