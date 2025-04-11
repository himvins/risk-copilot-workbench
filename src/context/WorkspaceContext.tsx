
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Widget, Message, WidgetType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceContextProps {
  widgets: Widget[];
  placedWidgets: Widget[];
  activeWidgetId: string | null;
  messages: Message[];
  isProcessing: boolean;
  addWidget: (type: Widget['type'], title: string, size?: Widget['size']) => void;
  placeWidget: (id: string, position: { x: number, y: number }) => void;
  removeWidget: (id: string) => void;
  setActiveWidgetId: (id: string | null) => void;
  sendMessage: (content: string) => void;
  respondToMessage: (content: string, actions?: Message['actions']) => void;
  addWidgetByType: (type: Widget['type']) => void;
  removeWidgetByType: (type: Widget['type']) => void;
  findWidgetTitleByType: (type: Widget['type']) => string;
}

const WorkspaceContext = createContext<WorkspaceContextProps | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
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

  const findWidgetTitleByType = (type: Widget['type']): string => {
    return widgetTitles[type as WidgetType] || 'Widget';
  };

  const addWidget = (type: Widget['type'], title: string, size: Widget['size'] = 'md') => {
    const newWidget: Widget = {
      id: uuidv4(),
      type,
      title,
      size,
      isPlaced: false,
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const addWidgetByType = (type: Widget['type']) => {
    const title = findWidgetTitleByType(type);
    
    // Check if widget already exists in placed widgets
    const existsInPlaced = placedWidgets.some(w => w.type === type);
    
    if (!existsInPlaced) {
      // Create the widget directly in the placed widgets with a default position
      const newWidget: Widget = {
        id: uuidv4(),
        type,
        title,
        size: 'md',
        isPlaced: true,
        position: {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100)
        }
      };
      
      setPlacedWidgets(prev => [...prev, newWidget]);
      
      // Respond with a confirmation
      respondToMessage(`I've added the ${title} widget to your workspace.`);
    } else {
      respondToMessage(`You already have a ${title} widget in your workspace.`);
    }
  };

  const removeWidgetByType = (type: Widget['type']) => {
    const widgetToRemove = placedWidgets.find(w => w.type === type);
    if (widgetToRemove) {
      setPlacedWidgets(prev => prev.filter(w => w.type !== type));
      respondToMessage(`I've removed the ${findWidgetTitleByType(type)} widget from your workspace.`);
    } else {
      respondToMessage(`I couldn't find a ${findWidgetTitleByType(type)} widget in your workspace.`);
    }
  };

  const placeWidget = (id: string, position: { x: number, y: number }) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    const updatedWidget = { ...widget, position, isPlaced: true };
    setWidgets(prev => prev.filter(w => w.id !== id));
    setPlacedWidgets(prev => [...prev, updatedWidget]);
  };

  const removeWidget = (id: string) => {
    const widgetIndex = placedWidgets.findIndex(w => w.id === id);
    if (widgetIndex !== -1) {
      setPlacedWidgets(prev => prev.filter(w => w.id !== id));
      const widget = placedWidgets[widgetIndex];
      setWidgets(prev => [...prev, { ...widget, isPlaced: false, position: undefined }]);
    }
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
    let widgetActionTaken = false;
    
    for (const pattern of addWidgetPatterns) {
      if (pattern.regex.test(lowerContent)) {
        addWidgetByType(pattern.type);
        widgetActionTaken = true;
        break;
      }
    }
    
    // Check if we need to remove a widget
    if (!widgetActionTaken) {
      for (const pattern of removeWidgetPatterns) {
        if (pattern.regex.test(lowerContent)) {
          removeWidgetByType(pattern.type);
          widgetActionTaken = true;
          break;
        }
      }
    }
    
    // If no widget action was taken, provide a generic response
    if (!widgetActionTaken) {
      setTimeout(() => {
        const response = `I'll help you analyze that. ${content.includes('risk') ? 'I recommend looking at the Risk Exposure widget for more insights.' : 'Let me check the data for you.'}`;
        
        // Add actions to suggest widgets
        const actions: Message['actions'] = [
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
        widgets,
        placedWidgets,
        activeWidgetId,
        messages,
        isProcessing,
        addWidget,
        placeWidget,
        removeWidget,
        setActiveWidgetId,
        sendMessage,
        respondToMessage,
        addWidgetByType,
        removeWidgetByType,
        findWidgetTitleByType
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
