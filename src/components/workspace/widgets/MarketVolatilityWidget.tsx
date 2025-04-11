
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { X } from "lucide-react";

const volatilityData = [
  { date: "Apr 05", spx: 18, eurostoxx: 22, nikkei: 16 },
  { date: "Apr 06", spx: 19, eurostoxx: 20, nikkei: 18 },
  { date: "Apr 07", spx: 22, eurostoxx: 24, nikkei: 21 },
  { date: "Apr 08", spx: 25, eurostoxx: 28, nikkei: 23 },
  { date: "Apr 09", spx: 27, eurostoxx: 30, nikkei: 24 },
  { date: "Apr 10", spx: 24, eurostoxx: 26, nikkei: 22 },
  { date: "Apr 11", spx: 20, eurostoxx: 23, nikkei: 19 }
];

export function MarketVolatilityWidget({ widget, onClose }: WidgetComponentProps) {
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
      <CardContent className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-widget-accent"></span>
            <span className="text-xs">S&P 500</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-widget-amber"></span>
            <span className="text-xs">EURO STOXX 50</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-widget-green"></span>
            <span className="text-xs">Nikkei 225</span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volatilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
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
              <Line 
                type="monotone" 
                dataKey="spx" 
                name="S&P 500" 
                stroke="#3B82F6" 
                activeDot={{ r: 6 }} 
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="eurostoxx" 
                name="EURO STOXX 50" 
                stroke="#F59E0B" 
                activeDot={{ r: 6 }} 
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="nikkei" 
                name="Nikkei 225" 
                stroke="#10B981" 
                activeDot={{ r: 6 }} 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">S&P 500</div>
            <div className="text-md font-semibold text-widget-accent">20.8%</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">EURO STOXX 50</div>
            <div className="text-md font-semibold text-widget-amber">24.7%</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">Nikkei 225</div>
            <div className="text-md font-semibold text-widget-green">20.4%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
