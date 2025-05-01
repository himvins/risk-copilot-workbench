
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PersistenceControls } from "./PersistenceControls";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { NotificationList } from "./NotificationList";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const { notifications, notificationPermission, requestNotificationPermission } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  const handleNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    
    if (permission === "granted") {
      toast({
        title: "Notifications enabled",
        description: "You will now receive notifications from the Risk Dashboard"
      });
    } else if (permission === "denied") {
      toast({
        title: "Notifications disabled",
        description: "You will not receive notifications. You can enable them in your browser settings."
      });
    }
  };

  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">
          Risk Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {notificationPermission !== "granted" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNotificationPermission}
          >
            <Bell size={16} className="mr-2" />
            Enable notifications
          </Button>
        )}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center" 
                  variant="destructive"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <NotificationList onClose={() => setIsOpen(false)} />
          </PopoverContent>
        </Popover>
        
        <PersistenceControls />
        <ThemeToggle />
      </div>
    </header>
  );
}
