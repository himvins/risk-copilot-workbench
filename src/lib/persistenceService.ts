import { messageBus } from './messageBus';
import { MessageTopics } from './messageTopics';
import { Widget, Message, WorkspaceTab } from '@/types';

// Persistence keys
const STORAGE_KEYS = {
  WIDGETS: 'risk-dashboard-widgets',
  WORKSPACE_TABS: 'risk-dashboard-tabs',
  ACTIVE_TAB_ID: 'risk-dashboard-active-tab',
  CHAT_MESSAGES: 'risk-dashboard-messages',
  THEME: 'theme'
};

export const persistenceService = {
  // Save methods - persist data to localStorage
  saveWidgets: (widgets: Widget[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets));
    } catch (error) {
      console.error('Failed to save widgets to localStorage:', error);
    }
  },
  
  saveTabs: (tabs: WorkspaceTab[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_TABS, JSON.stringify(tabs));
    } catch (error) {
      console.error('Failed to save tabs to localStorage:', error);
    }
  },
  
  saveActiveTabId: (tabId: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB_ID, tabId);
    } catch (error) {
      console.error('Failed to save active tab to localStorage:', error);
    }
  },
  
  saveMessages: (messages: Message[]) => {
    try {
      // Limit stored messages to prevent localStorage size issues
      const messagesToStore = messages.slice(-50); // Store last 50 messages
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  },

  // Load methods - retrieve data from localStorage
  loadWidgets: (): Widget[] => {
    try {
      const storedWidgets = localStorage.getItem(STORAGE_KEYS.WIDGETS);
      return storedWidgets ? JSON.parse(storedWidgets) : [];
    } catch (error) {
      console.error('Failed to load widgets from localStorage:', error);
      return [];
    }
  },
  
  loadTabs: (): WorkspaceTab[] => {
    try {
      const storedTabs = localStorage.getItem(STORAGE_KEYS.WORKSPACE_TABS);
      const tabs = storedTabs ? JSON.parse(storedTabs) : null;
      
      if (tabs && Array.isArray(tabs) && tabs.length > 0) {
        return tabs;
      }
      
      // Return default tab if none found
      return [{ id: '1', name: 'Overview', isActive: true }];
    } catch (error) {
      console.error('Failed to load tabs from localStorage:', error);
      return [{ id: '1', name: 'Overview', isActive: true }];
    }
  },
  
  loadActiveTabId: (): string => {
    try {
      const storedTabId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID);
      return storedTabId || '1'; // Default tab id if none found
    } catch (error) {
      console.error('Failed to load active tab from localStorage:', error);
      return '1';
    }
  },
  
  loadMessages: (): Message[] => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
      return [];
    }
  },
  
  // Reset all stored data
  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WIDGETS);
      localStorage.removeItem(STORAGE_KEYS.WORKSPACE_TABS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB_ID);
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
      // Don't remove theme preference as it's a user preference
      
      console.log('All localStorage data has been reset');
    } catch (error) {
      console.error('Failed to reset localStorage data:', error);
    }
  }
};

// Initialize persistence listeners
export function initializePersistenceListeners() {
  // Listen for state changes and persist them
  const subscriptions = [
    messageBus.subscribe(MessageTopics.WORKSPACE.WIDGETS_CHANGED, persistenceService.saveWidgets),
    messageBus.subscribe(MessageTopics.WORKSPACE.ADD_TAB, persistenceService.saveTabs),
    messageBus.subscribe(MessageTopics.WORKSPACE.REMOVE_TAB, () => {
      // Save the updated tabs after a tab is removed
      const tabs = workspaceService.getWorkspaceTabs();
      persistenceService.saveTabs(tabs);
    }),
    messageBus.subscribe(MessageTopics.WORKSPACE.RENAME_TAB, ({ tabId, name }) => {
      // Save the updated tabs after a tab is renamed
      const tabs = workspaceService.getWorkspaceTabs();
      persistenceService.saveTabs(tabs);
    }),
    messageBus.subscribe(MessageTopics.WORKSPACE.ACTIVE_TAB_CHANGED, persistenceService.saveActiveTabId),
    messageBus.subscribe(MessageTopics.CHAT.NEW_MESSAGE, (message) => {
      // When a new message is added, save all messages
      const messages = messageBus.getLastValue(MessageTopics.CHAT.MESSAGES_CHANGED) || [];
      persistenceService.saveMessages([...messages, message]);
      messageBus.publish(MessageTopics.CHAT.MESSAGES_CHANGED, [...messages, message]);
    }),
    messageBus.subscribe(MessageTopics.PERSISTENCE.RESET_STATE, () => {
      persistenceService.resetAll();
      // Reload the page to get fresh state
      window.location.reload();
    }),
  ];
  
  return () => {
    subscriptions.forEach(subscription => subscription.unsubscribe());
  };
}

// Import the workspace service to access current tabs
import { workspaceService } from './workspaceService';
