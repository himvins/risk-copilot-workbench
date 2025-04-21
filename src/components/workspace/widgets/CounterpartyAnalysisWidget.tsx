
import React, { useMemo, useState } from "react";
import { WidgetComponentProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle, ShieldCheck, Info, Sparkles } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AgGridReact } from 'ag-grid-react';
import { useThemeService } from "@/lib/themeService";

// Import ag-Grid CSS
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

// Define the data structure for our grid rows
interface CounterpartyData {
  id: string;
  name: string;
  exposure: string;
  rating: string;
  riskScore: string;
  riskColor: string;
  riskLevel: "Low" | "Medium" | "High";
  profitability?: { value: string; trend: "up" | "down" };
  sentiment?: { value: string; score: number };
  volatility?: { value: string; percent: string };
}

// Extended data for counterparties
const baseCounterpartyData: CounterpartyData[] = [
  { 
    id: "CP001", 
    name: "Goldman Sachs", 
    exposure: "$24.5M",
    rating: "AA",
    riskScore: "Low",
    riskColor: "text-widget-green",
    riskLevel: "Low",
  },
  { 
    id: "CP015", 
    name: "Deutsche Bank", 
    exposure: "$18.3M",
    rating: "BBB+",
    riskScore: "Medium",
    riskColor: "text-widget-amber", 
    riskLevel: "Medium",
  },
  { 
    id: "CP023", 
    name: "Credit Suisse", 
    exposure: "$15.7M",
    rating: "BBB",
    riskScore: "Medium",
    riskColor: "text-widget-amber", 
    riskLevel: "Medium",
  },
  { 
    id: "CP008", 
    name: "Barclays", 
    exposure: "$12.2M",
    rating: "A-",
    riskScore: "Low",
    riskColor: "text-widget-green", 
    riskLevel: "Low",
  },
  { 
    id: "CP045", 
    name: "Nomura Securities", 
    exposure: "$8.5M",
    rating: "BB+",
    riskScore: "High",
    riskColor: "text-widget-red", 
    riskLevel: "High",
  },
  { 
    id: "CP033", 
    name: "Morgan Stanley", 
    exposure: "$21.7M",
    rating: "A",
    riskScore: "Low",
    riskColor: "text-widget-green", 
    riskLevel: "Low",
  },
  { 
    id: "CP019", 
    name: "BNP Paribas", 
    exposure: "$16.8M",
    rating: "A+",
    riskScore: "Low",
    riskColor: "text-widget-green", 
    riskLevel: "Low",
  },
  { 
    id: "CP056", 
    name: "UBS", 
    exposure: "$14.2M",
    rating: "A",
    riskScore: "Low",
    riskColor: "text-widget-green", 
    riskLevel: "Low",
  }
];

// Extended data for AI columns
const extendedData: Record<string, Record<string, any>> = {
  profitability: {
    "CP001": { value: "+$2.3M", trend: "up" },
    "CP015": { value: "+$1.1M", trend: "up" },
    "CP023": { value: "-$0.8M", trend: "down" },
    "CP008": { value: "+$1.5M", trend: "up" },
    "CP045": { value: "-$0.4M", trend: "down" },
    "CP033": { value: "+$1.9M", trend: "up" },
    "CP019": { value: "+$0.7M", trend: "up" },
    "CP056": { value: "-$0.3M", trend: "down" },
  },
  sentiment: {
    "CP001": { value: "Positive", score: 82 },
    "CP015": { value: "Neutral", score: 56 },
    "CP023": { value: "Negative", score: 34 },
    "CP008": { value: "Positive", score: 78 },
    "CP045": { value: "Negative", score: 29 },
    "CP033": { value: "Positive", score: 75 },
    "CP019": { value: "Neutral", score: 60 },
    "CP056": { value: "Neutral", score: 48 },
  },
  volatility: {
    "CP001": { value: "Low", percent: "3.2%" },
    "CP015": { value: "Medium", percent: "5.7%" },
    "CP023": { value: "High", percent: "8.9%" },
    "CP008": { value: "Low", percent: "2.8%" },
    "CP045": { value: "High", percent: "9.2%" },
    "CP033": { value: "Low", percent: "3.5%" },
    "CP019": { value: "Medium", percent: "4.8%" },
    "CP056": { value: "Medium", percent: "6.2%" },
  }
};

// Prepare complete data by merging base and extended data
const prepareData = (baseData: CounterpartyData[], additionalColumns: string[]): CounterpartyData[] => {
  return baseData.map(cp => {
    const extendedFields: any = {};
    
    additionalColumns.forEach(colType => {
      if (extendedData[colType] && extendedData[colType][cp.id]) {
        extendedFields[colType] = extendedData[colType][cp.id];
      } else {
        extendedFields[colType] = { value: "N/A" };
      }
    });
    
    return { ...cp, ...extendedFields };
  });
};

