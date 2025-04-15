
import React, { useRef, useEffect, FormEvent, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { SendIcon, MicIcon, TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RiskCopilot() {
  const { messages, isProcessing, sendMessage } = useWorkspace();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary/30">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Risk Copilot</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your risk data or request widgets
        </p>
      </div>

      {/* Messages Container with Scroll Area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`p-3 max-w-[85%] ${
                  message.type === "user" ? "ml-auto bg-primary text-white" : "mr-auto"
                }`}
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
              <p>No messages yet</p>
              <p className="text-sm mt-1">
                Ask me about risk insights or request dashboard widgets
              </p>
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

      {/* Input Area - Always at the bottom */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card mt-auto"
      >
        <div className="flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
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
