
import { v4 as uuidv4 } from "uuid";
import { messageBus } from "./messageBus";
import { MessageTopics } from "./messageTopics";
import { Notification, NotificationType, AgentInsight, RemediationAction, LearningEvent } from "@/types";
import { toast } from "@/hooks/use-toast";

// Store notifications
let notifications: Notification[] = [];

// Check if browser notifications are supported
const isBrowserNotificationSupported = () => {
  return 'Notification' in window;
};

// Request permission for browser notifications
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  messageBus.publish(MessageTopics.NOTIFICATION.NOTIFICATION_PERMISSION_CHANGED, permission);
  return permission;
};

// Get current notification permission
const getNotificationPermission = (): NotificationPermission => {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Show browser notification
const showBrowserNotification = (title: string, body: string, data?: any): void => {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    // Fall back to toast notification if browser notifications not allowed
    toast({
      title: title,
      description: body,
    });
    return;
  }
  
  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: data?.id || uuidv4(),
      data
    });
    
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      messageBus.publish(MessageTopics.NOTIFICATION.NOTIFICATION_CLICKED, notification.data);
    };
  } catch (error) {
    console.error('Error showing notification:', error);
    toast({
      title: title,
      description: body,
    });
  }
};

// Add a new notification and show browser notification
const addNotification = (title: string, body: string, type: NotificationType, data?: any): Notification => {
  const notification: Notification = {
    id: uuidv4(),
    title,
    body,
    timestamp: new Date(),
    type,
    read: false,
    data
  };
  
  notifications = [notification, ...notifications];
  
  // Publish to message bus
  messageBus.publish(MessageTopics.NOTIFICATION.NEW_NOTIFICATION, notification);
  
  // Show browser notification
  showBrowserNotification(title, body, {
    id: notification.id,
    type: notification.type,
    data
  });
  
  return notification;
};

// Mark notification as read
const markNotificationAsRead = (id: string): void => {
  notifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
};

// Get all notifications
const getAllNotifications = (): Notification[] => {
  return notifications;
};

// Get unread notifications count
const getUnreadCount = (): number => {
  return notifications.filter(notification => !notification.read).length;
};

// Clear all notifications
const clearAllNotifications = (): void => {
  notifications = [];
};

// Simulate Data Quality insights
const simulateDataQualityInsight = (): AgentInsight => {
  const insight: AgentInsight = {
    id: uuidv4(),
    title: "Data Quality Issue Detected",
    description: "Unusual pattern detected in transaction data. Possible data anomaly in the financial transactions from March 2025.",
    timestamp: new Date(),
    severity: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
    source: "Transaction Data Pipeline",
    relatedEntities: ["transaction_log", "financial_records"],
    metadata: {
      affectedRecords: Math.floor(Math.random() * 500) + 50,
      confidenceScore: Math.random() * 0.5 + 0.5
    }
  };
  
  addNotification(
    "Data Quality Alert", 
    insight.description, 
    "data-quality-alert", 
    { insight }
  );
  
  messageBus.publish(MessageTopics.AGENT.DATA_QUALITY_ALERT, insight);
  
  return insight;
};

// Simulate Remediation Action
const simulateRemediationAction = (): RemediationAction => {
  const action: RemediationAction = {
    id: uuidv4(),
    title: "Automated Data Correction",
    description: "Remediation agent has automatically corrected outlier values in the transaction dataset.",
    timestamp: new Date(),
    status: Math.random() > 0.2 ? "completed" : Math.random() > 0.5 ? "pending" : "failed",
    actionTaken: "Applied statistical normalization to outlier values.",
    result: "97% of identified issues were successfully resolved.",
    metadata: {
      correctedRecords: Math.floor(Math.random() * 200) + 30,
      executionTime: Math.floor(Math.random() * 120) + 10 + " seconds"
    }
  };
  
  addNotification(
    "Remediation Action", 
    action.description, 
    "remediation-action", 
    { action }
  );
  
  messageBus.publish(MessageTopics.AGENT.REMEDIATION_ACTION, action);
  
  return action;
};

// Simulate Learning Event
const simulateLearningEvent = (): LearningEvent => {
  const event: LearningEvent = {
    id: uuidv4(),
    title: "Model Learning Completed",
    description: "Learning agent has completed processing new market volatility patterns.",
    timestamp: new Date(),
    dataSource: "Market Data API",
    dataPoints: Math.floor(Math.random() * 10000) + 5000,
    learningType: Math.random() > 0.6 ? "supervised" : Math.random() > 0.5 ? "unsupervised" : "reinforcement",
    metrics: {
      accuracy: (Math.random() * 0.15 + 0.80).toFixed(4),
      precision: (Math.random() * 0.15 + 0.78).toFixed(4),
      recall: (Math.random() * 0.15 + 0.75).toFixed(4),
      f1Score: (Math.random() * 0.15 + 0.77).toFixed(4)
    }
  };
  
  addNotification(
    "Learning Update", 
    event.description, 
    "learning-update", 
    { event }
  );
  
  messageBus.publish(MessageTopics.AGENT.LEARNING_UPDATE, event);
  
  return event;
};

// For development/testing: Simulate random notifications
let simulationInterval: NodeJS.Timeout | null = null;

const startNotificationSimulation = (intervalMs: number = 60000): void => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }
  
  simulationInterval = setInterval(() => {
    const random = Math.random();
    
    if (random < 0.4) {
      simulateDataQualityInsight();
    } else if (random < 0.7) {
      simulateRemediationAction();
    } else {
      simulateLearningEvent();
    }
  }, intervalMs);
};

const stopNotificationSimulation = (): void => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

// Initialize notification listeners
const initializeNotificationListeners = (): () => void => {
  // Handle notification clicks
  const unsubscribeNotificationClick = messageBus.subscribe(
    MessageTopics.NOTIFICATION.NOTIFICATION_CLICKED,
    (data: any) => {
      if (data?.id) {
        markNotificationAsRead(data.id);
        
        // Add appropriate widget based on notification type
        if (data.type === "data-quality-alert") {
          import("./workspaceService").then(({ workspaceService }) => {
            workspaceService.addWidgetByType("data-quality-insights");
          });
        } else if (data.type === "remediation-action") {
          import("./workspaceService").then(({ workspaceService }) => {
            workspaceService.addWidgetByType("remediation-history");
          });
        } else if (data.type === "learning-update") {
          import("./workspaceService").then(({ workspaceService }) => {
            workspaceService.addWidgetByType("learning-agent");
          });
        }
      }
    }
  );
  
  // Start simulation for development purposes (1 minute interval)
  startNotificationSimulation(60000);
  
  return () => {
    unsubscribeNotificationClick();
    stopNotificationSimulation();
  };
};

export const notificationService = {
  isBrowserNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  addNotification,
  markNotificationAsRead,
  getAllNotifications,
  getUnreadCount,
  clearAllNotifications,
  simulateDataQualityInsight,
  simulateRemediationAction,
  simulateLearningEvent,
  startNotificationSimulation,
  stopNotificationSimulation
};

export { initializeNotificationListeners };
