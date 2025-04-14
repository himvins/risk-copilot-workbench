
import React, { useRef } from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Header } from "./Header";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});
  const [isGalleryCollapsed, setIsGalleryCollapsed] = React.useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = React.useState(false);
  const isMobile = useIsMobile();

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

  // Function to determine gallery panel size based on collapse state
  const getGalleryPanelSize = () => {
    if (isGalleryCollapsed) return 5;
    return isMobile ? 10 : 20;
  };

  // Function to determine copilot panel size based on collapse state
  const getCopilotPanelSize = () => {
    if (isCopilotCollapsed) return 5;
    return isMobile ? 20 : 30;
  };

  return (
    <WorkspaceProvider>
      {(context) => {
        storeWorkspaceContext(context);
        
        return (
          <div className="h-screen flex flex-col">
            <Header />
            <DragDropContext onDragEnd={handleDragEnd}>
              <main className="flex-1 flex overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="w-full">
                  {/* Left Panel (Widget Gallery) */}
                  <ResizablePanel 
                    defaultSize={getGalleryPanelSize()} 
                    minSize={5}
                    maxSize={30}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="relative h-full">
                      {/* Toggle Button */}
                      <button 
                        onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
                        className="absolute right-0 top-4 z-10 bg-card border border-border rounded-l-lg p-1.5 shadow-md hover:bg-muted transition-colors"
                        aria-label={isGalleryCollapsed ? "Expand gallery" : "Collapse gallery"}
                      >
                        {isGalleryCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      </button>
                      
                      {/* Gallery Content */}
                      <div className={`w-full overflow-x-hidden transition-all duration-300 ${isGalleryCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        <WidgetGallery />
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  {/* Center Panel (Widget Workspace) */}
                  <ResizablePanel defaultSize={50} className="transition-all duration-300">
                    <WidgetWorkspace />
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle className={isGalleryCollapsed || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  {/* Right Panel (Risk Copilot) */}
                  <ResizablePanel 
                    defaultSize={getCopilotPanelSize()} 
                    minSize={5}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="relative h-full">
                      {/* Toggle Button */}
                      <button 
                        onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
                        className="absolute left-0 top-4 z-10 bg-card border border-border rounded-r-lg p-1.5 shadow-md hover:bg-muted transition-colors"
                        aria-label={isCopilotCollapsed ? "Expand copilot" : "Collapse copilot"}
                      >
                        {isCopilotCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      {/* Copilot Content */}
                      <div className={`w-full overflow-x-hidden transition-all duration-300 ${isCopilotCollapsed ? 'opacity-0' : 'opacity-100'}`}>
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
