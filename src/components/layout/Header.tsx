
import React from "react";
import { Bot } from "lucide-react";

export function Header() {
  return (
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
  );
}
