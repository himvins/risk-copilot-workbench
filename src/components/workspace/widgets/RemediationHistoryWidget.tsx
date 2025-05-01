
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps, RemediationAction } from "@/types";
import { useState, useEffect } from "react";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { Shield, Hourglass, Check, X, Clock, Calendar, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription } from "@/components/ui/timeline";

export function RemediationHistoryWidget({ widget, onClose }: WidgetComponentProps) {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  // Subscribe to remediation actions
  useEffect(() => {
    const subscription = messageBus.subscribe(
      MessageTopics.AGENT.REMEDIATION_ACTION,
      (action: RemediationAction) => {
        setActions(prev => {
          // Don't add duplicates
          if (prev.some(a => a.id === action.id)) {
            return prev;
          }
          return [action, ...prev];
        });
      }
    );

    // Generate some initial actions for demo
    if (actions.length === 0) {
      const generateRandomActions = () => {
        const demoActions: RemediationAction[] = [
          {
            id: "rem-1",
            title: "Automated Data Correction",
            description: "Automatically corrected missing values in transaction dataset using predictive modeling.",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: "completed",
            actionTaken: "Applied MICE (Multivariate Imputation by Chained Equations) algorithm to fill missing values based on historical patterns.",
            result: "Successfully imputed 157 missing values with 95% confidence interval.",
            metadata: {
              executionTime: "45 seconds",
              modelAccuracy: "97.3%"
            }
          },
          {
            id: "rem-2",
            title: "Schema Validation Enhancement",
            description: "Updated schema validation rules to prevent future data schema drift issues.",
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            status: "completed",
            actionTaken: "Added strict schema validation at data ingestion points with automated alerts.",
            result: "Schema validation now enforced across all 12 data pipelines.",
            metadata: {
              executionTime: "2 minutes",
              affectedSystems: "Data Ingestion, ETL Pipeline, Data Lake"
            }
          },
          {
            id: "rem-3",
            title: "Anomaly Detection Model Update",
            description: "Updating anomaly detection models to improve accuracy for market volatility data.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: "pending",
            actionTaken: "Training new LSTM neural network model with expanded feature set.",
            result: "Model training in progress, estimated completion in 30 minutes.",
            metadata: {
              progress: "65%",
              estimatedCompletion: "30 minutes"
            }
          },
          {
            id: "rem-4",
            title: "Data Pipeline Recovery",
            description: "Attempted recovery of failed data pipeline for overnight batch processing.",
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            status: "failed",
            actionTaken: "Executed automatic retry with exponential backoff strategy.",
            result: "Failed to recover after 5 attempts. Marked for manual intervention.",
            metadata: {
              errorCode: "CONN_TIMEOUT",
              attempts: 5
            }
          }
        ];
        
        setActions(demoActions);
        if (demoActions.length > 0) {
          setSelectedAction(demoActions[0]);
        }
      };
      
      generateRandomActions();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredActions = actions.filter(action => {
    if (filter === "all") return true;
    return action.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check size={14} className="text-green-600" />;
      case "pending":
        return <Hourglass size={14} className="text-amber-500" />;
      case "failed":
        return <X size={14} className="text-red-600" />;
      default:
        return <Shield size={14} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFormattedDate = (date: Date) => {
    return format(new Date(date), "PPP p");
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          History of actions taken by the remediation agent
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">In Progress</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={filter} className="mt-0">
            <div className="flex flex-col md:flex-row h-[calc(100%-2rem)]">
              {/* Left column - List of actions */}
              <div className="w-full md:w-2/5 border-r">
                <ScrollArea className="h-[300px]">
                  <div className="p-3 space-y-1">
                    {filteredActions.map(action => (
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
                          <ChevronRight size={14} className="shrink-0 opacity-50" />
                        </div>
                      </Button>
                    ))}
                    
                    {filteredActions.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No {filter !== "all" ? filter : ""} actions found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Right column - Selected action details */}
              <div className="w-full md:w-3/5 p-4">
                {selectedAction ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{selectedAction.title}</h3>
                        {getStatusBadge(selectedAction.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                    </div>
                    
                    <Timeline>
                      <TimelineItem>
                        <TimelineHeader>
                          <TimelineIcon>
                            <Calendar size={12} />
                          </TimelineIcon>
                          <TimelineTitle className="text-sm">Action Initiated</TimelineTitle>
                        </TimelineHeader>
                        <TimelineDescription className="text-xs">
                          {getFormattedDate(selectedAction.timestamp)}
                        </TimelineDescription>
                      </TimelineItem>
                      
                      <TimelineConnector />
                      
                      <TimelineItem>
                        <TimelineHeader>
                          <TimelineIcon>
                            <Shield size={12} />
                          </TimelineIcon>
                          <TimelineTitle className="text-sm">Action Taken</TimelineTitle>
                        </TimelineHeader>
                        <TimelineDescription className="text-xs">
                          {selectedAction.actionTaken}
                        </TimelineDescription>
                      </TimelineItem>
                      
                      <TimelineConnector />
                      
                      <TimelineItem>
                        <TimelineHeader>
                          <TimelineIcon>
                            {selectedAction.status === "completed" ? (
                              <Check size={12} />
                            ) : selectedAction.status === "failed" ? (
                              <X size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                          </TimelineIcon>
                          <TimelineTitle className="text-sm">Result</TimelineTitle>
                        </TimelineHeader>
                        <TimelineDescription className="text-xs">
                          {selectedAction.result}
                        </TimelineDescription>
                      </TimelineItem>
                    </Timeline>
                    
                    {selectedAction.metadata && (
                      <div className="rounded-md border p-3">
                        <h4 className="text-sm font-medium mb-2">Details</h4>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          {Object.entries(selectedAction.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select an action to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
