
import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function RiskCopilot() {
  const { messages, isProcessing, sendMessage, addWidgetByType } = useWorkspace();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-secondary/30 rounded-lg overflow-hidden">
      <div className="p-3 bg-secondary/50 border-b border-border">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          Risk Copilot
        </h2>
        <p className="text-xs text-muted-foreground">
          Ask me to add widgets or analyze your data
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Bot size={40} className="mb-2" />
            <p className="text-sm">How can I help you today?</p>
            <div className="mt-6 space-y-2">
              <SuggestedPrompt onClick={(text) => sendMessage(text)}>
                Add risk exposure widget
              </SuggestedPrompt>
              <SuggestedPrompt onClick={(text) => sendMessage(text)}>
                Show me counterparty analysis
              </SuggestedPrompt>
              <SuggestedPrompt onClick={(text) => sendMessage(text)}>
                What's my current risk exposure across asset classes?
              </SuggestedPrompt>
            </div>

            <div className="mt-6">
              <p className="text-xs text-center mb-2">Quick add widgets:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <QuickAddButton onClick={() => addWidgetByType('risk-exposure')}>
                  Risk Exposure
                </QuickAddButton>
                <QuickAddButton onClick={() => addWidgetByType('market-volatility')}>
                  Market Volatility
                </QuickAddButton>
                <QuickAddButton onClick={() => addWidgetByType('risk-alerts')}>
                  Risk Alerts
                </QuickAddButton>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 items-start",
                message.type === "user" ? "flex-row-reverse" : ""
              )}
            >
              {message.type === "user" ? (
                <div className="bg-accent rounded-full p-1">
                  <User size={14} />
                </div>
              ) : (
                <div className="bg-secondary rounded-full p-1">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={cn(
                  "copilot-message max-w-[85%]",
                  message.type === "user" ? "user-message" : "ai-message"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant="outline"
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(message.timestamp), "HH:mm")}
                </div>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex gap-2 items-start">
            <div className="bg-secondary rounded-full p-1">
              <Bot size={14} />
            </div>
            <div className="copilot-message ai-message">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <p className="text-sm">Processing your request...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try 'Add counterparty analysis'"
            disabled={isProcessing}
            className="bg-card"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}

function SuggestedPrompt({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(children?.toString() || "")}
      className="text-xs p-2 bg-card rounded-md hover:bg-primary/20 text-left w-full"
    >
      {children}
    </button>
  );
}

function QuickAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline"
      className="bg-card/70 text-xs"
    >
      {children}
    </Button>
  );
}
