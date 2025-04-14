import React, { useRef, useState } from "react";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  
  const handleDragEnd = (result: DropResult) => {
    console.log("Drag ended:", result);
    
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
      } else {
        console.error("Workspace reference or addWidgetByType not found");
      }
    }
  };

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

  const toggleGallery = () => setIsGalleryCollapsed(!isGalleryCollapsed);
  const toggleCopilot = () => setIsCopilotCollapsed(!isCopilotCollapsed);

  return (
    <WorkspaceProvider>
      {(context) => {
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
                    className={`transition-all duration-300 ease-in-out ${isGalleryCollapsed ? 'w-12' : ''}`}
                  >
                    <div className="relative h-full">
                      <button 
                        onClick={toggleGallery}
                        className="absolute right-0 top-4 z-10 bg-card border border-border rounded-l-lg p-1.5 shadow-md hover:bg-muted transition-colors"
                        aria-label={isGalleryCollapsed ? "Expand Gallery" : "Collapse Gallery"}
                      >
                        {isGalleryCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      </button>
                      
                      <div className={`w-full transition-all duration-300 ${isGalleryCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <WidgetGallery />
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  <ResizablePanel defaultSize={50} className="transition-all duration-300">
                    <WidgetWorkspace />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  <ResizablePanel 
                    defaultSize={30} 
                    minSize={isCopilotCollapsed ? 3 : (isMobile ? 20 : 25)}
                    className={`transition-all duration-300 ease-in-out ${isCopilotCollapsed ? 'w-12' : ''}`}
                  >
                    <div className="relative h-full">
                      <button 
                        onClick={toggleCopilot}
                        className="absolute left-0 top-4 z-10 bg-card border border-border rounded-r-lg p-1.5 shadow-md hover:bg-muted transition-colors"
                        aria-label={isCopilotCollapsed ? "Expand Copilot" : "Collapse Copilot"}
                      >
                        {isCopilotCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      <div className={`w-full transition-all duration-300 ${isCopilotCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
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
