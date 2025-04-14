
import React, { useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { useIsMobile } from "@/hooks/use-mobile";
import { CollapsiblePanel } from "./CollapsiblePanel";

interface MainContentProps {
  workspaceRef: any;
}

export function MainContent({ workspaceRef }: MainContentProps) {
  const [isGalleryCollapsed, setIsGalleryCollapsed] = React.useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = React.useState(false);
  const isMobile = useIsMobile();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      console.log("No destination");
      return;
    }
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === "widget-gallery" && destination.droppableId === "workspace") {
      console.log("Dragging from gallery to workspace");
      
      const widgetType = draggableId.replace("gallery-", "") as any;
      
      if (workspaceRef.current && workspaceRef.current.addWidgetByType) {
        console.log("Adding widget:", widgetType);
        workspaceRef.current.addWidgetByType(widgetType);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <main className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <CollapsiblePanel
            side="left"
            isCollapsed={isGalleryCollapsed}
            onToggle={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
            defaultSize={20}
            minSize={isMobile ? 10 : 15}
            maxSize={30}
          >
            <WidgetGallery />
          </CollapsiblePanel>
          
          <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
          
          <ResizablePanel defaultSize={50} className="transition-all duration-300">
            <WidgetWorkspace />
          </ResizablePanel>
          
          <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
          
          <CollapsiblePanel
            side="right"
            isCollapsed={isCopilotCollapsed}
            onToggle={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
            defaultSize={30}
            minSize={isMobile ? 20 : 25}
          >
            <RiskCopilot />
          </CollapsiblePanel>
        </ResizablePanelGroup>
      </main>
    </DragDropContext>
  );
}
