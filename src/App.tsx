
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeWorkspaceListeners } from "@/lib/workspaceService";
import { WidgetGallery } from "./components/workspace/WidgetGallery";
import { CounterpartyAnalysisWidget } from "./components/workspace/widgets/CounterpartyAnalysisWidget";

const queryClient = new QueryClient();

// Initialize all message bus listeners on app startup
function MessageBusInitializer() {
  useEffect(() => {
    const cleanup = initializeWorkspaceListeners();
    console.log("Message bus and persistence listeners initialized");
    
    return cleanup;
  }, []);
  
  return null;
}

const App = () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MessageBusInitializer />
          <BrowserRouter>
            <Routes>
              <Route path="/widget" element={<CounterpartyAnalysisWidget widget={undefined} onClose={function (id: string): void {
              throw new Error("Function not implemented.");
            } } />} />
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
);

export default App;
