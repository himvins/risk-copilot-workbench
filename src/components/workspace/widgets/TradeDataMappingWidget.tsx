
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetComponentProps } from "@/types";
import { ArrowRight, Search, Link, CheckCircle, AlertCircle, Eye, EyeOff, Plus, X } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TradeField {
  id: string;
  path: string;
  displayName: string;
  type: string;
  required: boolean;
  sampleValue?: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  confidence: number;
  status: 'mapped' | 'unmapped' | 'suggested';
}

const mockSourceFields: TradeField[] = [
  { id: 'src1', path: 'trade.tradeId', displayName: 'Trade ID', type: 'string', required: true, sampleValue: 'TRD-001' },
  { id: 'src2', path: 'trade.counterparty.name', displayName: 'Counterparty', type: 'string', required: true, sampleValue: 'Goldman Sachs' },
  { id: 'src3', path: 'trade.instrument.symbol', displayName: 'Symbol', type: 'string', required: true, sampleValue: 'AAPL' },
  { id: 'src4', path: 'trade.quantity', displayName: 'Quantity', type: 'number', required: true, sampleValue: '1000' },
  { id: 'src5', path: 'trade.price.amount', displayName: 'Price', type: 'number', required: true, sampleValue: '150.25' },
  { id: 'src6', path: 'trade.settlement.date', displayName: 'Settlement Date', type: 'date', required: false, sampleValue: '2024-01-15' },
  { id: 'src7', path: 'trade.metadata.broker', displayName: 'Broker', type: 'string', required: false, sampleValue: 'Morgan Stanley' },
  { id: 'src8', path: 'trade.fees.commission', displayName: 'Commission', type: 'number', required: false, sampleValue: '25.50' },
  { id: 'src9', path: 'trade.metadata.exchange', displayName: 'Exchange', type: 'string', required: false, sampleValue: 'NYSE' },
  { id: 'src10', path: 'trade.risk.var', displayName: 'VaR', type: 'number', required: false, sampleValue: '1250.75' },
];

const mockTargetFields: TradeField[] = [
  { id: 'tgt1', path: 'transaction.id', displayName: 'Transaction ID', type: 'string', required: true, sampleValue: 'TXN-001' },
  { id: 'tgt2', path: 'transaction.party', displayName: 'Party Name', type: 'string', required: true, sampleValue: 'Goldman Sachs' },
  { id: 'tgt3', path: 'transaction.security.ticker', displayName: 'Ticker', type: 'string', required: true, sampleValue: 'AAPL' },
  { id: 'tgt4', path: 'transaction.volume', displayName: 'Volume', type: 'number', required: true, sampleValue: '1000' },
  { id: 'tgt5', path: 'transaction.unitPrice', displayName: 'Unit Price', type: 'number', required: true, sampleValue: '150.25' },
  { id: 'tgt6', path: 'transaction.settleDate', displayName: 'Settle Date', type: 'date', required: false, sampleValue: '2024-01-15' },
  { id: 'tgt7', path: 'transaction.intermediary', displayName: 'Intermediary', type: 'string', required: false, sampleValue: 'Morgan Stanley' },
  { id: 'tgt8', path: 'transaction.costs.fees', displayName: 'Fees', type: 'number', required: false, sampleValue: '25.50' },
  { id: 'tgt9', path: 'transaction.venue', displayName: 'Venue', type: 'string', required: false, sampleValue: 'NYSE' },
  { id: 'tgt10', path: 'transaction.riskMetrics.value', displayName: 'Risk Value', type: 'number', required: false, sampleValue: '1250.75' },
];

const initialMappings: FieldMapping[] = [
  { sourceField: 'src1', targetField: 'tgt1', confidence: 85, status: 'suggested' },
  { sourceField: 'src2', targetField: 'tgt2', confidence: 95, status: 'mapped' },
  { sourceField: 'src3', targetField: 'tgt3', confidence: 90, status: 'mapped' },
  { sourceField: 'src4', targetField: 'tgt4', confidence: 88, status: 'suggested' },
  { sourceField: 'src5', targetField: 'tgt5', confidence: 92, status: 'mapped' },
];

