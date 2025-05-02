
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetComponentProps } from "@/types";
import { useState } from "react";
import { BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function LearningAgentWidget({ widget, onClose }: WidgetComponentProps) {
  const [activeTab, setActiveTab] = useState("validation-rules");

  // Sample validation rules
  const validationRules = [
    { id: "IR014", type: "Interest Rate", dataElement: "FwdRate", description: "Flag negative values for FwdRate", threshold: "0", scope: "All non-basis curves", severity: "Critical" },
    { id: "IR015", type: "Interest Rate", dataElement: "FwdRate", description: "Check for spikes across different Tenors", threshold: "Std Dev > 3", scope: "All curves", severity: "Medium" },
    { id: "IR016", type: "Interest Rate", dataElement: "FwdRate", description: "Check if longer tenor rates lower than shorter", threshold: "N/A", scope: "Normal yield curves", severity: "Medium" },
    { id: "IR017", type: "Interest Rate", dataElement: "Records", description: "Check for duplicate entries", threshold: "N/A", scope: "All curves", severity: "High" },
    { id: "IR018", type: "Interest Rate", dataElement: "Tenors", description: "Ensure standard tenors have FwdRate", threshold: "N/A", scope: "Standard tenors", severity: "High" },
    { id: "CSA027", type: "CSA Terms", dataElement: "ContractualCsa", description: "Flag if ContractualCsa is true, but legal opinions false", threshold: "N/A", scope: "All CSAs", severity: "High" },
    { id: "CSA028", type: "CSA Terms", dataElement: "ThresholdAmount", description: "Check if CptyThreshold > WfcThreshold", threshold: "N/A", scope: "All CSAs", severity: "Medium" },
    { id: "TRD026", type: "Trade", dataElement: "ContractualNetting", description: "Flag trades where netting enforceability is false", threshold: "N/A", scope: "All trades", severity: "High" },
    { id: "TRD027", type: "Trade", dataElement: "Ratings", description: "Check for missing Rating1 or Rating2 values", threshold: "N/A", scope: "All trades", severity: "Medium" },
    { id: "TRD028", type: "Trade", dataElement: "CVA/DVA", description: "Check if CVA and DVA have opposite signs", threshold: "N/A", scope: "All trades", severity: "Medium" },
  ];

  // Group quality rules by category
  const qualityRules = {
    interestRates: [
      { id: "IR014", description: "Flag negative values for FwdRate, as interest rates should be non-negative unless they are basis curves like BRL_BasisFX_SOFR.", severity: "Critical" },
      { id: "IR015", description: "Check for spikes in FwdRate for a given Ccy and Name across different Tenors.", severity: "Medium" },
      { id: "IR016", description: "Check if the FwdRate for longer tenors is lower than shorter tenors, which is not expected in a normal yield curve.", severity: "Medium" },
      { id: "IR017", description: "Check for duplicate entries with the same asOfDate, Ccy, Name and Tenor.", severity: "High" },
      { id: "IR018", description: "Ensure that for standard tenors (e.g., 1M, 3M, 6M, 1Y, etc.) the FwdRate exists.", severity: "High" }
    ],
    csaTerms: [
      { id: "CSA027", description: "Flag if ContractualCsa is true, but CsaLegalOpinion and CsaEnforceability are false.", severity: "High" },
      { id: "CSA028", description: "Check if CptyThresholdAmount is greater than WfcThresholdAmount.", severity: "Medium" },
      { id: "CSA029", description: "Check if CptyMinimumTransferAmount or WfcMinimumTransferAmount is zero when MarginFrequency is Daily, Weekly, or Monthly.", severity: "Medium" },
      { id: "CSA030", description: "Check for inconsistencies in CptyIndependentAmount and WfcIndependentAmount. They should be of the same sign.", severity: "Medium" },
      { id: "CSA031", description: "If CsaType is IM, then CptyIndependentAmount and WfcIndependentAmount should not be zero.", severity: "High" },
      { id: "CSA032", description: "If MarginFrequency is \"Never\", then all threshold and transfer amounts should be very high.", severity: "High" }
    ],
    trades: [
      { id: "TRD026", description: "Flag trades where ContractualNetting is true, but NettingEnforceability and CloseoutNetLegOpin are false.", severity: "High" },
      { id: "TRD027", description: "Check for missing Rating1 or Rating2 values.", severity: "Medium" },
      { id: "TRD028", description: "Check if CVA and DVA have opposite signs.", severity: "Medium" },
      { id: "TRD029", description: "Check if AgreementID is 'NA' when ContractualNetting is true.", severity: "High" },
      { id: "TRD030", description: "Check if portfolioValue is zero while CVA and DVA are non-zero.", severity: "Medium" },
      { id: "TRD031", description: "Check if CVA, DVA, fca, fba, fva are zero when portfolioValue is zero.", severity: "Medium" }
    ]
  };

  // Contextual rules
  const contextualRules = {
    interestRates: [
      { id: "IR019", description: "Alert if there are missing interest rate data for specific Ccy and Name on a given asOfDate.", severity: "High" },
      { id: "IR020", description: "Flag significant day-over-day changes in FwdRate exceeding a defined threshold (e.g., 10% change).", severity: "Medium" },
      { id: "IR021", description: "Check for data outliers in FwdRate compared to the typical range for a given Ccy, Name, and Tenor.", severity: "Medium" },
      { id: "IR022", description: "Check if the interest rate data is updated within an acceptable timeframe.", severity: "High" }
    ],
    csaTerms: [
      { id: "CSA033", description: "Alert if there are missing CSA Terms for a specific Counterparty.", severity: "High" },
      { id: "CSA034", description: "Check for changes in CSA Terms over time for the same CSA ID.", severity: "Medium" },
      { id: "CSA035", description: "Ensure that the MarginFrequency is adhered to. For example, if it is daily, then margin calls are made daily.", severity: "High" }
    ],
    trades: [
      { id: "TRD032", description: "Alert if there are missing trades for specific Counterparty on a given date.", severity: "High" },
      { id: "TRD033", description: "Flag significant day-over-day changes in CVA or DVA exceeding a defined threshold (e.g., 20% change).", severity: "Medium" },
      { id: "TRD034", description: "Check for data outliers in CVA, DVA, and portfolioValue compared to the typical range for a given Counterparty.", severity: "Medium" },
      { id: "TRD035", description: "Check if the trade data is updated within an acceptable timeframe.", severity: "High" },
      { id: "TRD036", description: "If Rating1 or Rating2 changes drastically overnight (e.g., from investment grade to junk), flag as anomaly.", severity: "High" },
      { id: "TRD037", description: "If AgreementID is populated, ensure that the corresponding CSA terms exist in the CSA Terms sheet.", severity: "High" },
      { id: "TRD038", description: "If ContractualNetting is true, ensure that there are other trades with the same NettingGroupId.", severity: "Medium" },
      { id: "TRD039", description: "Check for consistency of counterparty ratings with external sources.", severity: "Medium" },
      { id: "TRD040", description: "Check for large changes in portfolioValue that are not reflected in CVA and DVA.", severity: "Medium" },
      { id: "TRD041", description: "Check for trades with same AgreementID but different terms.", severity: "High" }
    ]
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'high':
        return <Badge className="bg-amber-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-400">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge className="bg-blue-500">{severity}</Badge>;
    }
  };

  const renderQualityRules = (category: string, rules: any[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">{category}:</h3>
      <div className="space-y-2">
        {rules.map(rule => (
          <div key={rule.id} className="bg-muted/40 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs">{rule.id}</span>
              {getSeverityBadge(rule.severity)}
            </div>
            <p className="text-xs mt-1">{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {widget.title}
        </CardTitle>
        <CardDescription>
          Insights into AI learning and data validation rules
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full px-4 pt-4"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="validation-rules">Validation Rules</TabsTrigger>
            <TabsTrigger value="quality-rules">Quality Rules</TabsTrigger>
            <TabsTrigger value="contextual-rules">Contextual Rules</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="validation-rules" className="m-0">
              <div className="bg-muted/40 p-3 rounded-md mb-4">
                <h3 className="text-sm font-medium">Validation Rules</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  These rules are applied to validate data quality and integrity
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)] max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rule ID</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[100px]">Data Element</TableHead>
                      <TableHead>Rule Description</TableHead>
                      <TableHead className="w-[100px]">Threshold</TableHead>
                      <TableHead className="w-[120px]">Scope</TableHead>
                      <TableHead className="w-[80px]">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationRules.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.id}</TableCell>
                        <TableCell>{rule.type}</TableCell>
                        <TableCell>{rule.dataElement}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>{rule.threshold}</TableCell>
                        <TableCell>{rule.scope}</TableCell>
                        <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Rules last updated: 2 hours ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>10 new rules added this week</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quality-rules" className="m-0">
              <div className="bg-muted/40 p-3 rounded-md mb-4">
                <h3 className="text-sm font-medium">Quality Rules</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  These rules define expectations for data quality across domains
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)] max-h-[400px] pr-3">
                {renderQualityRules("Interest Rates", qualityRules.interestRates)}
                {renderQualityRules("CSA Terms", qualityRules.csaTerms)}
                {renderQualityRules("Trades", qualityRules.trades)}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="contextual-rules" className="m-0">
              <div className="bg-muted/40 p-3 rounded-md mb-4">
                <h3 className="text-sm font-medium">Contextual Rules</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  These rules consider broader context and relationships between data points
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)] max-h-[400px] pr-3">
                {renderQualityRules("Interest Rates", contextualRules.interestRates)}
                {renderQualityRules("CSA Terms", contextualRules.csaTerms)}
                {renderQualityRules("Trades", contextualRules.trades)}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
