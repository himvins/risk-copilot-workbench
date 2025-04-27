import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Message as MessageType } from "@/types";
import { useSubscription } from "@/hooks/useMessageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { Avatar } from "@/components/ui/avatar";
import { FileUpload } from "./FileUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { messageBus } from '@/lib/messageBus';


interface RiskCopilotProps {
  hidden?: boolean;
}

export function RiskCopilot({ hidden = false }: RiskCopilotProps) {
  const { isProcessing, sendMessage, addWidgetByType } = useWorkspace();
  const [input, setInput] = useState("");
  
  // Use the persisted messages from message bus instead of direct context
  const messages = useSubscription<MessageType[]>(MessageTopics.CHAT.MESSAGES_CHANGED, []) || [];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  // Handle message suggestion click
  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setShowUpload(false);
    
    // Create a system message about the file upload
    const fileMessage: MessageType = {
      id: crypto.randomUUID(),
      type: "system",
      content: `File "${file.name}" has been uploaded. Would you like to visualize this data in a widget?`,
      timestamp: new Date(),
      actions: [
        {
          id: crypto.randomUUID(),
          label: "Add as widget",
          action: () => {
            // For now, we'll add a risk exposure widget when user confirms
            addWidgetByType("risk-exposure");
            sendMessage("File data has been added as a widget");
          }
        }
      ]
    };
    
    messageBus.publish(MessageTopics.CHAT.NEW_MESSAGE, fileMessage);
  };

  if (hidden) {
    return null;
  }

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
              <SuggestedPrompt onClick={handleSuggestion}>
                Add risk exposure widget
              </SuggestedPrompt>
              <SuggestedPrompt onClick={handleSuggestion}>
                Show me counterparty analysis
              </SuggestedPrompt>
              <SuggestedPrompt onClick={handleSuggestion}>
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
              <Avatar className={cn(
                "h-8 w-8 flex items-center justify-center",
                message.type === "user" ? "bg-accent" : "bg-secondary"
              )}>
                {message.type === "user" ? <User size={16} /> : <Bot size={16} />}
              </Avatar>
              
              <div className={cn(
                "max-w-[85%] rounded-lg p-3",
                message.type === "user" 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              )}>
                <p className="text-sm">{message.content}</p>
                
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
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
                
                <div className="text-[10px] opacity-70 mt-1">
                  {format(new Date(message.timestamp), "HH:mm")}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex gap-2 items-start">
            <Avatar className="h-8 w-8 bg-secondary flex items-center justify-center">
              <Bot size={16} />
            </Avatar>
            <div className="bg-muted rounded-lg p-3">
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
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
              >
                <Paperclip size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a file to analyze its data and create visualizations
                </DialogDescription>
              </DialogHeader>
              <FileUpload onFileUpload={handleFileUpload} />
            </DialogContent>
          </Dialog>
          
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
