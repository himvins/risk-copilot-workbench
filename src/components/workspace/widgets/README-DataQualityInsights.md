
# Data Quality Insights Widget

## Overview
The Data Quality Insights Widget provides real-time monitoring and analysis of data quality issues detected by the AI-powered Data Quality Agent. This widget is designed to give risk managers immediate visibility into potential data anomalies that might impact decision-making.

## Features

### Real-time Notification Integration
- Connects with the system-wide notification framework to display alerts when data quality issues are detected
- Automatically appears in the workspace when a data quality notification is clicked

### Data Quality Monitoring
- Lists all detected data quality issues with severity indicators (high, medium, low)
- Provides detailed information about each issue including:
  - Issue title and description
  - Detection timestamp
  - Severity level with visual indicators
  - Source system
  - Related data entities
  - Number of affected records
  - Confidence score of the detection

### Historical Analysis
- Displays historical trends of data quality issues over time
- Visualizes the distribution of issues by severity
- Enables pattern recognition to identify recurring problems

### Interactive Interface
- Selectable issue list for detailed investigation
- Visual indicators of severity levels
- Responsive design that works in both standard and expanded widget modes

## Technical Implementation
- Subscribes to the message bus to receive real-time data quality alerts
- Uses recharts to visualize historical data
- Implements interactive UI components for issue selection and detail viewing
- Provides severity-based color coding for quick visual assessment

## Integration with Other Components
- Works with the notification system to display browser notifications
- Can trigger additional widgets based on specific data quality issues
- Coordinates with the Remediation History Widget to show actions taken on specific issues

## User Workflow
1. User receives a browser notification about a data quality issue
2. User clicks on the notification, which adds this widget to the workspace
3. User can see all detected issues and select one for detailed analysis
4. User can view historical patterns to identify systemic problems
5. Based on the insights, user can investigate further or trigger remediation actions
