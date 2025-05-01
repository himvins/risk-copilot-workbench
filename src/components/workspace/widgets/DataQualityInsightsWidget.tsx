
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { WidgetComponentProps, AgentInsight } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, FileBarChart, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DataQualityInsightsWidget({ widget, onClose }: WidgetComponentProps) {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AgentInsight | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Subscribe to data quality alerts
  useEffect(() => {
    const subscription = messageBus.subscribe(
      MessageTopics.AGENT.DATA_QUALITY_ALERT,
      (insight: AgentInsight) => {
        setInsights(prev => {
          // Don't add duplicates
          if (prev.some(i => i.id === insight.id)) {
            return prev;
          }
          return [insight, ...prev];
        });
      }
    );

    // Generate some initial insights for demo
    if (insights.length === 0) {
      const generateRandomInsights = () => {
        const demoInsights: AgentInsight[] = [
          {
            id: "dqi-1",
            title: "Missing Values in Transaction Data",
            description: "Multiple missing values detected in critical transaction fields. This may impact financial reporting accuracy.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            severity: "high",
            source: "Transaction Pipeline",
            relatedEntities: ["transactions", "financial_records"],
            metadata: {
              affectedRecords: 157,
              confidenceScore: 0.92
            }
          },
          {
            id: "dqi-2",
            title: "Outliers in Market Data",
            description: "Statistical anomalies detected in market data feed. Potential data feed issues or market volatility.",
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            severity: "medium",
            source: "Market Data Service",
            relatedEntities: ["market_data", "pricing_models"],
            metadata: {
              affectedRecords: 23,
              confidenceScore: 0.78
            }
          },
          {
            id: "dqi-3",
            title: "Data Schema Drift Detected",
            description: "Changes in data schema detected. New fields added without proper documentation.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            severity: "low",
            source: "Schema Registry",
            relatedEntities: ["data_catalog", "schema_registry"],
            metadata: {
              affectedRecords: 0,
              confidenceScore: 0.85
            }
          }
        ];
        
        setInsights(demoInsights);
        if (demoInsights.length > 0) {
          setSelectedInsight(demoInsights[0]);
        }
      };
      
      generateRandomInsights();
    }

    // Generate chart data
    const generateChartData = () => {
      const now = new Date();
      const data = [];
      
      // Last 7 days of data quality issues
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          high: Math.floor(Math.random() * 5),
          medium: Math.floor(Math.random() * 10),
          low: Math.floor(Math.random() * 15)
        });
      }
      
      setChartData(data);
    };
    
    generateChartData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle size={16} className="text-red-600" />;
      case "high":
        return <AlertTriangle size={16} className="text-amber-600" />;
      case "medium":
        return <AlertCircle size={16} className="text-orange-500" />;
      case "low":
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-amber-500";
      case "medium":
        return "bg-orange-400";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileBarChart className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          Data quality insights from AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-[calc(100%-1rem)]">
          {/* Left column - List of insights */}
          <div className="w-full md:w-1/3 border-r">
            <ScrollArea className="h-[300px]">
              <div className="p-3 space-y-1">
                {insights.map(insight => (
                  <Button
                    key={insight.id}
                    variant={selectedInsight?.id === insight.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getSeverityIcon(insight.severity)}</div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-xs font-medium truncate">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 opacity-50" />
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right column - Selected insight details */}
          <div className="w-full md:w-2/3 p-4">
            {selectedInsight ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    {selectedInsight.title}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {selectedInsight.description}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getSeverityColor(selectedInsight.severity)} text-white`}
                    >
                      {selectedInsight.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <span className="ml-2">{selectedInsight.source}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detected:</span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(selectedInsight.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected records:</span>
                    <span className="ml-2">{selectedInsight.metadata?.affectedRecords || 0}</span>
                  </div>
                </div>
                
                {/* Chart for historical view */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Historical Data Quality Issues</h4>
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 5,
                          left: -20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ fontSize: '12px' }}
                          itemStyle={{ padding: 0 }}
                        />
                        <Bar dataKey="high" name="High" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="medium" name="Medium" stackId="a" fill="#fb923c" />
                        <Bar dataKey="low" name="Low" stackId="a" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select an insight to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
