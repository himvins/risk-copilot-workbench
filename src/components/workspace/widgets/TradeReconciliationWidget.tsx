
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetComponentProps } from "@/types";
import { AlertTriangle, CheckCircle, Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ReconciliationRecord {
  id: string;
  tradeId: string;
  status: 'matched' | 'unmatched' | 'discrepancy';
  sourceSystem: string;
  targetSystem: string;
  fields: ReconciliationField[];
  lastUpdated: string;
}

interface ReconciliationField {
  fieldName: string;
  displayName: string;
  sourceValue: any;
  targetValue: any;
  status: 'matched' | 'different' | 'missing_source' | 'missing_target';
  tolerance?: number;
  variance?: number;
  critical: boolean;
}

const mockRecords: ReconciliationRecord[] = [
  {
    id: 'rec1',
    tradeId: 'TRD-001',
    status: 'discrepancy',
    sourceSystem: 'Bloomberg',
    targetSystem: 'Internal DB',
    lastUpdated: '2024-01-15 10:30:00',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-001', targetValue: 'TRD-001', status: 'matched', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 1000, targetValue: 1050, status: 'different', variance: 5.0, tolerance: 2.0, critical: true },
      { fieldName: 'price', displayName: 'Price', sourceValue: 150.25, targetValue: 150.20, status: 'different', variance: 0.03, tolerance: 0.1, critical: true },
      { fieldName: 'counterparty', displayName: 'Counterparty', sourceValue: 'Goldman Sachs', targetValue: 'Goldman Sachs', status: 'matched', critical: true },
      { fieldName: 'settleDate', displayName: 'Settlement Date', sourceValue: '2024-01-15', targetValue: null, status: 'missing_target', critical: false },
    ]
  },
  {
    id: 'rec2',
    tradeId: 'TRD-002',
    status: 'matched',
    sourceSystem: 'Bloomberg',
    targetSystem: 'Internal DB',
    lastUpdated: '2024-01-15 10:25:00',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-002', targetValue: 'TRD-002', status: 'matched', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 500, targetValue: 500, status: 'matched', critical: true },
      { fieldName: 'price', displayName: 'Price', sourceValue: 75.50, targetValue: 75.50, status: 'matched', critical: true },
      { fieldName: 'counterparty', displayName: 'Counterparty', sourceValue: 'Morgan Stanley', targetValue: 'Morgan Stanley', status: 'matched', critical: true },
    ]
  },
  {
    id: 'rec3',
    tradeId: 'TRD-003',
    status: 'unmatched',
    sourceSystem: 'Bloomberg',
    targetSystem: 'Internal DB',
    lastUpdated: '2024-01-15 10:20:00',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-003', targetValue: null, status: 'missing_target', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 2000, targetValue: null, status: 'missing_target', critical: true },
      { fieldName: 'price', displayName: 'Price', sourceValue: 200.75, targetValue: null, status: 'missing_target', critical: true },
    ]
  }
];

