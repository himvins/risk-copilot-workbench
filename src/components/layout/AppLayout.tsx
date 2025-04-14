
import React, { useRef, useEffect, useState } from "react";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Collapsible } from "@/components/ui/collapsible";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  
  // Handle drag end event for the entire application
  const handleDragEnd = (result: DropResult) => {
    console.log("Drag ended:", result);
    
    // If there's no destination, the item was dropped outside droppable areas
    if (!result.destination) {
      console.log("No destination");
      return;
    }
    
    const { source, destination, draggableId } = result;
    
    // Handle drag from gallery to workspace
    if (source.droppableId === "widget-gallery" && destination.droppableId === "workspace") {
      console.log("Dragging from gallery to workspace");
      
      // Extract the widget type from the draggableId (format: "gallery-[widget-type]")
      const widgetType = draggableId.replace("gallery-", "") as any;
      
      if (workspaceRef.current && workspaceRef.current.addWidgetByType) {
        console.log("Adding widget:", widgetType);
        workspaceRef.current.addWidgetByType(widgetType);
      } else {
        console.error("Workspace reference or addWidgetByType not found");
      }
    }
  };

  // Store methods from context
  const storeWorkspaceContext = (context: any) => {
    if (context) {
      workspaceRef.current = {
        addWidgetByType: context.addWidgetByType,
        removeWidgetByType: context.removeWidgetByType,
        addColumnToWidget: context.addColumnToWidget
      };
      console.log("Workspace context stored:", workspaceRef.current);
    }
  };

  const isMobile = useIsMobile();

  // Handle toggling of panels
  const toggleGallery = () => setIsGalleryCollapsed(!isGalleryCollapsed);
  const toggleCopilot = () => setIsCopilotCollapsed(!isCopilotCollapsed);

  return (
    <WorkspaceProvider>
      {(context) => {
        // Store the context methods in ref for drag and drop
        storeWorkspaceContext(context);
        
        return (
          <div className="h-screen flex flex-col">
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
                  <ResizablePanel 
                    defaultSize={20} 
                    minSize={isGalleryCollapsed ? 3 : (isMobile ? 10 : 15)} 
                    maxSize={30}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="relative h-full flex">
                      {/* Gallery Toggle Button */}
                      <button 
                        onClick={toggleGallery}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-full p-1 shadow-md hover:bg-muted transition-colors"
                        aria-label={isGalleryCollapsed ? "Expand Gallery" : "Collapse Gallery"}
                      >
                        {isGalleryCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      </button>
                      
                      <div className={`w-full transition-all duration-300 ${isGalleryCollapsed ? "opacity-0" : "opacity-100"}`}>
                        <WidgetGallery />
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel defaultSize={50} className="transition-all duration-300">
                    <WidgetWorkspace />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel 
                    defaultSize={30} 
                    minSize={isCopilotCollapsed ? 3 : (isMobile ? 20 : 25)}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="relative h-full flex">
                      {/* Copilot Toggle Button */}
                      <button 
                        onClick={toggleCopilot}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-full p-1 shadow-md hover:bg-muted transition-colors"
                        aria-label={isCopilotCollapsed ? "Expand Copilot" : "Collapse Copilot"}
                      >
                        {isCopilotCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      <div className={`w-full transition-all duration-300 ${isCopilotCollapsed ? "opacity-0" : "opacity-100"}`}>
                        <RiskCopilot />
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </main>
            </DragDropContext>
          </div>
        );
      }}
    </WorkspaceProvider>
  );
}
