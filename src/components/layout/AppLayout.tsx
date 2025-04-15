
import React, { useRef, useState, useEffect } from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Header } from "./Header";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

// Panel visibility modes based on width
type PanelVisibility = "full" | "icon-only" | "collapsed";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});
  const [gallerySize, setGallerySize] = useState(20);
  const [copilotSize, setCopilotSize] = useState(30);
  const centerSize = 100 - gallerySize - copilotSize;

  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Determine visibility based on panel sizes
  const getGalleryVisibility = (size: number): PanelVisibility => {
    if (size < 6) return "collapsed";
    if (size < 12) return "icon-only";
    return "full";
  };

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
  };

  // Handle panel size changes with visibility transitions
  const handlePanelResize = (sizes: number[]) => {
    const newGallerySize = sizes[0];
    const newCopilotSize = sizes[2];
    
    setGallerySize(newGallerySize);
    setCopilotSize(newCopilotSize);

    // Show toast when visibility changes
    const prevGalleryVisibility = getGalleryVisibility(gallerySize);
    const newGalleryVisibility = getGalleryVisibility(newGallerySize);
    
    if (prevGalleryVisibility !== newGalleryVisibility) {
      toast({
        title: "Panel visibility changed",
        description: newGalleryVisibility === "full" 
          ? "Panel expanded" 
          : newGalleryVisibility === "icon-only" 
            ? "Showing icons only" 
            : "Panel collapsed"
      });
    }
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
                <ResizablePanelGroup 
                  direction="horizontal" 
                  className="w-full"
                  onLayout={handlePanelResize}
                >
                  {/* Left Panel (Widget Gallery) */}
                  <ResizablePanel 
                    defaultSize={gallerySize} 
                    minSize={2}
                    maxSize={30}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <div className="h-full">
                      <WidgetGallery 
                        iconOnly={getGalleryVisibility(gallerySize) === "icon-only"}
                        hidden={getGalleryVisibility(gallerySize) === "collapsed"}
                      />
                    </div>
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle />
                  
                  {/* Center Panel (Widget Workspace) */}
                  <ResizablePanel 
                    defaultSize={centerSize}
                    className="transition-all duration-300"
                  >
                    <WidgetWorkspace />
                  </ResizablePanel>
                  
                  {/* Resize Handle */}
                  <ResizableHandle withHandle />
                  
                  {/* Right Panel (Risk Copilot) */}
                  <ResizablePanel 
                    defaultSize={copilotSize} 
                    minSize={2}
                    maxSize={40}
                    className="transition-all duration-300"
                  >
                    <div className="h-full">
                      <RiskCopilot hidden={copilotSize < 6} />
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
