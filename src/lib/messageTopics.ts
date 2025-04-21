
// Message topics for the application
export const MessageTopics = {
  // Workspace related topics
  WORKSPACE: {
    ADD_WIDGET: 'workspace/add-widget',
    REMOVE_WIDGET: 'workspace/remove-widget',
    REMOVE_WIDGET_BY_TYPE: 'workspace/remove-widget-by-type',
    ADD_COLUMN_TO_WIDGET: 'workspace/add-column-to-widget',
    REORDER_WIDGETS: 'workspace/reorder-widgets',
    SELECT_WIDGET: 'workspace/select-widget',
    WIDGETS_CHANGED: 'workspace/widgets-changed',
    ADD_TAB: 'workspace/add-tab',
    REMOVE_TAB: 'workspace/remove-tab', 
    RENAME_TAB: 'workspace/rename-tab',
    ACTIVE_TAB_CHANGED: 'workspace/active-tab-changed'
  },
  
  // Chat related topics
  CHAT: {
    SEND_MESSAGE: 'chat/send-message',
    NEW_MESSAGE: 'chat/new-message',
    PROCESSING_STATE_CHANGED: 'chat/processing-state-changed',
    MESSAGES_CHANGED: 'chat/messages-changed'
  },
  
  // Theme related topics
  THEME: {
    THEME_CHANGED: 'theme/theme-changed',
  },

  // Persistence related topics
  PERSISTENCE: {
    SAVE_STATE: 'persistence/save-state',
    LOAD_STATE: 'persistence/load-state',
    RESET_STATE: 'persistence/reset-state'
  }
};
