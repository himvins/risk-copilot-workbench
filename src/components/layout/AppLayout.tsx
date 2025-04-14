
import React, { useRef } from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

export function AppLayout() {
  const { current: workspaceRef } = useRef<any>({});

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

  return (
    <WorkspaceProvider>
      {(context) => {
        storeWorkspaceContext(context);
        
        return (
          <div className="h-screen flex flex-col">
            <Header />
            <MainContent workspaceRef={workspaceRef} />
          </div>
        );
      }}
    </WorkspaceProvider>
  );
}
