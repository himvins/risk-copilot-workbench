
import React from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TestTube, ArrowDownRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stressTestData = {
  scenarios: [
    { id: "baseline", name: "Baseline", 
      results: { cet1Final: 12.4, netIncome: 8.7, creditLosses: 4.2 },
      timeline: [
        { quarter: "Q1", cet1: 12.8, netIncome: 2.3, creditLosses: 1.0 },
        { quarter: "Q2", cet1: 12.7, netIncome: 2.2, creditLosses: 1.1 },
        { quarter: "Q3", cet1: 12.5, netIncome: 2.1, creditLosses: 1.0 },
        { quarter: "Q4", cet1: 12.4, netIncome: 2.1, creditLosses: 1.1 },
      ]
    },
    { id: "severe", name: "Severe Downturn", 
      results: { cet1Final: 8.6, netIncome: 1.2, creditLosses: 14.5 },
      timeline: [
        { quarter: "Q1", cet1: 12.8, netIncome: 1.8, creditLosses: 2.5 },
        { quarter: "Q2", cet1: 11.2, netIncome: 0.2, creditLosses: 3.8 },
        { quarter: "Q3", cet1: 9.5, netIncome: -0.4, creditLosses: 4.5 },
        { quarter: "Q4", cet1: 8.6, netIncome: -0.4, creditLosses: 3.7 },
      ]
    },
    { id: "global", name: "Global Shock", 
      results: { cet1Final: 7.2, netIncome: -2.5, creditLosses: 18.3 },
      timeline: [
        { quarter: "Q1", cet1: 12.8, netIncome: 1.0, creditLosses: 3.5 },
        { quarter: "Q2", cet1: 10.5, netIncome: -1.2, creditLosses: 5.2 },
        { quarter: "Q3", cet1: 8.4, netIncome: -1.5, creditLosses: 5.8 },
        { quarter: "Q4", cet1: 7.2, netIncome: -0.8, creditLosses: 3.8 },
      ]
    }
  ],
  impacts: [
    { name: "Credit Portfolios", baselineImpact: -1.2, severeImpact: -5.8, globalImpact: -7.2 },
    { name: "Trading Book", baselineImpact: -0.5, severeImpact: -3.1, globalImpact: -4.5 },
    { name: "Interest Income", baselineImpact: 0.8, severeImpact: -2.4, globalImpact: -3.2 },
    { name: "Fee Revenue", baselineImpact: 0.2, severeImpact: -1.5, globalImpact: -2.0 },
  ]
};

export function StressTestScenariosWidget({ widget, onClose }: WidgetComponentProps) {
  const [activeScenario, setActiveScenario] = React.useState("baseline");
  
  // Get current scenario data
  const currentScenario = stressTestData.scenarios.find(s => s.id === activeScenario) || stressTestData.scenarios[0];
  
  // Format for the chart tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === "cet1") return [`${value}%`, "CET1 Ratio"];
    if (name === "netIncome") return [`$${value}B`, "Net Income"];
    if (name === "creditLosses") return [`$${value}B`, "Credit Losses"];
    return [value, name];
  };

  return (
    <Card className="widget min-h-[300px]">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TestTube size={14} className="text-widget-amber" />
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
        <Tabs defaultValue="baseline" value={activeScenario} onValueChange={setActiveScenario} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {stressTestData.scenarios.map((scenario) => (
              <TabsTrigger key={scenario.id} value={scenario.id}>
                {scenario.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {stressTestData.scenarios.map((scenario) => (
            <TabsContent key={scenario.id} value={scenario.id} className="mt-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 bg-muted/30 rounded">
                  <div className="text-xs text-muted-foreground">Final CET1</div>
                  <div className="text-lg font-semibold">
                    {scenario.results.cet1Final}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    <ArrowDownRight size={10} className="inline" />
                    {(12.8 - scenario.results.cet1Final).toFixed(1)}% from initial
                  </div>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <div className="text-xs text-muted-foreground">Net Income</div>
                  <div className={`text-lg font-semibold ${scenario.results.netIncome < 0 ? 'text-red-400' : ''}`}>
                    {scenario.results.netIncome >= 0 ? '$' : '-$'}{Math.abs(scenario.results.netIncome).toFixed(1)}B
                  </div>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <div className="text-xs text-muted-foreground">Credit Losses</div>
                  <div className="text-lg font-semibold text-red-400">
                    ${scenario.results.creditLosses.toFixed(1)}B
                  </div>
                </div>
              </div>

              <div className="h-[140px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scenario.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="quarter" 
                      tick={{ fontSize: 10 }} 
                      axisLine={{ stroke: '#334155' }}
                      tickLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10 }} 
                      axisLine={{ stroke: '#334155' }}
                      tickLine={{ stroke: '#334155' }}
                      domain={[6, 14]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }} 
                      axisLine={{ stroke: '#334155' }}
                      tickLine={{ stroke: '#334155' }}
                      domain={[-2, 6]}
                      tickFormatter={(value) => `$${value}B`}
                    />
                    <Tooltip
                      formatter={formatTooltip}
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        borderColor: '#334155',
                        fontSize: '11px',
                        padding: '4px 8px'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cet1" 
                      name="CET1 Ratio" 
                      stroke="#3B82F6" 
                      dot={{ r: 2 }}
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="netIncome" 
                      name="Net Income" 
                      stroke="#10B981" 
                      dot={{ r: 2 }}
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="creditLosses" 
                      name="Credit Losses" 
                      stroke="#EF4444" 
                      dot={{ r: 2 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="text-xs font-medium mb-1">Key Portfolio Impacts</div>
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-2 py-1 text-left">Portfolio</th>
                      <th className="px-2 py-1 text-right">Impact ($B)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stressTestData.impacts.map((impact, i) => {
                      // Get impact based on scenario
                      const impactValue = 
                        scenario.id === "baseline" ? impact.baselineImpact : 
                        scenario.id === "severe" ? impact.severeImpact :
                        impact.globalImpact;
                        
                      return (
                        <tr key={i} className="border-b border-border/30">
                          <td className="px-2 py-1">{impact.name}</td>
                          <td className={`px-2 py-1 text-right ${impactValue < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {impactValue >= 0 ? '+' : ''}{impactValue}B
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
