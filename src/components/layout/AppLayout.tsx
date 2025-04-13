
import React, { useRef, useEffect } from "react";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export function AppLayout() {
  const workspaceContextRef = useRef<HTMLDivElement>(null);
  
  // Handle drag end event for the entire application
  const handleDragEnd = (result: DropResult) => {
    // If there's no destination, the item was dropped outside droppable areas
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Handle drag from gallery to workspace
    if (source.droppableId === "widget-gallery" && destination.droppableId === "workspace") {
      // Extract the widget type from the draggableId (format: "gallery-[widget-type]")
      const widgetType = draggableId.replace("gallery-", "") as any;
      
      // Get the context and add the widget
      if (workspaceContextRef.current && (workspaceContextRef.current as any).__workspaceContext) {
        const { addWidgetByType } = (workspaceContextRef.current as any).__workspaceContext;
        addWidgetByType(widgetType);
      }
    }
  };

  const isMobile = useIsMobile();

  return (
    <WorkspaceProvider>
      <div className="h-screen flex flex-col" ref={workspaceContextRef}>
        <header className="bg-card p-3 border-b border-border flex items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold">Risk Copilot Workbench</h1>
          </div>
        </header>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <main className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="w-full">
              <ResizablePanel defaultSize={20} minSize={isMobile ? 10 : 15} maxSize={30}>
                <WidgetGallery />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={50}>
                <WidgetWorkspace />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={30} minSize={isMobile ? 20 : 25}>
                <RiskCopilot />
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </DragDropContext>
      </div>
    </WorkspaceProvider>
  );
}
