
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function DataQualityInsightsWidget({ widget, onClose }: WidgetComponentProps) {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AgentInsight | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "actions">("details");
  const [actionPlan, setActionPlan] = useState({
    stopBatch: false,
    notifyUsers: false,
    dataStrategy: "wait" // "carry" or "wait"
  });
  const [status, setStatus] = useState<"alert" | "remediated" | "processing">("alert");

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
      const generateDemoInsights = () => {
        const demoInsights: AgentInsight[] = [
          {
            id: "dqi-1",
            title: "Critical Alert: Negative IR volatilities",
            description: "Negative IR volatilities found for all vol surfaces. This will cause pricing failures and incorrect risk calculations.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            severity: "critical",
            source: "Interest Rate Volatility Data",
            relatedEntities: ["vol_surfaces", "pricing_models"],
            metadata: {
              affectedRecords: 157,
              confidenceScore: 0.92
            }
          },
          {
            id: "dqi-2",
            title: "High Alert: CVA spike over threshold",
            description: "Significant spike in CVA values detected across multiple counterparties, exceeding defined threshold by 35%.",
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            severity: "high",
            source: "CVA Calculation Engine",
            relatedEntities: ["counterparties", "credit_models"],
            metadata: {
              affectedRecords: 23,
              confidenceScore: 0.78
            }
          },
          {
            id: "dqi-3",
            title: "High Alert: Commodity curves have expired tenors",
            description: "Multiple commodity curves contain expired tenor points which should be removed from the dataset.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            severity: "high",
            source: "Commodity Pricing Data",
            relatedEntities: ["commodity_curves", "pricing_models"],
            metadata: {
              affectedRecords: 18,
              confidenceScore: 0.85
            }
          },
          {
            id: "dqi-4",
            title: "Medium Alert: Curve data missing",
            description: "Curve data missing for one curve (EUR_SWAP_6M). This may affect related pricing models.",
            timestamp: new Date(Date.now() - 1000 * 60 * 300),
            severity: "medium",
            source: "Interest Rate Data Service",
            relatedEntities: ["swap_curves", "pricing_models"],
            metadata: {
              affectedRecords: 1,
              confidenceScore: 0.89
            }
          }
        ];
        
        setInsights(demoInsights);
        if (demoInsights.length > 0) {
          setSelectedInsight(demoInsights[0]);
        }
      };
      
      generateDemoInsights();
    }

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

  const handleAcceptAction = () => {
    // Simulate accepting the action plan
    setStatus("processing");
    setTimeout(() => {
      // In a real app, this would communicate with the remediation agent
      if (selectedInsight?.severity === "critical") {
        // Simulate triggering the remediation agent
        messageBus.publish(MessageTopics.AGENT.REMEDIATION_ACTION, {
          id: `ra-${Date.now()}`,
          title: `Remediation for ${selectedInsight.title}`,
          description: `Attempting to fix: ${selectedInsight.description}`,
          timestamp: new Date(),
          status: "pending",
          actionTaken: actionPlan.stopBatch ? "Stopped batch processing" : "Processing continues with monitoring",
          result: "In progress - awaiting results",
          metadata: {
            correctedRecords: 0,
            executionTime: "Ongoing"
          }
        });
        
        // Open the remediation history widget
        import("@/lib/workspaceService").then(({ workspaceService }) => {
          workspaceService.addWidgetByType("remediation-history");
        });

        // Update the status to show it's being processed
        setStatus("processing");
      } else {
        // For non-critical alerts, simulate immediate resolution
        setStatus("remediated");
      }
    }, 1500);
  };

  const handleRejectAlert = () => {
    // Remove the alert from the list
    setInsights(insights.filter(i => i.id !== selectedInsight?.id));
    if (insights.length > 1) {
      setSelectedInsight(insights.find(i => i.id !== selectedInsight?.id) || null);
    } else {
      setSelectedInsight(null);
    }
  };

  const handleEscalateAlert = () => {
    if (!selectedInsight) return;
    
    // Escalate the alert severity
    const updatedInsights = insights.map(insight => 
      insight.id === selectedInsight.id 
        ? {...insight, severity: "critical"} 
        : insight
    );
    
    setInsights(updatedInsights);
    setSelectedInsight({...selectedInsight, severity: "critical"});
  };

  const handleRunAgentAgain = () => {
    // Simulate running the DQ agent again
    setStatus("alert");
    if (selectedInsight) {
      // Simulate a slightly updated insight
      const updatedInsight = {
        ...selectedInsight,
        metadata: {
          ...selectedInsight.metadata,
          confidenceScore: Math.min(0.99, (selectedInsight.metadata?.confidenceScore || 0) + 0.05)
        },
        timestamp: new Date()
      };
      
      setSelectedInsight(updatedInsight);
      setInsights(insights.map(i => i.id === selectedInsight.id ? updatedInsight : i));
    }
    
    // Reset action plan
    setActionPlan({
      stopBatch: false,
      notifyUsers: false,
      dataStrategy: "wait"
    });
  };

  const renderNextBestActions = () => {
    if (!selectedInsight) return null;
    
    if (status === "processing") {
      return (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Processing Remediation</h3>
            <Badge variant="outline" className="bg-blue-500 text-white">In Progress</Badge>
          </div>
          <p className="text-xs mt-2 text-blue-700 dark:text-blue-400">
            Your remediation request is being processed. Check the Remediation History widget for updates.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleRunAgentAgain}>
              Check Status Again
            </Button>
          </div>
        </div>
      );
    }
    
    if (status === "remediated") {
      return (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Remediation Complete</h3>
            <Badge variant="outline" className="bg-green-500 text-white">Completed</Badge>
          </div>
          <p className="text-xs mt-2 text-green-700 dark:text-green-400">
            The issue has been successfully remediated. The batch can proceed normally.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleRunAgentAgain}>
              Run Agent Again
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-muted/40 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Next Best Actions</h3>
          
          {selectedInsight.severity === "critical" && (
            <>
              <div className="flex items-start space-x-2 mb-2">
                <Checkbox 
                  id="stopBatch" 
                  checked={actionPlan.stopBatch}
                  onCheckedChange={(checked) => 
                    setActionPlan(prev => ({...prev, stopBatch: !!checked}))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="stopBatch" className="text-sm">
                    Stop the batch
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Prevents incorrect data from flowing downstream
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 mb-2">
                <Checkbox 
                  id="notifyUsers" 
                  checked={actionPlan.notifyUsers}
                  onCheckedChange={(checked) => 
                    setActionPlan(prev => ({...prev, notifyUsers: !!checked}))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="notifyUsers" className="text-sm">
                    Notify upstream users
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alerts data providers about the issue
                  </p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <RadioGroup 
                value={actionPlan.dataStrategy}
                onValueChange={(value) => 
                  setActionPlan(prev => ({...prev, dataStrategy: value}))
                }
              >
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="carry" id="carry" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="carry" className="text-sm">
                      Carry forward from previous date
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Use last known good data until issue is resolved
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="wait" id="wait" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="wait" className="text-sm">
                      Wait for remediated data from upstream
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Pause processing until fixed data is available
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </>
          )}
          
          {selectedInsight.severity === "high" && (
            <>
              <div className="flex items-start space-x-2 mb-2">
                <Checkbox 
                  id="escalate" 
                  checked={false}
                  onCheckedChange={() => handleEscalateAlert()}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="escalate" className="text-sm">
                    Escalate to Critical
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upgrade severity if issue is blocking
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="monitor" 
                  defaultChecked
                  disabled
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="monitor" className="text-sm">
                    Continue with monitoring
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Track the issue but allow processing to continue
                  </p>
                </div>
              </div>
            </>
          )}
          
          {selectedInsight.severity === "medium" && (
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="carryForward" 
                defaultChecked
                disabled
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="carryForward" className="text-sm">
                  Carry forward from previous data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use previous day's data for the missing curve
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRejectAlert}
          >
            Reject Alert
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleAcceptAction}
          >
            Accept & Implement
          </Button>
        </div>
      </div>
    );
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
                    onClick={() => {
                      setSelectedInsight(insight);
                      setStatus("alert"); // Reset status when selecting a new insight
                    }}
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
                <Alert className={`border-l-4 border-${getSeverityColor(selectedInsight.severity).replace('bg-', '')}`}>
                  {getSeverityIcon(selectedInsight.severity)}
                  <AlertTitle className="text-sm font-medium">
                    {selectedInsight.title}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {selectedInsight.description}
                  </AlertDescription>
                </Alert>
                
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "actions")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Issue Details</TabsTrigger>
                    <TabsTrigger value="actions">Next Best Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-4 space-y-4">
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
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Related entities:</span>
                        <span className="ml-2">{selectedInsight.relatedEntities?.join(", ")}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Confidence score:</span>
                        <span className="ml-2">{(selectedInsight.metadata?.confidenceScore || 0) * 100}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/40 p-3 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Expected Impact</h3>
                      <p className="text-xs">
                        {selectedInsight.severity === "critical" 
                          ? "This issue will cause incorrect calculations and potentially lead to financial misstatements. Immediate attention required."
                          : selectedInsight.severity === "high"
                          ? "This issue may impact accuracy of risk calculations and should be addressed promptly."
                          : "This issue has limited impact but should be resolved to maintain data quality standards."
                        }
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    {renderNextBestActions()}
                  </TabsContent>
                </Tabs>
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
