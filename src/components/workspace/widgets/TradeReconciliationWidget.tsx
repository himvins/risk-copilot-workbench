
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetComponentProps } from "@/types";
import { AlertTriangle, CheckCircle, Search, Filter, TrendingUp, TrendingDown, Minus, GitMerge } from "lucide-react";
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
    lastUpdated: '10:30',
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
    lastUpdated: '10:25',
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
    lastUpdated: '10:20',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-003', targetValue: null, status: 'missing_target', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 2000, targetValue: null, status: 'missing_target', critical: true },
      { fieldName: 'price', displayName: 'Price', sourceValue: 200.75, targetValue: null, status: 'missing_target', critical: true },
    ]
  },
  {
    id: 'rec4',
    tradeId: 'TRD-004',
    status: 'discrepancy',
    sourceSystem: 'Bloomberg',
    targetSystem: 'Internal DB',
    lastUpdated: '10:15',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-004', targetValue: 'TRD-004', status: 'matched', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 750, targetValue: 800, status: 'different', variance: 6.7, tolerance: 3.0, critical: true },
      { fieldName: 'price', displayName: 'Price', sourceValue: 98.75, targetValue: 98.50, status: 'different', variance: 0.25, tolerance: 0.5, critical: true },
    ]
  },
  {
    id: 'rec5',
    tradeId: 'TRD-005',
    status: 'matched',
    sourceSystem: 'Bloomberg',
    targetSystem: 'Internal DB',
    lastUpdated: '10:10',
    fields: [
      { fieldName: 'tradeId', displayName: 'Trade ID', sourceValue: 'TRD-005', targetValue: 'TRD-005', status: 'matched', critical: true },
      { fieldName: 'quantity', displayName: 'Quantity', sourceValue: 1200, targetValue: 1200, status: 'matched', critical: true },
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
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'discrepancy':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'unmatched':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getFieldStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'different':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'missing_source':
        return <Minus className="w-3 h-3 text-red-600" />;
      case 'missing_target':
        return <Minus className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getVarianceIcon = (variance?: number, tolerance?: number) => {
    if (!variance || !tolerance) return null;
    
    if (Math.abs(variance) > tolerance) {
      return variance > 0 ? 
        <TrendingUp className="w-3 h-3 text-red-600" /> : 
        <TrendingDown className="w-3 h-3 text-red-600" />;
    }
    
    return variance > 0 ? 
      <TrendingUp className="w-3 h-3 text-yellow-600" /> : 
      <TrendingDown className="w-3 h-3 text-yellow-600" />;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic text-xs">Missing</span>;
    if (typeof value === 'number') return <span className="font-mono text-xs">{value.toLocaleString()}</span>;
    return <span className="font-mono text-xs">{String(value)}</span>;
  };

  const matchedCount = mockRecords.filter(r => r.status === 'matched').length;
  const discrepancyCount = mockRecords.filter(r => r.status === 'discrepancy').length;
  const unmatchedCount = mockRecords.filter(r => r.status === 'unmatched').length;

  const displayedFields = selectedRecord?.fields.filter(field => 
    !showOnlyCritical || field.critical
  ) || [];

  const statusFilterOptions = [
    { value: 'all', label: 'All', count: mockRecords.length },
    { value: 'matched', label: 'OK', count: matchedCount },
    { value: 'discrepancy', label: 'Issues', count: discrepancyCount },
    { value: 'unmatched', label: 'Missing', count: unmatchedCount },
  ];

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitMerge className="w-4 h-4" />
            Trade Reconciliation
          </CardTitle>
          <Button
            variant={showOnlyCritical ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyCritical(!showOnlyCritical)}
            className="h-7 text-xs px-2"
          >
            <Filter className="w-3 h-3 mr-1" />
            {showOnlyCritical ? "All" : "Critical"}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">{matchedCount} Matched</Badge>
          <Badge variant="destructive" className="text-xs">{discrepancyCount} Discrepancies</Badge>
          <Badge variant="outline" className="text-xs">{unmatchedCount} Unmatched</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
          {/* Records List */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>

              <div className="flex gap-1">
                {statusFilterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={statusFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(option.value)}
                    className="h-7 text-[10px] px-2 flex-1"
                  >
                    {option.label}
                    <Badge variant="secondary" className="ml-1 text-[9px] px-1">
                      {option.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "p-2 rounded border cursor-pointer transition-all hover:shadow-sm border-l-2 text-xs",
                      selectedRecord?.id === record.id && "border-primary bg-primary/5",
                      record.status === 'matched' && "border-l-green-500",
                      record.status === 'discrepancy' && "border-l-yellow-500",
                      record.status === 'unmatched' && "border-l-red-500"
                    )}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{record.tradeId}</span>
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="text-[10px] text-muted-foreground space-y-1">
                      <div className="truncate">{record.sourceSystem} → {record.targetSystem}</div>
                      <div>{record.lastUpdated}</div>
                      <div className="flex gap-1 flex-wrap">
                        {record.fields.filter(f => f.status === 'different').length > 0 && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            {record.fields.filter(f => f.status === 'different').length} diff
                          </Badge>
                        )}
                        {record.fields.filter(f => f.status.includes('missing')).length > 0 && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {record.fields.filter(f => f.status.includes('missing')).length} miss
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Detailed Comparison */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedRecord ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{selectedRecord.tradeId}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedRecord.sourceSystem} → {selectedRecord.targetSystem} • {selectedRecord.lastUpdated}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRecord.status)}
                    <Badge 
                      variant={selectedRecord.status === 'matched' ? 'secondary' : selectedRecord.status === 'discrepancy' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {selectedRecord.status}
                    </Badge>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-2">
                    {displayedFields.map((field) => (
                      <div key={field.fieldName} className={cn(
                        "border rounded-lg overflow-hidden border-l-2",
                        field.status === 'matched' && "border-l-green-500 bg-green-50/20",
                        field.status === 'different' && "border-l-yellow-500 bg-yellow-50/20",
                        field.status.includes('missing') && "border-l-red-500 bg-red-50/20"
                      )}>
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs">{field.displayName}</span>
                              {field.critical && (
                                <Badge variant="destructive" className="text-[9px] px-1 py-0">Critical</Badge>
                              )}
                              {getFieldStatusIcon(field.status)}
                            </div>
                            {field.variance !== undefined && field.tolerance !== undefined && (
                              <div className="flex items-center gap-1">
                                {getVarianceIcon(field.variance, field.tolerance)}
                                <Badge 
                                  variant={Math.abs(field.variance) > field.tolerance ? "destructive" : "secondary"}
                                  className="text-[9px] px-1 py-0"
                                >
                                  {field.variance > 0 ? '+' : ''}{field.variance.toFixed(2)}%
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Source Value */}
                            <div className={cn(
                              "p-2 rounded border text-xs",
                              field.status === 'missing_source' ? "bg-red-100 border-red-200" : "bg-blue-50 border-blue-200"
                            )}>
                              <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                                {selectedRecord.sourceSystem}
                              </div>
                              <div>{formatValue(field.sourceValue)}</div>
                            </div>

                            {/* Target Value */}
                            <div className={cn(
                              "p-2 rounded border text-xs",
                              field.status === 'missing_target' ? "bg-red-100 border-red-200" : "bg-green-50 border-green-200"
                            )}>
                              <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                                {selectedRecord.targetSystem}
                              </div>
                              <div>{formatValue(field.targetValue)}</div>
                            </div>
                          </div>

                          {field.status === 'different' && field.tolerance !== undefined && (
                            <div className="mt-2 p-1 bg-yellow-100 border border-yellow-200 rounded text-[10px]">
                              <span className="text-yellow-800">
                                Tolerance: ±{field.tolerance}% | Variance: {field.variance > 0 ? '+' : ''}{field.variance?.toFixed(2)}%
                                {Math.abs(field.variance!) > field.tolerance && (
                                  <span className="ml-1 font-medium text-red-600">Exceeds!</span>
                                )}
                              </span>
                            </div>
                          )}

                          {field.status.includes('missing') && (
                            <div className="mt-2 p-1 bg-red-100 border border-red-200 rounded text-[10px]">
                              <span className="text-red-800">
                                Missing in {field.status === 'missing_source' ? selectedRecord.sourceSystem : selectedRecord.targetSystem}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Select a trade to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
