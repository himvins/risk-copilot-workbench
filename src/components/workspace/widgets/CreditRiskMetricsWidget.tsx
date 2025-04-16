
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, CreditCard, TrendingDown, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const creditRiskData = [
  { id: "CR001", name: "Goldman Sachs", rating: "A+", pdPercent: 0.12, exposureUSD: 28.5, score: 76 },
  { id: "CR002", name: "JPMorgan Chase", rating: "AA-", pdPercent: 0.08, exposureUSD: 42.1, score: 85 },
  { id: "CR003", name: "Deutsche Bank", rating: "BBB+", pdPercent: 0.35, exposureUSD: 19.2, score: 62 },
  { id: "CR004", name: "Credit Suisse", rating: "BBB-", pdPercent: 0.48, exposureUSD: 15.7, score: 54 },
  { id: "CR005", name: "BNP Paribas", rating: "A", pdPercent: 0.21, exposureUSD: 22.3, score: 71 }
];

export function CreditRiskMetricsWidget({ widget, onClose }: WidgetComponentProps) {
  // Calculate aggregates for summary metrics
  const totalExposure = creditRiskData.reduce((sum, item) => sum + item.exposureUSD, 0);
  const weightedPD = creditRiskData.reduce((sum, item) => 
    sum + (item.pdPercent * item.exposureUSD / totalExposure), 0);
  const averageScore = creditRiskData.reduce((sum, item) => sum + item.score, 0) / creditRiskData.length;

  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CreditCard size={14} className="text-widget-red" />
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
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="rounded-md bg-muted/30 p-2">
            <div className="text-xs text-muted-foreground">Total Exposure</div>
            <div className="text-lg font-semibold">${totalExposure.toFixed(1)}M</div>
          </div>
          <div className="rounded-md bg-muted/30 p-2">
            <div className="text-xs text-muted-foreground">Weighted PD</div>
            <div className="text-lg font-semibold">{(weightedPD * 100).toFixed(2)}bps</div>
          </div>
          <div className="rounded-md bg-muted/30 p-2">
            <div className="text-xs text-muted-foreground">Avg Risk Score</div>
            <div className="text-lg font-semibold">{Math.round(averageScore)}/100</div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="text-xs font-medium mb-1">Credit Quality Distribution</div>
          <div className="flex w-full h-2 mb-3 rounded-full overflow-hidden">
            <div className="bg-green-500/70 h-full" style={{ width: '35%' }}></div>
            <div className="bg-yellow-500/70 h-full" style={{ width: '42%' }}></div>
            <div className="bg-red-500/70 h-full" style={{ width: '23%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>AAA-A (35%)</span>
            <span>BBB-B (42%)</span>
            <span>Below B (23%)</span>
          </div>
        </div>

        <div className="max-h-[180px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 sticky top-0">
              <tr className="text-xs font-medium">
                <th className="px-3 py-2 text-left">Counterparty</th>
                <th className="px-3 py-2 text-center">Rating</th>
                <th className="px-3 py-2 text-right">PD</th>
                <th className="px-3 py-2 text-right">Exposure</th>
                <th className="px-3 py-2 text-center">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {creditRiskData.map((item) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="px-3 py-2 text-xs">{item.name}</td>
                  <td className="px-3 py-2 text-center">
                    <span 
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        item.rating.startsWith('A') 
                          ? 'bg-green-500/20 text-green-500' 
                          : item.rating.startsWith('B') 
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {item.rating}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-right">{item.pdPercent}%</td>
                  <td className="px-3 py-2 text-xs text-right">${item.exposureUSD}M</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={item.score} className="h-1.5" />
                      <span className="text-xs">{item.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
