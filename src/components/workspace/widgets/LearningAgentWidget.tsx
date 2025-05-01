
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps, LearningEvent } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Database, BarChart2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";

export function LearningAgentWidget({ widget, onClose }: WidgetComponentProps) {
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LearningEvent | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dataSources, setDataSources] = useState<{name: string, count: number, lastUpdated: Date}[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  // Subscribe to learning events
  useEffect(() => {
    const subscription = messageBus.subscribe(
      MessageTopics.AGENT.LEARNING_UPDATE,
      (event: LearningEvent) => {
        setLearningEvents(prev => {
          // Don't add duplicates
          if (prev.some(e => e.id === event.id)) {
            return prev;
          }
          return [event, ...prev];
        });
      }
    );

    // Generate demo data
    if (learningEvents.length === 0) {
      const generateDemoData = () => {
        // Generate demo learning events
        const demoEvents: LearningEvent[] = [
          {
            id: "le-1",
            title: "Market Volatility Model Update",
            description: "Learning agent has processed recent market volatility data to update prediction models.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            dataSource: "Market Data API",
            dataPoints: 24560,
            learningType: "supervised",
            metrics: {
              accuracy: "0.921",
              precision: "0.895",
              recall: "0.887",
              f1Score: "0.891"
            }
          },
          {
            id: "le-2",
            title: "Transaction Pattern Analysis",
            description: "Unsupervised learning completed on transaction patterns to identify new clusters of behavior.",
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            dataSource: "Transaction Database",
            dataPoints: 58920,
            learningType: "unsupervised",
            metrics: {
              accuracy: "0.843",
              precision: "0.829",
              recall: "0.856",
              f1Score: "0.842"
            }
          },
          {
            id: "le-3",
            title: "Risk Assessment Model Training",
            description: "Reinforcement learning model updated with feedback from risk analysts.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            dataSource: "Risk Feedback System",
            dataPoints: 12480,
            learningType: "reinforcement",
            metrics: {
              accuracy: "0.902",
              precision: "0.884",
              recall: "0.893",
              f1Score: "0.888"
            }
          }
        ];
        
        setLearningEvents(demoEvents);
        if (demoEvents.length > 0) {
          setSelectedEvent(demoEvents[0]);
        }
        
        // Generate data sources
        const demoDataSources = [
          { name: "Market Data API", count: 24560, lastUpdated: new Date(Date.now() - 1000 * 60 * 30) },
          { name: "Transaction Database", count: 58920, lastUpdated: new Date(Date.now() - 1000 * 60 * 120) },
          { name: "Risk Feedback System", count: 12480, lastUpdated: new Date(Date.now() - 1000 * 60 * 240) },
          { name: "Regulatory Filings", count: 8450, lastUpdated: new Date(Date.now() - 1000 * 60 * 360) },
          { name: "Customer Behavior", count: 32180, lastUpdated: new Date(Date.now() - 1000 * 60 * 480) },
        ];
        
        setDataSources(demoDataSources);
        
        // Generate metrics history
        const now = new Date();
        const demoMetrics = [];
        
        // Last 7 training runs
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          
          const baseAccuracy = 0.80 + (Math.random() * 0.02);
          
          demoMetrics.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            accuracy: Math.min(0.99, baseAccuracy + (Math.random() * 0.05)).toFixed(3),
            precision: Math.min(0.99, baseAccuracy - 0.01 + (Math.random() * 0.05)).toFixed(3),
            recall: Math.min(0.99, baseAccuracy - 0.02 + (Math.random() * 0.05)).toFixed(3),
            f1Score: Math.min(0.99, baseAccuracy - 0.01 + (Math.random() * 0.04)).toFixed(3),
          });
        }
        
        setMetricsHistory(demoMetrics);
      };
      
      generateDemoData();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getColorForLearningType = (type: string) => {
    switch (type) {
      case "supervised":
        return "bg-blue-500";
      case "unsupervised":
        return "bg-purple-500";
      case "reinforcement":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {selectedEvent ? (
        <>
          <div className="bg-muted/40 p-3 rounded-md">
            <h3 className="text-sm font-medium mb-1">{selectedEvent.title}</h3>
            <p className="text-xs text-muted-foreground">{selectedEvent.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge 
                variant="outline" 
                className={`${getColorForLearningType(selectedEvent.learningType)} text-white`}
              >
                {selectedEvent.learningType}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(selectedEvent.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="text-xs font-medium mb-2">Data Source</h4>
              <p className="text-sm">{selectedEvent.dataSource}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedEvent.dataPoints.toLocaleString()} data points processed
              </p>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="text-xs font-medium mb-2">Model Performance</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Accuracy: <span className="font-mono">{selectedEvent.metrics.accuracy}</span></div>
                <div>Precision: <span className="font-mono">{selectedEvent.metrics.precision}</span></div>
                <div>Recall: <span className="font-mono">{selectedEvent.metrics.recall}</span></div>
                <div>F1 Score: <span className="font-mono">{selectedEvent.metrics.f1Score}</span></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2">Learning Process</h4>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-muted-foreground/30"></div>
              </div>
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="bg-background border rounded-full w-6 h-6 flex items-center justify-center text-xs">1</div>
                  <span className="text-xs mt-1">Data Collection</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-background border rounded-full w-6 h-6 flex items-center justify-center text-xs">2</div>
                  <span className="text-xs mt-1">Preprocessing</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-background border rounded-full w-6 h-6 flex items-center justify-center text-xs">3</div>
                  <span className="text-xs mt-1">Model Training</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-background border border-primary rounded-full w-6 h-6 flex items-center justify-center text-xs text-primary">4</div>
                  <span className="text-xs mt-1">Validation</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-background border rounded-full w-6 h-6 flex items-center justify-center text-xs">5</div>
                  <span className="text-xs mt-1">Deployment</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          <p>Select a learning event to view details</p>
        </div>
      )}
    </div>
  );

  const renderDataSourcesTab = () => (
    <div className="space-y-4">
      <div className="bg-muted/40 p-3 rounded-md">
        <h3 className="text-sm font-medium">Data Sources Overview</h3>
        <p className="text-xs text-muted-foreground mt-1">The learning agent integrates data from multiple sources to build comprehensive models.</p>
      </div>
      
      <ScrollArea className="h-[200px]">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-2">Source Name</th>
              <th className="text-right p-2">Data Points</th>
              <th className="text-right p-2">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((source) => (
              <tr key={source.name} className="hover:bg-muted/30">
                <td className="p-2">{source.name}</td>
                <td className="text-right p-2">{source.count.toLocaleString()}</td>
                <td className="text-right p-2 whitespace-nowrap">
                  {formatDistanceToNow(source.lastUpdated, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      
      <div>
        <h4 className="text-xs font-medium mb-2">Data Integration Architecture</h4>
        <div className="p-2 bg-muted/30 rounded-md text-xs">
          <div className="flex flex-col">
            <div className="flex justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-blue-500" />
                <span>External APIs</span>
              </div>
              <span className="text-muted-foreground">3 sources</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-purple-500" />
                <span>Internal Databases</span>
              </div>
              <span className="text-muted-foreground">5 sources</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-emerald-500" />
                <span>Real-time Feeds</span>
              </div>
              <span className="text-muted-foreground">2 sources</span>
            </div>
            <div className="flex justify-between pt-2">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-amber-500" />
                <span>Batch Processes</span>
              </div>
              <span className="text-muted-foreground">4 sources</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-4">
      <div className="bg-muted/40 p-3 rounded-md">
        <h3 className="text-sm font-medium">Performance Metrics</h3>
        <p className="text-xs text-muted-foreground mt-1">Tracking the learning agent's performance over time.</p>
      </div>
      
      <div>
        <h4 className="text-xs font-medium mb-2">Metrics Over Time</h4>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricsHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0.7, 1]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="precision" stroke="#10b981" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="recall" stroke="#f59e0b" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="f1Score" stroke="#8b5cf6" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-medium mb-1">Current Model Status</h4>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm">Operational</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last evaluated 2 hours ago</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-medium mb-1">Next Training Run</h4>
          <div className="text-sm mt-2">Scheduled in 4 hours</div>
          <p className="text-xs text-muted-foreground mt-1">Expected data points: ~15,000</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          Insights into the AI learning process and data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-[calc(100%-1rem)]">
          {/* Left column - List of learning events */}
          <div className="w-full md:w-1/3 border-r">
            <ScrollArea className="h-[300px]">
              <div className="p-3 space-y-1">
                {learningEvents.map(event => (
                  <Button
                    key={event.id}
                    variant={selectedEvent?.id === event.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${getColorForLearningType(event.learningType)}`} />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-xs font-medium truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right column - Learning details with tabs */}
          <div className="w-full md:w-2/3 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
                <TabsTrigger value="datasources" className="flex-1 text-xs">Data Sources</TabsTrigger>
                <TabsTrigger value="metrics" className="flex-1 text-xs">Metrics</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="overview" className="m-0">
                  {renderOverviewTab()}
                </TabsContent>
                
                <TabsContent value="datasources" className="m-0">
                  {renderDataSourcesTab()}
                </TabsContent>
                
                <TabsContent value="metrics" className="m-0">
                  {renderMetricsTab()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
