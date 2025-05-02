
# Learning Agent Widget

The Learning Agent widget provides insights into the AI agent's learning process, data sources, and model performance. This widget is designed to provide transparency into how the AI makes decisions and what data it uses.

## Key Features

### Validation Rules
The widget displays a table of validation rules used by the learning agent to evaluate data quality:
- Rule ID: Unique identifier for each rule
- Type: Classification of rule (e.g., Interest Rate, CSA Terms, Trade)
- Data Element: The specific data field being validated
- Rule Description: Detailed explanation of what the rule checks for
- Threshold: Numerical threshold for rules that use one
- Scope of checks: Where and when the rule is applied
- Severity: Impact level if rule is violated (Critical, High, Medium, Low)

### Quality Rules
The widget shows predefined quality rules categorized by data domain:

1. **Interest Rates Rules**:
   - IR014: Flag negative values for FwdRate
   - IR015: Check for spikes in FwdRate across different Tenors
   - IR016: Check if FwdRate for longer tenors is lower than shorter tenors
   - IR017: Check for duplicate entries
   - IR018: Ensure standard tenors have FwdRate values

2. **CSA Terms Rules**:
   - CSA027: Flag contractual inconsistencies
   - CSA028: Check threshold amount relationships
   - CSA029: Validate minimum transfer amounts
   - CSA030: Check for consistent independent amounts
   - CSA031: Validate IM CSA types
   - CSA032: Verify margin frequency settings

3. **Trades Rules**:
   - TRD026: Flag trades with contractual netting issues
   - TRD027: Check for missing ratings
   - TRD028: Validate CVA and DVA relationships
   - TRD029: Verify agreement IDs
   - TRD030-031: Check value consistency rules

### Contextual Rules
Rules that consider broader context and relationships:

1. **Interest Rates Contextual Rules**:
   - IR019-022: Data completeness, significant changes, outliers, and timeliness

2. **CSA Terms Contextual Rules**:
   - CSA033-035: Completeness, change tracking, and frequency adherence

3. **Trades Contextual Rules**:
   - TRD032-041: Missing data, significant changes, outliers, timeliness, rating changes, and data consistency

### Learning Process Visualization
The widget visualizes how the agent learns over time, showing:
- Data collection processes
- Model training metrics
- Performance improvements
- Learning sources

### Model Performance Metrics
The widget displays key model performance indicators:
- Accuracy
- Precision
- Recall
- F1 Score

## Workflow
1. Agent continuously monitors data streams
2. Rules are applied to incoming data
3. Anomalies or issues are flagged
4. Learning process updates models based on new data
5. Performance metrics are updated
6. Users can review the learning process and understand why decisions are made

This widget provides transparency into the AI's decision-making process, helping users understand how and why certain alerts are triggered.
