
import { useState, useEffect, useCallback } from 'react';
import { messageBus } from '@/lib/messageBus';
import { workspaceService } from '@/lib/workspaceService';
import { MessageTopics } from '@/lib/messageTopics';
import { Widget, Message, WidgetType, WorkspaceTab, WidgetCustomization, Notification } from '@/types';
import { useSubscription } from './useMessageBus';
import { notificationService } from '@/lib/notificationService';

export function useWorkspace() {
  // Use subscriptions to get state from message bus
  const placedWidgets = useSubscription<Widget[]>(MessageTopics.WORKSPACE.WIDGETS_CHANGED, workspaceService.getPlacedWidgets());
  const messages = useSubscription<Message[]>(MessageTopics.CHAT.MESSAGES_CHANGED, workspaceService.getMessages());
  const isProcessing = useSubscription<boolean>(MessageTopics.CHAT.PROCESSING_STATE_CHANGED, workspaceService.getIsProcessing());
  const workspaceTabs = useSubscription<WorkspaceTab[]>(MessageTopics.WORKSPACE.ADD_TAB, workspaceService.getWorkspaceTabs());
  const activeTabId = useSubscription<string>(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, workspaceService.getActiveTabId());
  const selectedWidgetId = useSubscription<string | null>(MessageTopics.WORKSPACE.SELECT_WIDGET, workspaceService.getSelectedWidgetId());
  const notifications = useSubscription<Notification[]>(MessageTopics.NOTIFICATION.NEW_NOTIFICATION, []);
  const notificationPermission = useSubscription<NotificationPermission>(
    MessageTopics.NOTIFICATION.NOTIFICATION_PERMISSION_CHANGED, 
    notificationService.getNotificationPermission()
  );

  // Request notification permission on component mount
  useEffect(() => {
    if (notificationService.getNotificationPermission() !== 'granted') {
      notificationService.requestNotificationPermission();
    }
  }, []);

  // Expose service methods
  return {
    // State
    placedWidgets: placedWidgets || [],
    messages: messages || [],
    isProcessing: isProcessing || false,
    workspaceTabs: workspaceTabs || [],
    activeTabId: activeTabId || '',
    selectedWidgetId,
    notifications: notificationService.getAllNotifications(),
    notificationPermission,
    
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
    
    // Notification methods
    requestNotificationPermission: useCallback(async () => {
      return await notificationService.requestNotificationPermission();
    }, []),
    
    getNotificationUnreadCount: useCallback(() => {
      return notificationService.getUnreadCount();
    }, []),
    
    markNotificationAsRead: useCallback((id: string) => {
      notificationService.markNotificationAsRead(id);
    }, []),
    
    clearAllNotifications: useCallback(() => {
      notificationService.clearAllNotifications();
    }, []),

    // For demo/testing purposes
    triggerTestNotification: useCallback((type: "data-quality" | "remediation" | "learning") => {
      if (type === "data-quality") {
        notificationService.simulateDataQualityInsight();
      } else if (type === "remediation") {
        notificationService.simulateRemediationAction();
      } else {
        notificationService.simulateLearningEvent();
      }
    }, []),
  };
}
