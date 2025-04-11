
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Widget, Message, WidgetType, WidgetCustomization } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceContextProps {
  placedWidgets: Widget[];
  activeWidgetId: string | null;
  messages: Message[];
  isProcessing: boolean;
  removeWidget: (id: string) => void;
  setActiveWidgetId: (id: string | null) => void;
  sendMessage: (content: string) => void;
  respondToMessage: (content: string, actions?: Message['actions']) => void;
  addWidgetByType: (type: WidgetType) => void;
  removeWidgetByType: (type: WidgetType) => void;
  findWidgetTitleByType: (type: WidgetType) => string;
  getWidgetCustomization: (widgetId: string) => WidgetCustomization | undefined;
  addColumnToWidget: (widgetId: string, columnType: string, columnName: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
  const [widgetCustomizations, setWidgetCustomizations] = useState<Record<string, WidgetCustomization>>({});
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Widget title mapping
  const widgetTitles: Record<WidgetType, string> = {
    'risk-exposure': 'Risk Exposure',
    'counterparty-analysis': 'Counterparty Analysis',
    'market-volatility': 'Market Volatility',
    'portfolio-heatmap': 'Portfolio Heatmap',
    'transaction-volume': 'Transaction Volume',
    'risk-alerts': 'Risk Alerts'
  };

  const findWidgetTitleByType = (type: WidgetType): string => {
    return widgetTitles[type] || 'Widget';
  };

  // Get widget customization
  const getWidgetCustomization = (widgetId: string) => {
    return widgetCustomizations[widgetId];
  };

  // Add a column to a widget
  const addColumnToWidget = (widgetId: string, columnType: string, columnName: string) => {
    setWidgetCustomizations(prev => {
      const currentCustomization = prev[widgetId] || { additionalColumns: [] };
      return {
        ...prev,
        [widgetId]: {
          ...currentCustomization,
          additionalColumns: [
            ...currentCustomization.additionalColumns,
            { id: uuidv4(), type: columnType, name: columnName }
          ]
        }
      };
    });
    
    // Find the widget to use its title in the response
    const widget = placedWidgets.find(w => w.id === widgetId);
    respondToMessage(`I've added the ${columnName} column to your ${widget?.title} widget.`);
  };

  // Expose the workspace context to the window for the drag and drop operations
  useEffect(() => {
    const contextEl = document.querySelector('[data-workspace-context]');
    if (contextEl) {
      (contextEl as any).__workspaceContext = {
        addWidgetByType,
        removeWidgetByType,
        addColumnToWidget
      };
    }
  }, []);

  const addWidgetByType = (type: WidgetType) => {
    const title = findWidgetTitleByType(type);
    
    // Check if widget already exists in placed widgets
    const existsInPlaced = placedWidgets.some(w => w.type === type);
    
    if (!existsInPlaced) {
      // Create the widget directly in the placed widgets
      const newWidget: Widget = {
        id: uuidv4(),
        type,
        title,
        size: 'md',
        isPlaced: true,
      };
      
      setPlacedWidgets(prev => [...prev, newWidget]);
      
      // Respond with a confirmation
      respondToMessage(`I've added the ${title} widget to your workspace.`);
      
      // Suggest columns if it's the counterparty widget
      if (type === 'counterparty-analysis') {
        setTimeout(() => {
          const actions: Message['actions'] = [
            {
              id: uuidv4(),
              label: 'Add Profitability Column',
              action: () => {
                const widget = placedWidgets.find(w => w.type === 'counterparty-analysis');
                if (widget) {
                  addColumnToWidget(widget.id, 'profitability', 'Profitability');
                }
              }
            },
            {
              id: uuidv4(),
              label: 'Add Sentiment Column',
              action: () => {
                const widget = placedWidgets.find(w => w.type === 'counterparty-analysis');
                if (widget) {
                  addColumnToWidget(widget.id, 'sentiment', 'Sentiment');
                }
              }
            }
          ];
          
          respondToMessage("Would you like to enhance the counterparty analysis with AI-powered insights? I can add additional data columns.", actions);
        }, 1500);
      }
    } else {
      respondToMessage(`You already have a ${title} widget in your workspace.`);
    }
  };

  const removeWidgetByType = (type: WidgetType) => {
    const widgetToRemove = placedWidgets.find(w => w.type === type);
    if (widgetToRemove) {
      setPlacedWidgets(prev => prev.filter(w => w.type !== type));
      respondToMessage(`I've removed the ${findWidgetTitleByType(type)} widget from your workspace.`);
    } else {
      respondToMessage(`I couldn't find a ${findWidgetTitleByType(type)} widget in your workspace.`);
    }
  };

  const removeWidget = (id: string) => {
    setPlacedWidgets(prev => prev.filter(w => w.id !== id));
  };

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      type: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);

    // Process message content to identify widget-related commands
    const lowerContent = content.toLowerCase();
    
    // Check for adding widgets
    const addWidgetPatterns = [
      { regex: /add (risk exposure|risk-exposure)/i, type: 'risk-exposure' as WidgetType },
      { regex: /add (counterparty analysis|counterparty-analysis)/i, type: 'counterparty-analysis' as WidgetType },
      { regex: /add (market volatility|market-volatility)/i, type: 'market-volatility' as WidgetType },
      { regex: /add (portfolio heatmap|portfolio-heatmap)/i, type: 'portfolio-heatmap' as WidgetType },
      { regex: /add (transaction volume|transaction-volume)/i, type: 'transaction-volume' as WidgetType },
      { regex: /add (risk alerts|risk-alerts)/i, type: 'risk-alerts' as WidgetType },
      { regex: /show me (risk exposure|risks|exposures)/i, type: 'risk-exposure' as WidgetType },
      { regex: /show me (counterparty|counterparties)/i, type: 'counterparty-analysis' as WidgetType },
      { regex: /show me (market|volatility)/i, type: 'market-volatility' as WidgetType },
      { regex: /show me (portfolio|heatmap)/i, type: 'portfolio-heatmap' as WidgetType },
      { regex: /show me (transactions|volumes)/i, type: 'transaction-volume' as WidgetType },
      { regex: /show me (alerts|risk alerts)/i, type: 'risk-alerts' as WidgetType },
    ];
    
    // Check for adding columns to counterparty widget
    const addColumnPatterns = [
      { regex: /add (profitability|profit|revenue) column/i, type: 'profitability', name: 'Profitability' },
      { regex: /add (sentiment|market sentiment) column/i, type: 'sentiment', name: 'Sentiment' },
      { regex: /add (volatility|price volatility) column/i, type: 'volatility', name: 'Volatility' },
    ];
    
    // Check for removing widgets
    const removeWidgetPatterns = [
      { regex: /remove (risk exposure|risk-exposure)/i, type: 'risk-exposure' as WidgetType },
      { regex: /remove (counterparty analysis|counterparty-analysis)/i, type: 'counterparty-analysis' as WidgetType },
      { regex: /remove (market volatility|market-volatility)/i, type: 'market-volatility' as WidgetType },
      { regex: /remove (portfolio heatmap|portfolio-heatmap)/i, type: 'portfolio-heatmap' as WidgetType },
      { regex: /remove (transaction volume|transaction-volume)/i, type: 'transaction-volume' as WidgetType },
      { regex: /remove (risk alerts|risk-alerts)/i, type: 'risk-alerts' as WidgetType },
    ];
    
    // Check if we need to add a widget
    let actionTaken = false;
    
    for (const pattern of addWidgetPatterns) {
      if (pattern.regex.test(lowerContent)) {
        addWidgetByType(pattern.type);
        actionTaken = true;
        break;
      }
    }
    
    // Check if we need to add a column
    if (!actionTaken) {
      for (const pattern of addColumnPatterns) {
        if (pattern.regex.test(lowerContent)) {
          const counterpartyWidget = placedWidgets.find(w => w.type === 'counterparty-analysis');
          if (counterpartyWidget) {
            addColumnToWidget(counterpartyWidget.id, pattern.type, pattern.name);
            actionTaken = true;
            break;
          } else {
            respondToMessage("You need to add the Counterparty Analysis widget first before adding columns to it.");
            actionTaken = true;
            break;
          }
        }
      }
    }
    
    // Check if we need to remove a widget
    if (!actionTaken) {
      for (const pattern of removeWidgetPatterns) {
        if (pattern.regex.test(lowerContent)) {
          removeWidgetByType(pattern.type);
          actionTaken = true;
          break;
        }
      }
    }
    
    // If no widget action was taken, provide a generic response
    if (!actionTaken) {
      setTimeout(() => {
        const counterpartyWidget = placedWidgets.find(w => w.type === 'counterparty-analysis');
        
        let actions: Message['actions'] = [
          {
            id: uuidv4(),
            label: 'Add Risk Exposure',
            action: () => addWidgetByType('risk-exposure')
          },
          {
            id: uuidv4(),
            label: 'Add Market Volatility',
            action: () => addWidgetByType('market-volatility')
          }
        ];
        
        // If counterparty widget exists, add column suggestions
        if (counterpartyWidget) {
          actions = [
            {
              id: uuidv4(),
              label: 'Add Profitability Column',
              action: () => addColumnToWidget(counterpartyWidget.id, 'profitability', 'Profitability')
            },
            {
              id: uuidv4(),
              label: 'Add Sentiment Column',
              action: () => addColumnToWidget(counterpartyWidget.id, 'sentiment', 'Sentiment')
            },
            {
              id: uuidv4(),
              label: 'Add Volatility Column',
              action: () => addColumnToWidget(counterpartyWidget.id, 'volatility', 'Volatility')
            },
            ...actions
          ];
        }
        
        const response = `I'll help you analyze that. ${content.includes('risk') ? 'I recommend looking at the Risk Exposure widget for more insights.' : 'Let me check the data for you.'}`;
        respondToMessage(response, actions);
      }, 1500);
    }
  };

  const respondToMessage = (content: string, actions?: Message['actions']) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      type: 'ai',
      timestamp: new Date(),
      actions,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        placedWidgets,
        activeWidgetId,
        messages,
        isProcessing,
        removeWidget,
        setActiveWidgetId,
        sendMessage,
        respondToMessage,
        addWidgetByType,
        removeWidgetByType,
        findWidgetTitleByType,
        getWidgetCustomization,
        addColumnToWidget
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
