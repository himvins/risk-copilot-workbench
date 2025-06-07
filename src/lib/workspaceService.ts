
import { v4 as uuidv4 } from "uuid";
import { messageBus } from "./messageBus";
import { MessageTopics } from "./messageTopics";
import { Widget, WidgetType, Message, MessageAction, WidgetCustomization, WorkspaceTab } from "@/types";
import { persistenceService, initializePersistenceListeners } from "./persistenceService";

// Workspace state - initialize from localStorage if available
let placedWidgets: Widget[] = persistenceService.loadWidgets();
let messages: Message[] = persistenceService.loadMessages();
let isProcessing: boolean = false;
const widgetCustomizations: Record<string, WidgetCustomization> = {};
let selectedWidgetId: string | null = null;

// Initialize tabs from localStorage
let workspaceTabs: WorkspaceTab[] = persistenceService.loadTabs();
let activeTabId = persistenceService.loadActiveTabId();

// Ensure we have at least one tab
if (workspaceTabs.length === 0) {
  const defaultTabId = uuidv4();
  workspaceTabs = [
    { id: defaultTabId, name: "Overview", isActive: true }
  ];
  activeTabId = defaultTabId;
}

// Helper functions
const getWidgetTitle = (widgetType: WidgetType): string => {
  switch (widgetType) {
    case "risk-exposure":
      return "Risk Exposure";
    case "counterparty-analysis":
      return "Counterparty Analysis";
    case "market-volatility":
      return "Market Volatility";
    case "portfolio-heatmap":
      return "Portfolio Heatmap";
    case "transaction-volume":
      return "Transaction Volume";
    case "risk-alerts":
      return "Risk Alerts";
    case "credit-risk-metrics":
      return "Credit Risk Metrics";
    case "liquidity-coverage-ratio":
      return "Liquidity Coverage";
    case "regulatory-capital":
      return "Regulatory Capital";
    case "stress-test-scenarios":
      return "Stress Testing";
    case "operational-risk-events":
      return "Operational Risk";
    case "trade-data-mapping":
      return "Trade Data Mapping";
    case "trade-reconciliation":
      return "Trade Reconciliation";
    default:
      return "Widget";
  }
};

