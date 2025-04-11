
import React from "react";
import { WidgetGallery } from "../workspace/WidgetGallery";
import { WidgetWorkspace } from "../workspace/WidgetWorkspace";
import { RiskCopilot } from "../workspace/RiskCopilot";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export function AppLayout() {
  return (
    <WorkspaceProvider>
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
        
        <main className="flex-1 flex overflow-hidden">
          <aside className="w-[300px] border-r border-border">
            <WidgetGallery />
          </aside>
          
          <div className="flex-1 overflow-hidden">
            <WidgetWorkspace />
          </div>
          
          <aside className="w-[350px] border-l border-border">
            <RiskCopilot />
          </aside>
        </main>
      </div>
    </WorkspaceProvider>
  );
}
