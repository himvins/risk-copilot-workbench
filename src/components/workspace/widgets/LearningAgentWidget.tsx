
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps, LearningEvent } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { BookOpen, Database, BarChart as BarChartIcon, PieChart, Brain, Network, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";

export function LearningAgentWidget({ widget, onClose }: WidgetComponentProps) {
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LearningEvent | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);
  const [dataSourceDistribution, setDataSourceDistribution] = useState<any[]>([]);

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

    // Generate some initial events for demo
    if (learningEvents.length === 0) {
      const generateDemoData = () => {
        // Sample learning events
        const demoEvents: LearningEvent[] = [
          {
            id: "learn-1",
            title: "Market Volatility Pattern Analysis",
            description: "Training completed on historical market volatility patterns to improve risk predictions.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            dataSource: "Historical Market Data API",
            dataPoints: 125000,
            learningType: "supervised",
            metrics: {
              accuracy: 0.923,
              precision: 0.887,
              recall: 0.912,
              f1Score: 0.899
            }
          },
          {
            id: "learn-2",
            title: "Anomaly Detection Enhancement",
            description: "Unsupervised learning to identify novel transaction anomaly patterns.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            dataSource: "Transaction Database",
            dataPoints: 78500,
            learningType: "unsupervised",
            metrics: {
              silhouetteScore: 0.76,
              dbscanEpsilon: 0.12,
              clusterCount: 6
            }
          },
          {
            id: "learn-3",
            title: "Risk Management Policy Optimization",
            description: "Reinforcement learning to optimize risk threshold policies for different market conditions.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
            dataSource: "Risk Management Framework",
            dataPoints: 15800,
            learningType: "reinforcement",
            metrics: {
              averageReward: 0.653,
              policyConvergence: 0.98,
              episodesUntilConvergence: 1250
            }
          },
          {
            id: "learn-4",
            title: "Credit Risk Transfer Learning",
            description: "Transfer learning applied to adapt credit risk models to new market segments.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            dataSource: "Credit Bureau API",
            dataPoints: 42000,
            learningType: "supervised",
            metrics: {
              accuracy: 0.892,
              precision: 0.867,
              recall: 0.831,
              f1Score: 0.848
            }
          }
        ];
        
        setLearningEvents(demoEvents);
        if (demoEvents.length > 0) {
          setSelectedEvent(demoEvents[0]);
        }
        
        // Model performance over time
        const performanceData = [];
        for (let i = 10; i >= 0; i--) {
          performanceData.push({
            iteration: `Iter ${10-i}`,
            accuracy: (0.75 + (Math.random() * 0.05) + (0.15 * (10-i)/10)).toFixed(3),
            loss: (0.5 - (Math.random() * 0.05) - (0.3 * (10-i)/10)).toFixed(3),
          });
        }
        setModelPerformance(performanceData);
        
        // Data source distribution
        setDataSourceDistribution([
          { name: 'Market Data', value: 42 },
          { name: 'Transaction DB', value: 28 },
          { name: 'Credit API', value: 15 },
          { name: 'External Feed', value: 10 },
          { name: 'User Feedback', value: 5 }
        ]);
      };
      
      generateDemoData();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getLearningTypeIcon = (type: string) => {
    switch (type) {
      case "supervised":
        return <LineChart size={16} className="text-blue-500" />;
      case "unsupervised":
        return <Network size={16} className="text-purple-500" />;
      case "reinforcement":
        return <Brain size={16} className="text-green-500" />;
      default:
        return <LineChart size={16} />;
    }
  };

  const getLearningTypeBadge = (type: string) => {
    switch (type) {
      case "supervised":
        return (
          <Badge className="bg-blue-500/80">
            <LineChart size={12} className="mr-1" />
            Supervised
          </Badge>
        );
      case "unsupervised":
        return (
          <Badge className="bg-purple-500/80">
            <Network size={12} className="mr-1" />
            Unsupervised
          </Badge>
        );
      case "reinforcement":
        return (
          <Badge className="bg-green-500/80">
            <Brain size={12} className="mr-1" />
            Reinforcement
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          Transparency into AI learning processes and data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left column - List of learning events */}
          <div className="w-full md:w-1/3 border-r">
            <ScrollArea className="h-[300px]">
              <div className="py-1">
                {learningEvents.map(event => (
                  <button
                    key={event.id}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 ${
                      selectedEvent?.id === event.id ? 'bg-muted/70' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="mt-0.5">{getLearningTypeIcon(event.learningType)}</div>
                    <div className="flex-1">
                      <h4 className="text-xs font-medium">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(event.dataPoints).toLocaleString()} data points
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right column - Selected event details with tabs */}
          <div className="w-full md:w-2/3">
            {selectedEvent ? (
              <div>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{selectedEvent.title}</h3>
                    {getLearningTypeBadge(selectedEvent.learningType)}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
                
                <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <div className="px-4 pt-2">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="data">Data Sources</TabsTrigger>
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="overview" className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Learning Type</p>
                        <p className="text-sm font-medium capitalize">{selectedEvent.learningType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Data Source</p>
                        <p className="text-sm font-medium">{selectedEvent.dataSource}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Data Points</p>
                        <p className="text-sm font-medium">{Number(selectedEvent.dataPoints).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Processed</p>
                        <p className="text-sm font-medium">
                          {formatDistanceToNow(new Date(selectedEvent.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {selectedEvent.learningType === "supervised" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-xs font-medium">Accuracy</p>
                            <p className="text-xs">{(Number(selectedEvent.metrics?.accuracy) * 100).toFixed(1)}%</p>
                          </div>
                          <Progress value={Number(selectedEvent.metrics?.accuracy) * 100} className="h-1" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-xs font-medium">Precision</p>
                            <p className="text-xs">{(Number(selectedEvent.metrics?.precision) * 100).toFixed(1)}%</p>
                          </div>
                          <Progress value={Number(selectedEvent.metrics?.precision) * 100} className="h-1" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-xs font-medium">Recall</p>
                            <p className="text-xs">{(Number(selectedEvent.metrics?.recall) * 100).toFixed(1)}%</p>
                          </div>
                          <Progress value={Number(selectedEvent.metrics?.recall) * 100} className="h-1" />
                        </div>
                      </div>
                    )}
                    
                    {selectedEvent.learningType === "unsupervised" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 border rounded-md">
                            <p className="text-xs text-muted-foreground">Silhouette Score</p>
                            <p className="text-sm font-medium">{selectedEvent.metrics?.silhouetteScore}</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="text-xs text-muted-foreground">Cluster Count</p>
                            <p className="text-sm font-medium">{selectedEvent.metrics?.clusterCount}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedEvent.learningType === "reinforcement" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 border rounded-md">
                            <p className="text-xs text-muted-foreground">Average Reward</p>
                            <p className="text-sm font-medium">{selectedEvent.metrics?.averageReward}</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="text-xs text-muted-foreground">Policy Convergence</p>
                            <p className="text-sm font-medium">{selectedEvent.metrics?.policyConvergence}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="data" className="px-4 pt-2 pb-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={14} />
                      <h4 className="text-sm font-medium">Data Source Distribution</h4>
                    </div>
                    
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={dataSourceDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {dataSourceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Learning uses multiple data sources to provide comprehensive insights.</p>
                      <ul className="list-disc pl-4 mt-2">
                        <li>Main source: {selectedEvent.dataSource}</li>
                        <li>Total data points: {Number(selectedEvent.dataPoints).toLocaleString()}</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metrics" className="px-4 pt-2 pb-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <History size={14} />
                      <h4 className="text-sm font-medium">Model Performance Over Time</h4>
                    </div>
                    
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={modelPerformance}
                          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="iteration" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: '12px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 6 }} strokeWidth={2} />
                          <Line type="monotone" dataKey="loss" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>This chart shows how the model's performance has improved over training iterations.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
                <BookOpen size={24} className="mb-2 opacity-50" />
                <p>Select a learning event to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
