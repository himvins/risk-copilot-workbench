
import React, { useRef, useEffect, FormEvent, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { 
  SendIcon, 
  MicIcon, 
  TrashIcon, 
  MousePointerClick, 
  Plus, 
  X, 
  Columns, 
  Highlight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { WidgetType } from "@/types";

interface RiskCopilotProps {
  hidden?: boolean;
}

// Widget suggestions for "Add widget" action
const widgetOptions: {id: WidgetType, label: string}[] = [
  { id: "risk-exposure", label: "Risk Exposure" },
  { id: "counterparty-analysis", label: "Counterparty Analysis" },
  { id: "market-volatility", label: "Market Volatility" },
  { id: "risk-alerts", label: "Risk Alerts" },
  { id: "credit-risk-metrics", label: "Credit Risk Metrics" },
  { id: "portfolio-heatmap", label: "Portfolio Heatmap" },
  { id: "transaction-volume", label: "Transaction Volume" },
  { id: "liquidity-coverage-ratio", label: "Liquidity Coverage" },
  { id: "regulatory-capital", label: "Regulatory Capital" },
  { id: "stress-test-scenarios", label: "Stress Testing" },
  { id: "operational-risk-events", label: "Operational Risk" }
];

const generalSuggestions = [
  "How to analyze counterparty risk?",
  "Show me market volatility trends",
  "What are the current risk alerts?",
  "Explain portfolio risk exposure",
  "Generate risk report summary"
];

const widgetSuggestions = [
  "Add a new widget",
  "Remove this widget",
  "Add column to this table",
  "Highlight important values"
];

type ActionMode = null | 'add-widget' | 'remove-widget' | 'add-column' | 'highlight-column';

export function RiskCopilot({ hidden = false }: RiskCopilotProps) {
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    selectedWidgetId, 
    placedWidgets, 
    selectWidget,
    addWidgetByType,
    removeWidget,
    addColumnToWidget
  } = useWorkspace();
  
  const [inputValue, setInputValue] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [searchValue, setSearchValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the selected widget
  const selectedWidget = selectedWidgetId 
    ? placedWidgets.find(widget => widget.id === selectedWidgetId) 
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
      setInputValue("");
      setActionMode(null);
    }
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    addWidgetByType(widgetType);
    sendMessage(`Added ${getWidgetLabel(widgetType)} widget to workspace`);
    setActionMode(null);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const widget = placedWidgets.find(w => w.id === widgetId);
    if (widget) {
      removeWidget(widgetId);
      sendMessage(`Removed ${widget.title} widget from workspace`);
      selectWidget(null);
      setActionMode(null);
    }
  };

  const handleAddColumn = (widgetId: string, columnId: string) => {
    if (columnId.trim()) {
      addColumnToWidget(widgetId, columnId);
      sendMessage(`Added column "${columnId}" to the widget`);
      setActionMode(null);
    }
  };

  const handleHighlightColumn = (column: string) => {
    // This is a placeholder for column highlighting functionality
    // In a real implementation, this would update the widget's state
    sendMessage(`Highlighted column "${column}" in the widget`);
    setActionMode(null);
  };

  const getWidgetLabel = (widgetType: WidgetType): string => {
    const option = widgetOptions.find(opt => opt.id === widgetType);
    return option ? option.label : widgetType;
  };

  const renderActionPanel = () => {
    switch (actionMode) {
      case 'add-widget':
        return (
          <Card className="p-3 mb-4">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">Select widget to add</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => setActionMode(null)}
              >
                <X size={14} />
              </Button>
            </div>
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Search widgets..." 
                value={searchValue}
                onValueChange={setSearchValue}
                className="h-9"
              />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>No widgets found</CommandEmpty>
                <CommandGroup>
                  {widgetOptions.map((widget) => (
                    <CommandItem 
                      key={widget.id}
                      onSelect={() => handleAddWidget(widget.id)}
                      className="text-sm cursor-pointer"
                    >
                      {widget.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </Card>
        );
      
      case 'add-column':
        if (!selectedWidgetId) return null;
        return (
          <Card className="p-3 mb-4">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">Add column to widget</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => setActionMode(null)}
              >
                <X size={14} />
              </Button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddColumn(selectedWidgetId, searchValue);
              }}
              className="flex gap-2"
            >
              <Input 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Column name"
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!searchValue.trim()}
              >
                Add
              </Button>
            </form>
          </Card>
        );

      case 'highlight-column':
        if (!selectedWidgetId) return null;
        return (
          <Card className="p-3 mb-4">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">Highlight column</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => setActionMode(null)}
              >
                <X size={14} />
              </Button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleHighlightColumn(searchValue);
              }}
              className="flex gap-2"
            >
              <Input 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Column name"
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!searchValue.trim()}
              >
                Highlight
              </Button>
            </form>
          </Card>
        );
        
      default:
        return null;
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-secondary/30">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Risk Copilot</h2>
        {selectedWidget ? (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">Selected Widget</Badge>
              <span className="text-sm font-medium">{selectedWidget.title}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => selectWidget(null)}
              className="h-7 text-xs"
            >
              Deselect
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a widget or ask questions about your risk data
          </p>
        )}
      </div>

      {/* Action Panel */}
      {renderActionPanel()}

      {/* Quick Actions */}
      {!actionMode && (
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                setActionMode('add-widget');
                setSearchValue('');
              }}
            >
              <Plus size={14} />
              <span>Add Widget</span>
            </Button>
            {selectedWidget && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveWidget(selectedWidget.id)}
                >
                  <X size={14} />
                  <span>Remove Widget</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setActionMode('add-column');
                    setSearchValue('');
                  }}
                >
                  <Columns size={14} />
                  <span>Add Column</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setActionMode('highlight-column');
                    setSearchValue('');
                  }}
                >
                  <Highlight size={14} />
                  <span>Highlight</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  "p-3 max-w-[85%]",
                  message.type === "user" 
                    ? "ml-auto bg-primary text-white" 
                    : message.type === "system" 
                      ? "mx-auto bg-secondary/50 text-center" 
                      : "mr-auto"
                )}
              >
                <div className="text-sm">{message.content}</div>
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant="secondary"
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground my-8">
              {selectedWidget ? (
                <div className="space-y-2">
                  <p>You've selected the <strong>{selectedWidget.title}</strong> widget</p>
                  <p className="text-sm">Try these actions:</p>
                  <div className="flex flex-col gap-2 mt-4">
                    {widgetSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-sm"
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Try these suggestions:</p>
                  <div className="flex flex-col gap-2 mt-4">
                    {generalSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-sm"
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {isProcessing && (
            <Card className="p-3 max-w-[85%] mr-auto animate-pulse">
              <div className="text-sm">Thinking...</div>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card mt-auto"
      >
        <div className="flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              selectedWidget 
                ? `Ask about the ${selectedWidget.title} widget...` 
                : "Ask a question..."
            }
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isProcessing}
          >
            <SendIcon size={18} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setInputValue("")}
            disabled={!inputValue.trim()}
          >
            <TrashIcon size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}

// Need to add cn utility import
import { cn } from "@/lib/utils";
