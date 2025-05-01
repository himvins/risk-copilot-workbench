
import React from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  AlertTriangle, 
  Shield, 
  BookOpen,
  Trash2,
  BellOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, markNotificationAsRead, clearAllNotifications, triggerTestNotification } = useWorkspace();

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    
    // This will simulate adding the corresponding widget
    if (notification.type === "data-quality-alert") {
      triggerTestNotification("data-quality");
    } else if (notification.type === "remediation-action") {
      triggerTestNotification("remediation");
    } else if (notification.type === "learning-update") {
      triggerTestNotification("learning");
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "data-quality-alert":
        return <AlertTriangle size={16} className="text-destructive" />;
      case "remediation-action":
        return <Shield size={16} className="text-primary" />;
      case "learning-update":
        return <BookOpen size={16} className="text-teal-500" />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] min-w-[320px]">
      <div className="p-3 flex items-center justify-between border-b">
        <h3 className="font-medium">Notifications</h3>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll}
            className="h-8 px-2 text-xs"
          >
            <Trash2 size={14} className="mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
            <BellOff size={24} className="mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  "flex flex-col text-left px-4 py-3 hover:bg-muted/50 transition-colors w-full",
                  !notification.read && "bg-muted/30"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(notification.type)}
                  <span className="font-medium text-sm flex-1">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-6 line-clamp-2">{notification.body}</p>
              </button>
            ))}
          </div>
        )}
        
        {/* Testing controls - for demonstration */}
        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Demo Controls:</p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => triggerTestNotification("data-quality")}
            >
              Test DQ Alert
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => triggerTestNotification("remediation")}
            >
              Test Remediation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => triggerTestNotification("learning")}
            >
              Test Learning
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