// Export service functions
export const workspaceService = {
  // Getters
  getPlacedWidgets: () => placedWidgets,
  getMessages: () => messages,
  getIsProcessing: () => isProcessing,
  getWorkspaceTabs: () => workspaceTabs,
  getActiveTabId: () => activeTabId,
  getSelectedWidgetId: () => selectedWidgetId,
  getWidgetCustomization: (widgetId: string): WidgetCustomization | undefined => {
    return widgetCustomizations[widgetId];
  },

  // Workspace actions
  addWidgetByType: (widgetType: WidgetType) => {
    const newWidget = {
      id: uuidv4(),
      type: widgetType,
      title: getWidgetTitle(widgetType),
      columns: [],
      tabId: activeTabId
    };
    
    placedWidgets = [...placedWidgets, newWidget];
    messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
    messageBus.publish(MessageTopics.WORKSPACE.ADD_WIDGET, newWidget);
  },
  
  removeWidget: (widgetId: string) => {
    placedWidgets = placedWidgets.filter(w => w.id !== widgetId);
    messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
    messageBus.publish(MessageTopics.WORKSPACE.REMOVE_WIDGET, widgetId);
    
    // Deselect if the widget was selected
    if (selectedWidgetId === widgetId) {
      workspaceService.selectWidget(null);
    }
  },
  
  removeWidgetByType: (widgetType: WidgetType) => {
    placedWidgets = placedWidgets.filter(w => w.type !== widgetType);
    messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
    messageBus.publish(MessageTopics.WORKSPACE.REMOVE_WIDGET_BY_TYPE, widgetType);
  },
  
  addColumnToWidget: (widgetId: string, columnId: string) => {
    placedWidgets = placedWidgets.map((widget) => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          columns: [...widget.columns, columnId]
        };
      }
      return widget;
    });
    
    messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
    messageBus.publish(MessageTopics.WORKSPACE.ADD_COLUMN_TO_WIDGET, { widgetId, columnId });
  },
  
  reorderWidgets: (fromIndex: number, toIndex: number) => {
    const result = Array.from(placedWidgets);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    
    placedWidgets = result;
    messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
    messageBus.publish(MessageTopics.WORKSPACE.REORDER_WIDGETS, { fromIndex, toIndex });
  },
  
  // Tab management
  addWorkspaceTab: () => {
    const newTabId = uuidv4();
    
    workspaceTabs = workspaceTabs.map(tab => ({ ...tab, isActive: false }));
    workspaceTabs = [...workspaceTabs, { id: newTabId, name: `Tab ${workspaceTabs.length + 1}`, isActive: true }];
    
    activeTabId = newTabId;
    
    messageBus.publish(MessageTopics.WORKSPACE.ADD_TAB, workspaceTabs);
    messageBus.publish(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, activeTabId);
  },
  
  setActiveTab: (tabId: string) => {
    if (tabId === activeTabId) return;
    
    workspaceTabs = workspaceTabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    
    activeTabId = tabId;
    
    messageBus.publish(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, activeTabId);
    messageBus.publish(MessageTopics.WORKSPACE.ADD_TAB, workspaceTabs); // publish updated tabs
  },
  
    removeWorkspaceTab: (tabId: string) => {
      // Don't remove if it's the last tab
      if (workspaceTabs.length <= 1) {
        return;
      }
  
      const tabIndex = workspaceTabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return;
  
      const updatedTabs = workspaceTabs.filter(tab => tab.id !== tabId);
  
      // Handle active tab selection when removing the active tab
      if (activeTabId === tabId) {
        // Try to activate the next tab to the right
        const nextTabIndex = Math.min(tabIndex, updatedTabs.length - 1);
        const newActiveTab = updatedTabs[nextTabIndex];
        
        updatedTabs.forEach(tab => {
          tab.isActive = tab.id === newActiveTab.id;
        });
        activeTabId = newActiveTab.id;
      }
  
      workspaceTabs = updatedTabs;
  
      // Remove widgets associated with this tab
      placedWidgets = placedWidgets.filter(widget => widget.tabId !== tabId);
  
      // Publish updates in correct order
      messageBus.publish(MessageTopics.WORKSPACE.ADD_TAB, workspaceTabs);
      messageBus.publish(MessageTopics.WORKSPACE.WIDGETS_CHANGED, placedWidgets);
      messageBus.publish(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, activeTabId);
      messageBus.publish(MessageTopics.WORKSPACE.REMOVE_TAB, tabId);
  
      // Save updated tabs to persistence
      persistenceService.saveTabs(workspaceTabs);
  },
  
  renameWorkspaceTab: (tabId: string, name: string) => {
    if (!name.trim()) return;
    
    workspaceTabs = workspaceTabs.map(tab => 
      tab.id === tabId ? { ...tab, name } : tab
    );
    
    // Publish updated tabs FIRST
    messageBus.publish(MessageTopics.WORKSPACE.ADD_TAB, workspaceTabs);
    messageBus.publish(MessageTopics.WORKSPACE.RENAME_TAB, { tabId, name });
    
    // Save updated tabs to persistence
    persistenceService.saveTabs(workspaceTabs);
  },
  
  // Widget selection
  selectWidget: (widgetId: string | null) => {
    selectedWidgetId = widgetId;
    
    messageBus.publish(MessageTopics.WORKSPACE.SELECT_WIDGET, widgetId);
    
    if (widgetId) {
      const selectedWidget = placedWidgets.find(w => w.id === widgetId);
      if (selectedWidget) {
        const systemMessage: Message = {
          id: uuidv4(),
          content: `You've selected the "${selectedWidget.title}" widget. You can ask questions about it or request modifications.`,
          type: "system",
          timestamp: new Date(),
        };
        
        messages = [...messages, systemMessage];
        messageBus.publish(MessageTopics.CHAT.NEW_MESSAGE, systemMessage);
      }
    }
  },
  
  // Chat actions
  sendMessage: (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content: content,
      type: "user",
      timestamp: new Date(),
    };
    
    messages = [...messages, userMessage];
    messageBus.publish(MessageTopics.CHAT.NEW_MESSAGE, userMessage);
    
    isProcessing = true;
    messageBus.publish(MessageTopics.CHAT.PROCESSING_STATE_CHANGED, isProcessing);
    
    setTimeout(() => {
      let responseContent = `I've received your message: "${content}". How else can I assist you?`;
      let responseActions: MessageAction[] = [
        {
          id: uuidv4(),
          label: "Add risk widget",
          action: () => workspaceService.addWidgetByType("risk-exposure")
        }
      ];
      
      if (selectedWidgetId) {
        const selectedWidget = placedWidgets.find(w => w.id === selectedWidgetId);
        if (selectedWidget) {
          responseContent = `Regarding the "${selectedWidget.title}" widget: I'll help you with "${content}". What specific changes would you like to make?`;
          responseActions = [
            {
              id: uuidv4(),
              label: `Customize ${selectedWidget.title}`,
              action: () => {
                // Implement customization
                console.log(`Customizing ${selectedWidget.title}`);
              }
            },
            {
              id: uuidv4(),
              label: "Deselect widget",
              action: () => workspaceService.selectWidget(null)
            }
          ];
        }
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        type: "ai",
        timestamp: new Date(),
        actions: responseActions
      };
      
      messages = [...messages, aiMessage];
      isProcessing = false;
      
      messageBus.publish(MessageTopics.CHAT.NEW_MESSAGE, aiMessage);
      messageBus.publish(MessageTopics.CHAT.PROCESSING_STATE_CHANGED, isProcessing);
      messageBus.publish(MessageTopics.CHAT.MESSAGES_CHANGED, messages);
    }, 1000);
  },
  
  // State management
  resetAllState: () => {
    messageBus.publish(MessageTopics.PERSISTENCE.RESET_STATE, null);
  }
};

// Initialize listeners
export function initializeWorkspaceListeners() {
  // Initialize persistence listeners
  const unsubscribePersistence = initializePersistenceListeners();
  
  // Publish initial states for any components that need them
  messageBus.publish(MessageTopics.CHAT.MESSAGES_CHANGED, messages);
  messageBus.publish(MessageTopics.WORKSPACE.ADD_TAB, workspaceTabs);
  
  // Return cleanup function
  return () => {
    unsubscribePersistence();
  };
}
