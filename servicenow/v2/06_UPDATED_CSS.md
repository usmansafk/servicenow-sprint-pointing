# Updated CSS (v2) - Structural Improvements

This CSS focuses on layout and structure. Colors remain minimal (light theme).

```css
/* ============ RESET & BASE ============ */
.sprint-pointing-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* ============ HEADER ============ */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 15px;
}

.session-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 20px;
}

.session-label {
  font-size: 12px;
  color: #666;
}

.session-code {
  font-weight: 600;
  font-family: monospace;
  font-size: 14px;
  color: #333;
}

.session-name {
  color: #666;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.progress-indicator {
  font-size: 14px;
  color: #666;
}

.progress-pointed {
  color: #4caf50;
}

.participant-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #e0e0e0;
}

/* ============ TIMER BAR ============ */
.timer-bar {
  height: 4px;
  background: #e0e0e0;
  position: relative;
}

.timer-progress {
  height: 100%;
  background: #2196f3;
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  right: 10px;
  top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* ============ LOADING & ERROR ============ */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: #666;
}

.loading-spinner i {
  color: #2196f3;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #ffebee;
  color: #c62828;
  border-bottom: 1px solid #ef9a9a;
}

.error-banner i {
  font-size: 18px;
}

/* ============ MAIN CONTENT - 3 PANEL LAYOUT ============ */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr 360px;
  gap: 0;
  flex: 1;
  overflow: hidden;
}

/* ============ LEFT PANEL - STORY LIST ============ */
.left-panel {
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.story-count {
  background: #e0e0e0;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.story-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.story-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: white;
}

.story-list-item:hover {
  border-color: #bdbdbd;
  background: #fafafa;
}

.story-list-item.active {
  border-color: #2196f3;
  background: #e3f2fd;
}

.story-list-item.status-voting {
  border-left: 3px solid #ff9800;
}

.story-list-item.status-pointed {
  border-left: 3px solid #4caf50;
}

.story-list-item.status-skipped {
  opacity: 0.6;
}

.story-status-icon {
  width: 24px;
  text-align: center;
  font-size: 14px;
}

.story-status-icon .fa-check-circle { color: #4caf50; }
.story-status-icon .fa-spinner { color: #ff9800; }
.story-status-icon .fa-circle-o { color: #9e9e9e; }
.story-status-icon .fa-forward { color: #9e9e9e; }

.story-info {
  flex: 1;
  min-width: 0;
}

.story-number {
  font-size: 11px;
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 2px;
}

.story-title {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-points-badge {
  background: #4caf50;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.story-status-badge {
  font-size: 10px;
}

.badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.badge-default { background: #e0e0e0; color: #666; }
.badge-warning { background: #fff3e0; color: #e65100; }
.badge-success { background: #e8f5e9; color: #2e7d32; }
.badge-muted { background: #f5f5f5; color: #9e9e9e; }

.panel-footer {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
}

/* ============ CENTER PANEL - STORY DETAILS ============ */
.center-panel {
  background: #fafafa;
  overflow-y: auto;
  padding: 25px;
}

.story-detail {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.story-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.story-number-large {
  font-size: 14px;
  font-weight: 600;
  color: #2196f3;
}

.story-badges {
  display: flex;
  gap: 8px;
}

.badge-type {
  background: #e3f2fd;
  color: #1565c0;
}

.badge-state {
  background: #f5f5f5;
  color: #666;
}

.story-title-large {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

/* Metadata Grid */
.story-metadata-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.metadata-item {
  min-width: 0;
}

.metadata-item label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #9e9e9e;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metadata-value {
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit {
  background: none;
  border: none;
  padding: 2px 6px;
  cursor: pointer;
  color: #9e9e9e;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.15s;
}

.metadata-item:hover .btn-edit,
.story-section:hover .btn-edit {
  opacity: 1;
}

.btn-edit:hover {
  color: #2196f3;
}

/* Story Sections */
.story-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.section-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.section-content pre {
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.text-muted {
  color: #9e9e9e;
}

.story-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9e9e9e;
}

.empty-state i {
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.empty-state p {
  margin: 0;
}

/* ============ RIGHT PANEL - VOTING ============ */
.right-panel {
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.voting-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Voting States */
.pending-state,
.vote-submitted-section,
.pointed-section,
.skipped-section {
  text-align: center;
  padding: 40px 20px;
}

.pending-state i,
.pointed-section i,
.skipped-section i {
  color: #9e9e9e;
  margin-bottom: 15px;
}

.pointed-section i {
  color: #4caf50;
}

/* Voting Cards */
.voting-cards-section {
  padding: 10px 0;
}

.voting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.round-indicator {
  font-weight: 600;
  color: #333;
}

.vote-count-text {
  font-size: 13px;
  color: #666;
}

.timer-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.vote-card {
  aspect-ratio: 1;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vote-card:hover {
  border-color: #2196f3;
  background: #e3f2fd;
}

.vote-card.selected {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
  transform: scale(1.05);
}

.card-value {
  font-size: 18px;
  font-weight: 600;
}

.submit-btn {
  margin-bottom: 10px;
}

.moderator-btn {
  margin-top: 10px;
}

/* Vote Submitted */
.submitted-confirmation {
  margin-bottom: 25px;
}

.submitted-confirmation i {
  color: #4caf50;
  margin-bottom: 10px;
}

.your-vote {
  font-size: 16px;
}

.vote-value {
  font-size: 24px;
  color: #2196f3;
}

.waiting-info {
  margin-bottom: 20px;
}

.vote-progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

.participant-status {
  text-align: left;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.participant-name {
  font-size: 13px;
  color: #333;
}

/* Results */
.results-section {
  padding: 10px 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h4 {
  margin: 0;
  font-size: 16px;
}

.round-badge {
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.suggested-points {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.suggested-points label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.suggested-value {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.consensus-indicator {
  display: inline-block;
  margin-top: 10px;
  color: #4caf50;
  font-size: 13px;
}

.no-consensus-indicator {
  display: inline-block;
  margin-top: 10px;
  color: #ff9800;
  font-size: 13px;
}

/* Distribution Chart */
.distribution-chart {
  margin-bottom: 20px;
}

.distribution-chart h5,
.individual-votes h5 {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin: 0 0 10px 0;
}

.dist-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.dist-label {
  width: 40px;
  font-weight: 600;
  font-size: 14px;
  text-align: right;
}

.dist-bar-bg {
  flex: 1;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  background: #2196f3;
  transition: width 0.3s ease;
}

.dist-count {
  width: 30px;
  font-weight: 600;
  font-size: 14px;
}

/* Individual Votes */
.individual-votes {
  margin-bottom: 20px;
}

.vote-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 6px;
}

.voter {
  font-size: 13px;
  color: #333;
}

.estimate {
  font-weight: 600;
  color: #2196f3;
}

/* Moderator Controls */
.moderator-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.finalize-group {
  margin-bottom: 15px;
}

.finalize-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
}

.input-group {
  display: flex;
}

.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-btn .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 240px 1fr 320px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
  
  .left-panel {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    max-height: 200px;
  }
  
  .story-list {
    display: flex;
    overflow-x: auto;
    padding: 10px;
    gap: 10px;
  }
  
  .story-list-item {
    flex-shrink: 0;
    width: 200px;
    margin-bottom: 0;
  }
  
  .right-panel {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
```

## Key Structural Changes

1. **Flexbox/Grid Layout**: Proper 3-column grid that doesn't break
2. **Overflow Handling**: Each panel scrolls independently
3. **Stable Heights**: Panels don't jump when content changes
4. **Status Indicators**: Visual badges and icons for story status
5. **Progress Bars**: Vote progress and timer progress
6. **Metadata Grid**: Structured layout for story fields
7. **Responsive**: Adapts to smaller screens
8. **Transitions**: Smooth hover and selection states
9. **Consistent Spacing**: Uniform padding and margins
10. **Clear Hierarchy**: Visual distinction between sections
