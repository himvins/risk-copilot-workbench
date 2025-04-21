
import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, User, Bot, Loader2 } from "lucide-react";
import { Message as MessageType } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/useMessageBus";
import { MessageTopics } from "@/lib/messageTopics";

interface RiskCopilotProps {
  hidden?: boolean;
}

interface MessageProps {
  message: MessageType;
  onActionClick?: (actionId: string, action: () => void) => void;
}

function Message({ message, onActionClick }: MessageProps) {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";
  
  return (
    <div className={`copilot-message ${isUser ? "user-message" : "ai-message"} rounded-lg`}>
      <div className="flex gap-3">
        <Avatar className={`h-8 w-8 ${isUser ? "bg-primary" : "bg-secondary"}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </Avatar>
        
        <div className="flex-1">
          <div className="text-sm">
            {message.content}
          </div>
          
          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.actions.map(action => (
                <Button 
                  key={action.id} 
                  variant="outline" 
                  size="sm"
                  onClick={() => onActionClick && onActionClick(action.id, action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RiskCopilot({ hidden = false }: RiskCopilotProps) {
  const [inputValue, setInputValue] = useState("");
  const { isProcessing, sendMessage } = useWorkspace();
  // Use the persisted messages from message bus
  const messages = useSubscription<MessageType[]>(MessageTopics.CHAT.MESSAGES_CHANGED, []) || [];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendMessage(inputValue);
    setInputValue("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleActionClick = (actionId: string, action: () => void) => {
    // Execute the action
    action();
  };
  
  if (hidden) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          Risk Copilot
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm p-4">
              <p>Ask me questions about your risk dashboard</p>
              <p className="mt-2 text-xs">I can help you analyze data or customize your workspace</p>
            </div>
          ) : (
            messages.map(message => (
              <Message 
                key={message.id} 
                message={message}
                onActionClick={handleActionClick}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <Separator />
      
      <CardFooter className="p-4 bg-background">
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your risk data..."
            className="pr-10"
            disabled={isProcessing}
          />
          {isProcessing ? (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full opacity-70"
              disabled
            >
              <Loader2 size={18} className="animate-spin" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost" 
              className="absolute right-0 top-0 h-full opacity-70"
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ""}
            >
              <SendHorizontal size={18} />
            </Button>
          )}
        </div>
      </CardFooter>
    </div>
  );
}
