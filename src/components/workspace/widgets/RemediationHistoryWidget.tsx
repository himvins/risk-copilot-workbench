
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps, RemediationAction } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { formatDistanceToNow } from "date-fns";
import { Shield, CheckCircle, XCircle, Clock, Filter, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function RemediationHistoryWidget({ widget, onClose }: WidgetComponentProps) {
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [activeDetailsTab, setActiveDetailsTab] = useState("details");
  
  // Subscribe to remediation actions
  useEffect(() => {
    const subscription = messageBus.subscribe(
      MessageTopics.AGENT.REMEDIATION_ACTION,
      (action: RemediationAction) => {
        setRemediationActions(prev => {
          // Don't add duplicates
          if (prev.some(a => a.id === action.id)) {
            return prev;
          }
          return [action, ...prev];
        });
        
        // Auto-select the new action if it's the first or if there's no selection
        if (!prev || prev.length === 0 || !selectedAction) {
          setSelectedAction(action);
        }
      }
    );

    // Generate demo data
    if (remediationActions.length === 0) {
      const generateDemoActions = () => {
        const demoActions: RemediationAction[] = [
          {
            id: "ra-1",
            title: "IR Volatility Correction",
            description: "Fixed negative IR volatilities in all affected vol surfaces.",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: "completed",
            actionTaken: "Applied absolute value transformation to negative volatilities and flagged for data provider review.",
            result: "All negative values corrected. Pricing models now produce valid results.",
            metadata: {
              correctedRecords: 157,
              executionTime: "45 seconds"
            }
          },
          {
            id: "ra-2",
            title: "Commodity Curve Tenor Cleanup",
            description: "Removing expired tenors from commodity curves.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            status: "pending",
            actionTaken: "Identifying and removing tenor points with expiration dates in the past.",
            result: "In progress - 65% complete",
            metadata: {
              correctedRecords: 12,
              executionTime: "2 minutes (ongoing)"
            }
          },
          {
            id: "ra-3",
            title: "Schema Correction",
            description: "Attempted to align schema changes with documentation.",
            timestamp: new Date(Date.now() - 1000 * 60 * 180),
            status: "failed",
            actionTaken: "Tried to update field mappings to match new schema.",
            result: "Failed due to insufficient permissions to the schema registry.",
            metadata: {
              correctedRecords: 0,
              executionTime: "12 seconds"
            }
          },
          {
            id: "ra-4",
            title: "Missing EUR_SWAP_6M Curve Fix",
            description: "Remediated missing EUR_SWAP_6M curve by carrying forward previous values.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            status: "completed",
            actionTaken: "Retrieved curve data from previous day and applied appropriate shifts based on related curves.",
            result: "Successfully created a proxy curve with 99.2% confidence level.",
            metadata: {
              correctedRecords: 1,
              executionTime: "37 seconds"
            }
          },
          {
            id: "ra-5",
            title: "CVA Spike Investigation",
            description: "Analyzed and normalized unusual CVA values across counterparties.",
            timestamp: new Date(Date.now() - 1000 * 60 * 300),
            status: "completed",
            actionTaken: "Performed root cause analysis and identified data feed issue with market volatility inputs.",
            result: "Corrected market data inputs and recalculated CVA values. Spike resolved.",
            metadata: {
              correctedRecords: 23,
              executionTime: "68 seconds"
            }
          }
        ];
        
        setRemediationActions(demoActions);
        if (demoActions.length > 0) {
          setSelectedAction(demoActions[0]);
        }
      };
      
      generateDemoActions();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter actions based on selected status
  const filteredActions = remediationActions.filter(action => {
    if (filter === "all") return true;
    return action.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-amber-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Shield size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-amber-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  // For the progress indicator on pending tasks
  const getCompletionPercent = (result: string): number => {
    if (!result.includes("progress")) return 100;
    
    const match = result.match(/(\d+)%/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 50; // Default to 50% if can't determine
  };

  const renderActionDetails = () => {
    if (!selectedAction) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{selectedAction.title}</h3>
          <Badge 
            variant="outline" 
            className={getStatusColor(selectedAction.status)}
          >
            {selectedAction.status}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground">{selectedAction.description}</p>
        
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-medium mb-1">Action Taken:</h4>
          <p className="text-xs">{selectedAction.actionTaken}</p>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-medium mb-1">Result:</h4>
          <p className="text-xs">{selectedAction.result}</p>
          
          {selectedAction.status === "pending" && (
            <div className="mt-2">
              <Progress value={getCompletionPercent(selectedAction.result)} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Records affected:</span>
            <span className="ml-2 font-medium">{selectedAction.metadata?.correctedRecords}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Execution time:</span>
            <span className="ml-2 font-medium">{selectedAction.metadata?.executionTime}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="ml-2 font-medium">
              {new Date(selectedAction.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderActionTimeline = () => {
    if (!selectedAction) return null;

    return (
      <div>
        <h4 className="text-xs font-medium mb-2">Remediation Timeline</h4>
        <ol className="relative border-l border-gray-300 dark:border-gray-600 ml-3">
          <li className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-primary text-primary-foreground text-xs">1</span>
            <h3 className="font-medium text-xs">Issue Detected</h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(selectedAction.timestamp), { addSuffix: true })}
            </p>
          </li>
          <li className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-primary text-primary-foreground text-xs">2</span>
            <h3 className="font-medium text-xs">Analysis Performed</h3>
            <p className="text-xs text-muted-foreground">Automated root cause analysis</p>
          </li>
          <li className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-primary text-primary-foreground text-xs">3</span>
            <h3 className="font-medium text-xs">Remediation Plan Created</h3>
            <p className="text-xs text-muted-foreground">{selectedAction.actionTaken.substring(0, 50)}...</p>
          </li>
          <li className="ml-6">
            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${selectedAction.status === "completed" ? "bg-green-500" : selectedAction.status === "pending" ? "bg-amber-500" : "bg-red-500"} text-white text-xs`}>
              {selectedAction.status === "completed" ? "✓" : selectedAction.status === "pending" ? "..." : "!"}
            </span>
            <h3 className="font-medium text-xs">{selectedAction.status === "completed" ? "Remediation Complete" : selectedAction.status === "pending" ? "Remediation In Progress" : "Remediation Failed"}</h3>
            <p className="text-xs text-muted-foreground">{selectedAction.status === "completed" ? "Action successfully completed" : selectedAction.status === "pending" ? "Action currently being executed" : "Action failed - manual intervention required"}</p>
          </li>
        </ol>
      </div>
    );
  };

  // Detailed remediation summary by type
  const actionSummary = [
    { type: "Data Normalization", count: 3, success: 3 },
    { type: "Missing Value Imputation", count: 2, success: 1 },
    { type: "Schema Correction", count: 1, success: 0 },
    { type: "Tenor Cleanup", count: 1, success: 0 },
    { type: "Market Data Correction", count: 2, success: 2 }
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          History of automated remediation actions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-[calc(100%-1rem)]">
          {/* Left column - List of remediation actions with filters */}
          <div className="w-full md:w-1/3 border-r">
            <div className="p-2 border-b">
              <Tabs 
                defaultValue={filter} 
                onValueChange={(value) => setFilter(value as "all" | "completed" | "pending" | "failed")}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-4 h-8">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="p-3 space-y-1">
                {filteredActions.length > 0 ? (
                  filteredActions.map(action => (
                    <Button
                      key={action.id}
                      variant={selectedAction?.id === action.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setSelectedAction(action)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getStatusIcon(action.status)}</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-xs font-medium truncate">{action.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Filter size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">No actions match the selected filter</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right column - Remediation action details */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue={activeDetailsTab} onValueChange={setActiveDetailsTab} className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                  <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="details" className="p-4 pt-3">
                {selectedAction ? (
                  renderActionDetails()
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    <p>Select a remediation action to view details</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="p-4 pt-3">
                {selectedAction ? (
                  renderActionTimeline()
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    <p>Select a remediation action to view timeline</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="summary" className="p-4 pt-3">
                <div className="space-y-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Remediation Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Actions:</span>
                        <span className="ml-2 font-medium">{remediationActions.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-2 font-medium">
                          {remediationActions.length > 0 ? 
                            Math.round((remediationActions.filter(a => a.status === "completed").length / remediationActions.length) * 100) : 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg. Resolution Time:</span>
                        <span className="ml-2 font-medium">42 seconds</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Records Fixed:</span>
                        <span className="ml-2 font-medium">
                          {remediationActions.reduce((sum, action) => sum + (action.metadata?.correctedRecords || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Remediation Type</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actionSummary.map(item => (
                        <TableRow key={item.type}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.success}</TableCell>
                          <TableCell>
                            {Math.round((item.success / item.count) * 100)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-2">Integration Flow</h4>
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-center">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mb-1">
                          Data Quality Agent
                        </div>
                        <div className="text-muted-foreground">Detection</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-center">
                        <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-md mb-1">
                          Human Review
                        </div>
                        <div className="text-muted-foreground">Decision</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-center">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mb-1">
                          Remediation Agent
                        </div>
                        <div className="text-muted-foreground">Action</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