// Custom cell renderers
const RiskCellRenderer = (props: any) => {
  const riskLevel = props.value;
  let Icon;
  let colorClass = "";
  
  switch(riskLevel) {
    case "Low":
      Icon = ShieldCheck;
      colorClass = "text-widget-green";
      break;
    case "Medium":
      Icon = Info;
      colorClass = "text-widget-amber";
      break;
    case "High":
      Icon = AlertTriangle;
      colorClass = "text-widget-red";
      break;
    default:
      Icon = Info;
      colorClass = "text-muted-foreground";
  }
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon size={16} />
      <span>{riskLevel}</span>
    </div>
  );
};

const ProfitabilityCellRenderer = (props: any) => {
  if (!props.value || !props.value.value) return <span>N/A</span>;
  
  const { value, trend } = props.value;
  const colorClass = trend === "up" ? "text-widget-green" : "text-widget-red";
  
  return <span className={colorClass}>{value}</span>;
};

const SentimentCellRenderer = (props: any) => {
  if (!props.value || !props.value.value) return <span>N/A</span>;
  
  const { value, score } = props.value;
  let colorClass = "text-widget-amber";
  
  if (score >= 70) colorClass = "text-widget-green";
  if (score <= 40) colorClass = "text-widget-red";
  
  return <span className={colorClass}>{value}</span>;
};

const VolatilityCellRenderer = (props: any) => {
  if (!props.value || !props.value.value) return <span>N/A</span>;
  
  const { value, percent } = props.value;
  let colorClass = "text-widget-amber";
  
  if (value === "Low") colorClass = "text-widget-green";
  if (value === "High") colorClass = "text-widget-red";
  
  return <span className={colorClass}>{value} ({percent})</span>;
};

export function CounterpartyAnalysisWidget({ widget, onClose }: WidgetComponentProps) {
  const { getWidgetCustomization } = useWorkspace();
  const { currentTheme } = useThemeService();
  const [gridApi, setGridApi] = useState<any>(null);
  
  // Get widget-specific customizations (columns)
  const customization = getWidgetCustomization ? getWidgetCustomization(widget.id) : undefined;
  const additionalColumns = customization?.additionalColumns || [];
  
  // Create grid data
  const rowData = useMemo(() => {
    return prepareData(baseCounterpartyData, additionalColumns.map(col => col.type));
  }, [additionalColumns]);
  
  // Define column definitions for AG Grid
  const columnDefs = useMemo(() => {
    const baseCols = [
      { headerName: 'ID', field: 'id', width: 80, sortable: true, filter: true },
      { headerName: 'Name', field: 'name', width: 150, sortable: true, filter: true },
      { headerName: 'Exposure', field: 'exposure', width: 120, sortable: true },
      { headerName: 'Rating', field: 'rating', width: 100, sortable: true },
      { 
        headerName: 'Risk', 
        field: 'riskLevel', 
        width: 120, 
        sortable: true,
        cellRenderer: RiskCellRenderer
      }
    ];
    
    // Add dynamic columns from widget customization
    const additionalCols = additionalColumns.map(column => {
      const colDef: any = {
        headerName: column.name,
        field: column.type,
        width: 140,
        sortable: true,
        headerClass: 'ai-column-header'
      };
      
      // Set different cell renderers based on column type
      switch (column.type) {
        case 'profitability':
          colDef.cellRenderer = ProfitabilityCellRenderer;
          break;
        case 'sentiment':
          colDef.cellRenderer = SentimentCellRenderer;
          break;
        case 'volatility':
          colDef.cellRenderer = VolatilityCellRenderer;
          break;
      }
      
      return colDef;
    });
    
    return [...baseCols, ...additionalCols];
  }, [additionalColumns]);
  
  // Default column settings
  const defaultColDef = {
    resizable: true,
    suppressSizeToFit: false,
  };
  
  // Determine the theme class based on current theme
  const gridTheme = currentTheme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  
  // On grid ready
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  return (
    <Card className="widget min-h-[300px] overflow-hidden">
      <CardHeader className="widget-header">
        <CardTitle className="text-sm font-medium flex items-center">
          {widget.title}
          {additionalColumns.length > 0 && (
            <span className="ml-2 text-xs flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
              <Sparkles size={12} />
              {additionalColumns.length} AI column{additionalColumns.length > 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
        <button 
          onClick={() => onClose(widget.id)} 
          className="p-1 hover:bg-secondary rounded-full"
        >
          <X size={16} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[260px]">
        <div 
          className={`${gridTheme} w-full h-full`}
          style={{ height: '260px' }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            rowHeight={35}
            headerHeight={40}
            animateRows={true}
            suppressColumnVirtualisation={false}
            suppressRowVirtualisation={false}
            suppressCellFocus={true}
          />
        </div>
        
        <div className="p-3 flex justify-between text-xs text-muted-foreground mt-auto border-t border-border">
          <span>Total Counterparties: 42</span>
          <span>Total Exposure: $132.7M</span>
        </div>
      </CardContent>
    </Card>
  );
}
