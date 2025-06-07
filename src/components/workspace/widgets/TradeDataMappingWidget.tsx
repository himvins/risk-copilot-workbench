
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetComponentProps } from "@/types";
import { ArrowRight, Search, Link, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
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
];

const mockTargetFields: TradeField[] = [
  { id: 'tgt1', path: 'transaction.id', displayName: 'Transaction ID', type: 'string', required: true, sampleValue: 'TXN-001' },
  { id: 'tgt2', path: 'transaction.party', displayName: 'Party Name', type: 'string', required: true, sampleValue: 'Goldman Sachs' },
  { id: 'tgt3', path: 'transaction.security.ticker', displayName: 'Ticker', type: 'string', required: true, sampleValue: 'AAPL' },
  { id: 'tgt4', path: 'transaction.volume', displayName: 'Volume', type: 'number', required: true, sampleValue: '1000' },
  { id: 'tgt5', path: 'transaction.unitPrice', displayName: 'Unit Price', type: 'number', required: true, sampleValue: '150.25' },
  { id: 'tgt6', path: 'transaction.settleDate', displayName: 'Settle Date', type: 'date', required: false, sampleValue: '2024-01-15' },
  { id: 'tgt7', path: 'transaction.intermediary', displayName: 'Intermediary', type: 'string', required: false, sampleValue: 'Morgan Stanley' },
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

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Trade Data Mapping
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{mappedCount} Mapped</Badge>
          <Badge variant="outline">{suggestedCount} Suggested</Badge>
          <Badge variant="destructive">{mockSourceFields.length - mappings.length} Unmapped</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant={showOnlyMapped ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyMapped(!showOnlyMapped)}
            className="flex items-center gap-1"
          >
            {showOnlyMapped ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showOnlyMapped ? "Show All" : "Show Mapped Only"}
          </Button>
          
          {selectedSourceField && selectedTargetField && (
            <Button onClick={createMapping} size="sm" className="ml-auto">
              Create Mapping
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Source Fields */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Source System (Bloomberg)</h3>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search source fields..."
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {filteredSourceFields.map((field) => {
                  const mapping = getMappingForField(field.id, 'source');
                  const isSelected = selectedSourceField === field.id;
                  const isMapped = !!mapping;

                  return (
                    <Card
                      key={field.id}
                      className={cn(
                        "cursor-pointer transition-all border-2 hover:shadow-md",
                        isSelected && "border-primary bg-primary/5",
                        isMapped && mapping?.status === 'mapped' && "border-green-500/50 bg-green-50/50",
                        isMapped && mapping?.status === 'suggested' && "border-yellow-500/50 bg-yellow-50/50",
                        !isMapped && "border-dashed border-muted-foreground/30"
                      )}
                      onClick={() => setSelectedSourceField(isSelected ? null : field.id)}
                      draggable
                      onDragStart={() => setDraggedField(field.id)}
                      onDragEnd={() => setDraggedField(null)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{field.displayName}</span>
                              {field.required && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              )}
                              {isMapped && mapping?.status === 'mapped' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {isMapped && mapping?.status === 'suggested' && (
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">{field.path}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sample: <span className="font-medium">{field.sampleValue}</span>
                            </p>
                            {isMapped && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {mapping?.confidence}% match
                                </Badge>
                                {mapping?.status === 'suggested' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      acceptSuggestion(field.id);
                                    }}
                                    className="h-6 text-xs"
                                  >
                                    Accept
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMapping(field.id);
                                  }}
                                  className="h-6 text-xs"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Target Fields */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Target System (Internal DB)</h3>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search target fields..."
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {filteredTargetFields.map((field) => {
                  const mapping = getMappingForField(field.id, 'target');
                  const isSelected = selectedTargetField === field.id;
                  const isMapped = !!mapping;

                  return (
                    <Card
                      key={field.id}
                      className={cn(
                        "cursor-pointer transition-all border-2 hover:shadow-md",
                        isSelected && "border-primary bg-primary/5",
                        isMapped && mapping?.status === 'mapped' && "border-green-500/50 bg-green-50/50",
                        isMapped && mapping?.status === 'suggested' && "border-yellow-500/50 bg-yellow-50/50",
                        !isMapped && "border-dashed border-muted-foreground/30"
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
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{field.displayName}</span>
                              {field.required && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              )}
                              {isMapped && mapping?.status === 'mapped' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {isMapped && mapping?.status === 'suggested' && (
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">{field.path}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sample: <span className="font-medium">{field.sampleValue}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
