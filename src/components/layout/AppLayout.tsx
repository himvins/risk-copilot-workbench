
import React, { useRef, useState, useEffect } from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Header } from "./Header";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, PanelLeft, PanelRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Panel visibility modes
type PanelVisibility = "full" | "icon-only" | "collapsed";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});
  const [galleryVisibility, setGalleryVisibility] = useState<PanelVisibility>("full");
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  const [defaultSizes, setDefaultSizes] = useState<number[]>([20, 50, 30]); // Initial panel sizes
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const storeWorkspaceContext = (context: any) => {
    if (context) {
      workspaceRef.current = {
        addWidgetByType: context.addWidgetByType,
        removeWidgetByType: context.removeWidgetByType,
        addColumnToWidget: context.addColumnToWidget,
        reorderWidgets: context.reorderWidgets
      };
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    
    const { source, destination, draggableId } = result;
    
    // Handle widgets being dragged from gallery to workspace
    if (source.droppableId === "widget-gallery" && destination.droppableId === "workspace") {
      const widgetType = draggableId.replace("gallery-", "") as any;
      
      if (workspaceRef.current && workspaceRef.current.addWidgetByType) {
        workspaceRef.current.addWidgetByType(widgetType);
        
        toast({
          title: "Widget added",
          description: "A new widget has been added to your workspace"
        });
      }
    }
    
    // Note: Handling widget reordering is now done in the WidgetWorkspace component
  };

  // Recalculate panel sizes when visibility states change
  useEffect(() => {
    // Calculate new panel sizes based on visibility
    let gallerySize = 20;
    if (galleryVisibility === "icon-only") gallerySize = 10;
    if (galleryVisibility === "collapsed") gallerySize = 5;
    
    let copilotSize = 30;
    if (isCopilotCollapsed) copilotSize = 5;
    
    const centerSize = 100 - gallerySize - copilotSize;
    
    setDefaultSizes([gallerySize, centerSize, copilotSize]);
  }, [galleryVisibility, isCopilotCollapsed]);

  // Cycle through gallery panel visibility states
  const cycleGalleryVisibility = () => {
    setGalleryVisibility(current => {
      switch (current) {
        case "full": return "icon-only";
        case "icon-only": return "collapsed";
        case "collapsed": return "full";
        default: return "full";
      }
    });
    
    toast({
      title: "Panel visibility changed",
      description: galleryVisibility === "full" 
        ? "Showing icons only" 
        : galleryVisibility === "icon-only" 
          ? "Panel collapsed" 
          : "Panel expanded"
    });
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
                    defaultSize={defaultSizes[0]} 
                    minSize={5}
                    maxSize={30}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="relative h-full">
                      {/* Toggle Button */}
                      <button 
                        onClick={cycleGalleryVisibility}
                        className="absolute right-0 top-4 z-10 bg-card border border-border rounded-l-lg p-1.5 shadow-md hover:bg-muted transition-colors"
                        aria-label="Cycle gallery visibility"
                      >
                        {galleryVisibility === "collapsed" ? (
                          <PanelRight size={16} />
                        ) : galleryVisibility === "icon-only" ? (
                          <ChevronRight size={16} />
                        ) : (
                          <ChevronLeft size={16} />
                        )}
                      </button>
                      
                      {/* Gallery Content */}
                      <div className={`w-full overflow-x-hidden transition-all duration-300 ${
                        galleryVisibility === "collapsed" ? 'opacity-0' : 'opacity-100'
                      }`}>
                        <WidgetGallery 
                          iconOnly={galleryVisibility === "icon-only"} 
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle className={galleryVisibility === "collapsed" || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  {/* Center Panel (Widget Workspace) */}
                  <ResizablePanel 
                    defaultSize={defaultSizes[1]} 
                    className="transition-all duration-300"
                  >
                    <WidgetWorkspace />
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle className={galleryVisibility === "collapsed" || isCopilotCollapsed ? 'invisible' : ''} />
                  
                  {/* Right Panel (Risk Copilot) */}
                  <ResizablePanel 
                    defaultSize={defaultSizes[2]} 
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
                        {isCopilotCollapsed ? <PanelLeft size={16} /> : <ChevronRight size={16} />}
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
