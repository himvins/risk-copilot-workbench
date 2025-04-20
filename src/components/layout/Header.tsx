
import React from "react";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Header() {
  return (
    <header className="bg-card p-3 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1 rounded">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Risk Copilot Workbench</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