export function TradeReconciliationWidget({ widget }: WidgetComponentProps) {
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(mockRecords[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const filteredRecords = useMemo(() => {
    return mockRecords.filter(record => {
      const matchesSearch = record.tradeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.sourceSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.targetSystem.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'discrepancy':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'unmatched':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getFieldStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'different':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'missing_source':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'missing_target':
        return <Minus className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getVarianceIcon = (variance?: number, tolerance?: number) => {
    if (!variance || !tolerance) return null;
    
    if (Math.abs(variance) > tolerance) {
      return variance > 0 ? 
        <TrendingUp className="w-4 h-4 text-red-600" /> : 
        <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    
    return variance > 0 ? 
      <TrendingUp className="w-4 h-4 text-yellow-600" /> : 
      <TrendingDown className="w-4 h-4 text-yellow-600" />;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Missing</span>;
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const matchedCount = mockRecords.filter(r => r.status === 'matched').length;
  const discrepancyCount = mockRecords.filter(r => r.status === 'discrepancy').length;
  const unmatchedCount = mockRecords.filter(r => r.status === 'unmatched').length;

  const displayedFields = selectedRecord?.fields.filter(field => 
    !showOnlyCritical || field.critical
  ) || [];

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Trade Reconciliation
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{matchedCount} Matched</Badge>
          <Badge variant="destructive">{discrepancyCount} Discrepancies</Badge>
          <Badge variant="outline">{unmatchedCount} Unmatched</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Records List */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="matched" className="text-xs">Matched</TabsTrigger>
                  <TabsTrigger value="discrepancy" className="text-xs">Issues</TabsTrigger>
                  <TabsTrigger value="unmatched" className="text-xs">Missing</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {filteredRecords.map((record) => (
                  <Card
                    key={record.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-l-4",
                      selectedRecord?.id === record.id && "border-primary bg-primary/5",
                      record.status === 'matched' && "border-l-green-500",
                      record.status === 'discrepancy' && "border-l-yellow-500",
                      record.status === 'unmatched' && "border-l-red-500"
                    )}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{record.tradeId}</span>
                        {getStatusIcon(record.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{record.sourceSystem} → {record.targetSystem}</div>
                        <div>{record.lastUpdated}</div>
                        <div className="flex gap-1">
                          {record.fields.filter(f => f.status === 'different').length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {record.fields.filter(f => f.status === 'different').length} diffs
                            </Badge>
                          )}
                          {record.fields.filter(f => f.status.includes('missing')).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {record.fields.filter(f => f.status.includes('missing')).length} missing
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Detailed Comparison */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedRecord ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRecord.tradeId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecord.sourceSystem} → {selectedRecord.targetSystem}
                    </p>
                  </div>
                  <Button
                    variant={showOnlyCritical ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyCritical(!showOnlyCritical)}
                    className="flex items-center gap-1"
                  >
                    <Filter className="w-4 h-4" />
                    {showOnlyCritical ? "Show All" : "Critical Only"}
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-2">
                    {displayedFields.map((field) => (
                      <Card key={field.fieldName} className={cn(
                        "border-l-4",
                        field.status === 'matched' && "border-l-green-500",
                        field.status === 'different' && "border-l-yellow-500",
                        field.status.includes('missing') && "border-l-red-500"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{field.displayName}</span>
                              {field.critical && (
                                <Badge variant="destructive" className="text-xs">Critical</Badge>
                              )}
                              {getFieldStatusIcon(field.status)}
                            </div>
                            {field.variance !== undefined && field.tolerance !== undefined && (
                              <div className="flex items-center gap-2">
                                {getVarianceIcon(field.variance, field.tolerance)}
                                <Badge 
                                  variant={Math.abs(field.variance) > field.tolerance ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {field.variance > 0 ? '+' : ''}{field.variance.toFixed(2)}%
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Source Value */}
                            <div className={cn(
                              "p-3 rounded-lg border",
                              field.status === 'missing_source' ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                            )}>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {selectedRecord.sourceSystem}
                              </div>
                              <div className="font-mono text-sm">
                                {formatValue(field.sourceValue)}
                              </div>
                            </div>

                            {/* Target Value */}
                            <div className={cn(
                              "p-3 rounded-lg border",
                              field.status === 'missing_target' ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                            )}>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {selectedRecord.targetSystem}
                              </div>
                              <div className="font-mono text-sm">
                                {formatValue(field.targetValue)}
                              </div>
                            </div>
                          </div>

                          {field.status === 'different' && field.tolerance !== undefined && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="text-xs text-yellow-800">
                                <strong>Tolerance:</strong> ±{field.tolerance}% | 
                                <strong> Variance:</strong> {field.variance > 0 ? '+' : ''}{field.variance.toFixed(2)}%
                                {Math.abs(field.variance!) > field.tolerance && (
                                  <span className="ml-2 font-medium text-red-600">Exceeds tolerance!</span>
                                )}
                              </div>
                            </div>
                          )}

                          {field.status.includes('missing') && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                              <div className="text-xs text-red-800">
                                <strong>Issue:</strong> Field missing in {
                                  field.status === 'missing_source' ? selectedRecord.sourceSystem : selectedRecord.targetSystem
                                }
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a trade record to view reconciliation details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
