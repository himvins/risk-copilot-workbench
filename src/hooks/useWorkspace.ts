
import { useState, useEffect, useCallback } from 'react';
import { messageBus } from '@/lib/messageBus';
import { workspaceService } from '@/lib/workspaceService';
import { MessageTopics } from '@/lib/messageTopics';
import { Widget, Message, WidgetType, WorkspaceTab, WidgetCustomization } from '@/types';
import { useSubscription } from './useMessageBus';

export function useWorkspace() {
  // Use subscriptions to get state from message bus
  const placedWidgets = useSubscription<Widget[]>(MessageTopics.WORKSPACE.WIDGETS_CHANGED, workspaceService.getPlacedWidgets());
  const messages = useSubscription<Message[]>(MessageTopics.CHAT.MESSAGES_CHANGED, workspaceService.getMessages());
  const isProcessing = useSubscription<boolean>(MessageTopics.CHAT.PROCESSING_STATE_CHANGED, workspaceService.getIsProcessing());
  const workspaceTabs = useSubscription<WorkspaceTab[]>(MessageTopics.WORKSPACE.ADD_TAB, workspaceService.getWorkspaceTabs());
  const activeTabId = useSubscription<string>(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, workspaceService.getActiveTabId());
  const selectedWidgetId = useSubscription<string | null>(MessageTopics.WORKSPACE.SELECT_WIDGET, workspaceService.getSelectedWidgetId());

  // Expose service methods
  return {
    // State
    placedWidgets: placedWidgets || [],
    messages: messages || [],
    isProcessing: isProcessing || false,
    workspaceTabs: workspaceTabs || [],
    activeTabId: activeTabId || '',
    selectedWidgetId,
    
    // Widget actions
    addWidgetByType: useCallback((widgetType: WidgetType) => {
      workspaceService.addWidgetByType(widgetType);
    }, []),
    
    removeWidget: useCallback((widgetId: string) => {
      workspaceService.removeWidget(widgetId);
    }, []),
    
    removeWidgetByType: useCallback((widgetType: WidgetType) => {
      workspaceService.removeWidgetByType(widgetType);
    }, []),
    
    addColumnToWidget: useCallback((widgetId: string, columnId: string) => {
      workspaceService.addColumnToWidget(widgetId, columnId);
    }, []),
    
    reorderWidgets: useCallback((fromIndex: number, toIndex: number) => {
      workspaceService.reorderWidgets(fromIndex, toIndex);
    }, []),
    
    // Tab management
    addWorkspaceTab: useCallback(() => {
      workspaceService.addWorkspaceTab();
    }, []),
    
    setActiveTab: useCallback((tabId: string) => {
      workspaceService.setActiveTab(tabId);
    }, []),
    
    removeWorkspaceTab: useCallback((tabId: string) => {
      workspaceService.removeWorkspaceTab(tabId);
    }, []),
    
    renameWorkspaceTab: useCallback((tabId: string, name: string) => {
      workspaceService.renameWorkspaceTab(tabId, name);
    }, []),
    
    // Widget selection
    selectWidget: useCallback((widgetId: string | null) => {
      workspaceService.selectWidget(widgetId);
    }, []),
    
    // Chat actions
    sendMessage: useCallback((content: string) => {
      workspaceService.sendMessage(content);
    }, []),
    
    // Custom data
    getWidgetCustomization: useCallback((widgetId: string): WidgetCustomization | undefined => {
      return workspaceService.getWidgetCustomization(widgetId);
    }, []),
    
    // State management
    resetAllState: useCallback(() => {
      workspaceService.resetAllState();
    }, []),
  };
}
