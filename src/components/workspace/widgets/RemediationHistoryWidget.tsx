
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps, RemediationAction } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { formatDistanceToNow } from "date-fns";
import { Shield, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function RemediationHistoryWidget({ widget, onClose }: WidgetComponentProps) {
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  
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
      }
    );

    // Generate demo data
    if (remediationActions.length === 0) {
      const generateDemoActions = () => {
        const demoActions: RemediationAction[] = [
          {
            id: "ra-1",
            title: "Data Normalization",
            description: "Remediation agent normalized outlier values in transaction dataset.",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: "completed",
            actionTaken: "Statistical normalization applied to outlier values that exceeded 3 standard deviations.",
            result: "97% of identified issues were successfully resolved.",
            metadata: {
              correctedRecords: 157,
              executionTime: "45 seconds"
            }
          },
          {
            id: "ra-2",
            title: "Missing Value Imputation",
            description: "Filling missing values in market data feed with ML-predicted values.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            status: "pending",
            actionTaken: "Advanced ML-based imputation being applied to critical fields.",
            result: "In progress - 65% complete",
            metadata: {
              correctedRecords: 48,
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
            title: "Data Deduplication",
            description: "Removed duplicate transaction records created by system error.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            status: "completed",
            actionTaken: "Identified and removed duplicate entries based on transaction ID and timestamp.",
            result: "Successfully removed 283 duplicate records.",
            metadata: {
              correctedRecords: 283,
              executionTime: "37 seconds"
            }
          },
          {
            id: "ra-5",
            title: "Field Type Correction",
            description: "Converted incorrectly formatted date fields to proper date type.",
            timestamp: new Date(Date.now() - 1000 * 60 * 300),
            status: "completed",
            actionTaken: "Type conversion applied to date fields in string format.",
            result: "All 1,245 records successfully converted.",
            metadata: {
              correctedRecords: 1245,
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
                value={filter} 
                onValueChange={(value) => setFilter(value as any)}
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
          <div className="w-full md:w-2/3 p-4">
            {selectedAction ? (
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
                
                <Separator />
                
                <div>
                  <h4 className="text-xs font-medium mb-2">Timeline</h4>
                  <ol className="relative border-l border-gray-300 dark:border-gray-600 ml-3">
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-primary text-primary-foreground text-xs">1</span>
                      <h3 className="font-medium text-xs">Issue Detected</h3>
                      <p className="text-xs text-muted-foreground">Data quality agent flagged the issue</p>
                    </li>
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-primary text-primary-foreground text-xs">2</span>
                      <h3 className="font-medium text-xs">Analysis Performed</h3>
                      <p className="text-xs text-muted-foreground">Root cause analysis identified solution</p>
                    </li>
                    <li className="ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${selectedAction.status === "completed" ? "bg-green-500" : selectedAction.status === "pending" ? "bg-amber-500" : "bg-red-500"} text-white text-xs`}>
                        {selectedAction.status === "completed" ? "3" : selectedAction.status === "pending" ? "..." : "!"}
                      </span>
                      <h3 className="font-medium text-xs">{selectedAction.status === "completed" ? "Remediation Complete" : selectedAction.status === "pending" ? "Remediation In Progress" : "Remediation Failed"}</h3>
                      <p className="text-xs text-muted-foreground">{selectedAction.status === "completed" ? "Action successfully completed" : selectedAction.status === "pending" ? "Action currently being executed" : "Action failed - manual intervention required"}</p>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a remediation action to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