export function TradeDataMappingWidget({ widget }: WidgetComponentProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(initialMappings);
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedSourceField, setSelectedSourceField] = useState<string | null>(null);
  const [selectedTargetField, setSelectedTargetField] = useState<string | null>(null);
  const [showOnlyMapped, setShowOnlyMapped] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  const filteredSourceFields = useMemo(() => {
    return mockSourceFields.filter(field => {
      const matchesSearch = field.displayName.toLowerCase().includes(searchSource.toLowerCase()) ||
                           field.path.toLowerCase().includes(searchSource.toLowerCase());
      const matchesFilter = !showOnlyMapped || mappings.some(m => m.sourceField === field.id);
      return matchesSearch && matchesFilter;
    });
  }, [searchSource, showOnlyMapped, mappings]);

  const filteredTargetFields = useMemo(() => {
    return mockTargetFields.filter(field => {
      const matchesSearch = field.displayName.toLowerCase().includes(searchTarget.toLowerCase()) ||
                           field.path.toLowerCase().includes(searchTarget.toLowerCase());
      const matchesFilter = !showOnlyMapped || mappings.some(m => m.targetField === field.id);
      return matchesSearch && matchesFilter;
    });
  }, [searchTarget, showOnlyMapped, mappings]);

  const getMappingForField = (fieldId: string, side: 'source' | 'target') => {
    return mappings.find(m => side === 'source' ? m.sourceField === fieldId : m.targetField === fieldId);
  };

  const createMapping = () => {
    if (selectedSourceField && selectedTargetField) {
      const newMapping: FieldMapping = {
        sourceField: selectedSourceField,
        targetField: selectedTargetField,
        confidence: 75,
        status: 'mapped'
      };

      setMappings(prev => [
        ...prev.filter(m => m.sourceField !== selectedSourceField && m.targetField !== selectedTargetField),
        newMapping
      ]);

      setSelectedSourceField(null);
      setSelectedTargetField(null);
    }
  };

  const removeMapping = (sourceField: string) => {
    setMappings(prev => prev.filter(m => m.sourceField !== sourceField));
  };

  const acceptSuggestion = (sourceField: string) => {
    setMappings(prev => prev.map(m => 
      m.sourceField === sourceField ? { ...m, status: 'mapped' as const } : m
    ));
  };

  const mappedCount = mappings.filter(m => m.status === 'mapped').length;
  const suggestedCount = mappings.filter(m => m.status === 'suggested').length;
  const unmappedCount = mockSourceFields.length - mappings.length;

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link className="w-4 h-4" />
            Trade Data Mapping
          </CardTitle>
          <Button
            variant={showOnlyMapped ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyMapped(!showOnlyMapped)}
            className="h-7 text-xs px-2"
          >
            {showOnlyMapped ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
            {showOnlyMapped ? "All" : "Mapped"}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">{mappedCount} Mapped</Badge>
          <Badge variant="outline" className="text-xs">{suggestedCount} Suggested</Badge>
          <Badge variant="destructive" className="text-xs">{unmappedCount} Unmapped</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden pt-0">
        {selectedSourceField && selectedTargetField && (
          <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Create mapping: {mockSourceFields.find(f => f.id === selectedSourceField)?.displayName} → {mockTargetFields.find(f => f.id === selectedTargetField)?.displayName}</span>
              <Button onClick={createMapping} size="sm" className="h-6 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Map
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Source Fields */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-sm">Bloomberg Terminal</h3>
              <Badge variant="outline" className="text-xs">{filteredSourceFields.length}</Badge>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {filteredSourceFields.map((field) => {
                  const mapping = getMappingForField(field.id, 'source');
                  const isSelected = selectedSourceField === field.id;
                  const isMapped = !!mapping;

                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "p-2 rounded border cursor-pointer transition-all text-xs hover:shadow-sm",
                        isSelected && "border-primary bg-primary/5",
                        isMapped && mapping?.status === 'mapped' && "border-green-200 bg-green-50/50",
                        isMapped && mapping?.status === 'suggested' && "border-yellow-200 bg-yellow-50/50",
                        !isMapped && !isSelected && "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
                      )}
                      onClick={() => setSelectedSourceField(isSelected ? null : field.id)}
                      draggable
                      onDragStart={() => setDraggedField(field.id)}
                      onDragEnd={() => setDraggedField(null)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <span className="font-medium truncate">{field.displayName}</span>
                          {field.required && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">Req</Badge>
                          )}
                          {isMapped && mapping?.status === 'mapped' && (
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          )}
                          {isMapped && mapping?.status === 'suggested' && (
                            <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground font-mono truncate mb-1">{field.path}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        <span className="font-medium">{field.sampleValue}</span>
                      </p>
                      
                      {isMapped && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {mapping?.confidence}%
                          </Badge>
                          {mapping?.status === 'suggested' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptSuggestion(field.id);
                              }}
                              className="h-4 text-[9px] px-1"
                            >
                              Accept
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMapping(field.id);
                            }}
                            className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-2 h-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Mapping Connection Indicator */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="bg-background border border-border rounded-full p-2 shadow-sm">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Target Fields */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-sm">Internal Database</h3>
              <Badge variant="outline" className="text-xs">{filteredTargetFields.length}</Badge>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {filteredTargetFields.map((field) => {
                  const mapping = getMappingForField(field.id, 'target');
                  const isSelected = selectedTargetField === field.id;
                  const isMapped = !!mapping;

                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "p-2 rounded border cursor-pointer transition-all text-xs hover:shadow-sm",
                        isSelected && "border-primary bg-primary/5",
                        isMapped && mapping?.status === 'mapped' && "border-green-200 bg-green-50/50",
                        isMapped && mapping?.status === 'suggested' && "border-yellow-200 bg-yellow-50/50",
                        !isMapped && !isSelected && "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
                      )}
                      onClick={() => setSelectedTargetField(isSelected ? null : field.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedField) {
                          const newMapping: FieldMapping = {
                            sourceField: draggedField,
                            targetField: field.id,
                            confidence: 75,
                            status: 'mapped'
                          };
                          setMappings(prev => [
                            ...prev.filter(m => m.sourceField !== draggedField && m.targetField !== field.id),
                            newMapping
                          ]);
                          setDraggedField(null);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <span className="font-medium truncate">{field.displayName}</span>
                          {field.required && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">Req</Badge>
                          )}
                          {isMapped && mapping?.status === 'mapped' && (
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          )}
                          {isMapped && mapping?.status === 'suggested' && (
                            <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground font-mono truncate mb-1">{field.path}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        <span className="font-medium">{field.sampleValue}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
