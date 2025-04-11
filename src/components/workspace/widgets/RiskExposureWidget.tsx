
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, X } from "lucide-react";

const data = [
  { name: "US Equities", value: 45, change: 2.3 },
  { name: "EU Bonds", value: 38, change: -1.7 },
  { name: "Asia FX", value: 28, change: 0.8 },
  { name: "Commodities", value: 22, change: -2.5 },
  { name: "EM Debt", value: 15, change: 1.2 },
];

export function RiskExposureWidget({ widget, onClose }: WidgetComponentProps) {
  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {widget.title}
          <span className="text-xs text-muted-foreground">
            (VaR 95% confidence)
          </span>
        </CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">Total Exposure</div>
            <div className="text-xl font-semibold">$148.2M</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">Risk Rating</div>
            <div className="text-xl font-semibold text-widget-amber">
              Medium
            </div>
          </div>
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderColor: '#334155',
                  borderRadius: '0.25rem',
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 space-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between text-xs">
              <span>{item.name}</span>
              <span 
                className={
                  item.change > 0 
                    ? "text-financial-positive flex items-center gap-1" 
                    : "text-financial-negative flex items-center gap-1"
                }
              >
                {item.change > 0 ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(item.change)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
