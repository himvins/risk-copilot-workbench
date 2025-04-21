
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { workspaceService } from "@/lib/workspaceService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PersistenceControls = () => {
  const { toast } = useToast();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the dashboard? This will remove all your widgets and tabs.')) {
      workspaceService.resetAllState();
      
      toast({
        title: "Dashboard reset",
        description: "All your widgets, tabs, and chat history have been reset"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Reset Dashboard</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset all dashboard settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
