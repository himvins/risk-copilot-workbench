
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Widget, Message } from '@/types';
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
}

const WorkspaceContext = createContext<WorkspaceContextProps | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [placedWidgets, setPlacedWidgets] = useState<Widget[]>([]);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    // Simulate AI response after delay
    setTimeout(() => {
      const response = `I'll help you analyze that. ${content.includes('risk') ? 'I recommend looking at the Risk Exposure widget for more insights.' : 'Let me check the data for you.'}`;
      
      respondToMessage(response);
    }, 1500);
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
        respondToMessage
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
