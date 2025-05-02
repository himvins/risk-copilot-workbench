
# Data Quality Insights Widget

The Data Quality Insights widget provides visibility into data quality issues detected by the AI agent. It includes a human-in-the-loop workflow for critical alerts and remediation actions.

## Key Features

### Alert Management
- Displays data quality alerts with severity levels (Critical, High, Medium, Low)
- Allows users to review, accept, reject, or modify alerts
- Provides recommended next best actions for each alert

### Human-in-the-Loop Workflow
For Critical Alerts that stop the batch:
1. Alert notification is shown with details of the issue
2. Next Best Actions are recommended with options:
   - Stop the batch (checkbox)
   - Notify upstream users (checkbox)
   - Carry Forward from previous date (radio button)
   - Wait for remediated data from upstream (radio button)
3. User can accept or modify the recommended actions
4. Once remediated data is available, a follow-up alert suggests rerunning the batch

### Remediation Workflow
1. Users can review a list of all alerts
2. For each alert:
   - Ask questions via chat to understand the issue
   - Accept or reject the alert
   - Change the severity level
   - Choose from recommended next best actions
   - Add custom actions

### Examples
- **Critical Alert**: Negative IR volatilities found for all vol surfaces
  - User can choose to stop the batch and notify upstream users
  - User can decide whether to carry forward previous data or wait for remediation
  
- **High Alert**: CVA spike over threshold
  - User can inquire why the spike occurred
  - After reviewing explanation, user can accept or reject the alert
  
- **High Alert**: Commodity curves have expired tenors
  - User can escalate severity to Critical
  - Choose next best actions like stopping the batch
  
- **Medium Alert**: Curve data missing for one curve
  - User can accept the suggested action to carry forward previous data

### Integration with Remediation Agent
- When users choose a remediation action, it triggers the Remediation Agent
- The Remediation Agent widget opens showing:
  - The action being taken
  - Historical context of similar issues
  - Progress of the remediation
  - Expected completion time

## Visualization
- Historical view of data quality issues over time
- Detailed breakdown of affected records
- Visual indicators of severity and impact
- Before/after comparisons for remediated data

This widget creates a collaborative workflow between AI agents and human users, ensuring critical decisions include human judgment while automating routine remediations.
