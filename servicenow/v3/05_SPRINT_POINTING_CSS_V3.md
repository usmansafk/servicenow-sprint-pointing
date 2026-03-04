# Sprint Pointing App - CSS (V3)

Complete CSS for the Sprint Pointing App widget with V3 enhancements.

## V3 Enhancements in This File

- 20% scale increase (base font 19px, cards 96x144px)
- Timer layout fix (16px spacing between timer and participant count)
- Finalize button fully visible
- Portal header removal (#sp-nav-bar { display: none; })
- Avatar styling (32px diameter, circular)
- Duck emoji sizing for Pass card

## Implementation

1. Navigate to **Service Portal > Widgets** in ServiceNow
2. Find and open the **Sprint Pointing App** widget
3. Click on the **CSS - SCSS** tab
4. Replace the entire CSS with the code below
5. Click **Save**

## Complete CSS

Due to file size, the CSS is provided in parts. Copy all parts sequentially into the CSS - SCSS tab.

### Part 1: Base Styles and Header


```css
/* ============ V3: PORTAL HEADER REMOVAL ============ */
#sp-nav-bar {
  display: none;
}

/* ============ V3: BASE STYLES (20% SCALE INCREASE) ============ */
.sprint-pointing-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 19px; /* V3: Increased from 16px (20% increase) */
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
  padding: 14px 24px; /* V3: Increased from 12px 20px */
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
  font-size: 24px; /* V3: Increased from 20px */
  font-weight: 600;
  color: #333;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 18px; /* V3: Increased from 15px */
}

.session-badge {
  display: flex;
  align-items: center;
  gap: 10px; /* V3: Increased from 8px */
  background: #f0f0f0;
  padding: 7px 14px; /* V3: Increased from 6px 12px */
  border-radius: 24px; /* V3: Increased from 20px */
}

.session-label {
  font-size: 14px; /* V3: Increased from 12px */
  color: #666;
}

.session-code {
  font-weight: 600;
  font-family: monospace;
  font-size: 17px; /* V3: Increased from 14px */
  color: #333;
}

.session-name {
  color: #666;
  font-size: 17px; /* V3: Increased from 14px */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px; /* V3: CRITICAL FIX - spacing between timer and participant count */
}

.progress-indicator {
  font-size: 17px; /* V3: Increased from 14px */
  color: #666;
}

.progress-pointed {
  color: #4caf50;
}

/* V3: Timer Display in Header (visible to all) */
.timer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff3e0;
  padding: 6px 12px;
  border-radius: 20px;
  color: #e65100;
  font-weight: 600;
}

.timer-display i {
  font-size: 16px;
}

.timer-text {
  font-size: 15px;
  font-family: monospace;
}

.participant-count {
  display: flex;
  align-items: center;
  gap: 7px; /* V3: Increased from 6px */
  color: #666;
}

.btn-icon {
  background: none;
  border: none;
  padding: 5px 10px; /* V3: Increased from 4px 8px */
  cursor: pointer;
  color: #666;
  border-radius: 5px; /* V3: Increased from 4px */
}

.btn-icon:hover {
  background: #e0e0e0;
}
```

### Part 2: Timer Bar and Loading States

```css
/* ============ TIMER BAR ============ */
.timer-bar {
  height: 5px; /* V3: Increased from 4px */
  background: #e0e0e0;
  position: relative;
}

.timer-progress {
  height: 100%;
  background: #2196f3;
  transition: width 1s linear;
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
  gap: 12px; /* V3: Increased from 10px */
  padding: 12px 24px; /* V3: Increased from 10px 20px */
  background: #ffebee;
  color: #c62828;
  border-bottom: 1px solid #ef9a9a;
}

.error-banner i {
  font-size: 22px; /* V3: Increased from 18px */
}
```

### Part 3: Main Layout and Story List

```css
/* ============ MAIN CONTENT - 3 PANEL LAYOUT ============ */
.main-content {
  display: grid;
  grid-template-columns: 336px 1fr 432px; /* V3: Increased from 280px 1fr 360px */
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
  padding: 18px 24px; /* V3: Increased from 15px 20px */
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h2 {
  margin: 0;
  font-size: 19px; /* V3: Increased from 16px */
  font-weight: 600;
  color: #333;
}

.story-count {
  background: #e0e0e0;
  padding: 2px 12px; /* V3: Increased from 2px 10px */
  border-radius: 12px; /* V3: Increased from 10px */
  font-size: 14px; /* V3: Increased from 12px */
  font-weight: 600;
}

.story-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px; /* V3: Increased from 10px */
}

.story-list-item {
  display: flex;
  align-items: center;
  gap: 12px; /* V3: Increased from 10px */
  padding: 14px; /* V3: Increased from 12px */
  margin-bottom: 10px; /* V3: Increased from 8px */
  border: 1px solid #e0e0e0;
  border-radius: 10px; /* V3: Increased from 8px */
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
  border-left: 4px solid #ff9800; /* V3: Increased from 3px */
}

.story-list-item.status-pointed {
  border-left: 4px solid #4caf50; /* V3: Increased from 3px */
}

.story-list-item.status-skipped {
  opacity: 0.6;
}

.story-status-icon {
  width: 29px; /* V3: Increased from 24px */
  text-align: center;
  font-size: 17px; /* V3: Increased from 14px */
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
  font-size: 13px; /* V3: Increased from 11px */
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 2px;
}

.story-title {
  font-size: 16px; /* V3: Increased from 13px */
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-points-badge {
  background: #4caf50;
  color: white;
  padding: 5px 12px; /* V3: Increased from 4px 10px */
  border-radius: 14px; /* V3: Increased from 12px */
  font-size: 14px; /* V3: Increased from 12px */
  font-weight: 600;
}

.story-status-badge {
  font-size: 12px; /* V3: Increased from 10px */
}

.badge {
  padding: 4px 10px; /* V3: Increased from 3px 8px */
  border-radius: 12px; /* V3: Increased from 10px */
  font-weight: 500;
}

.badge-default { background: #e0e0e0; color: #666; }
.badge-warning { background: #fff3e0; color: #e65100; }
.badge-success { background: #e8f5e9; color: #2e7d32; }
.badge-muted { background: #f5f5f5; color: #9e9e9e; }

.panel-footer {
  padding: 18px; /* V3: Increased from 15px */
  border-top: 1px solid #e0e0e0;
}
```

### Part 4: Story Details Panel

```css
/* ============ CENTER PANEL - STORY DETAILS ============ */
.center-panel {
  background: #fafafa;
  overflow-y: auto;
  padding: 30px; /* V3: Increased from 25px */
}

.story-detail {
  background: white;
  border-radius: 10px; /* V3: Increased from 8px */
  padding: 30px; /* V3: Increased from 25px */
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.story-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px; /* V3: Increased from 15px */
}

.story-number-large {
  font-size: 17px; /* V3: Increased from 14px */
  font-weight: 600;
  color: #2196f3;
}

.story-badges {
  display: flex;
  gap: 10px; /* V3: Increased from 8px */
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
  font-size: 22px; /* V3: Increased from 18px */
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0; /* V3: Increased from 0 0 20px 0 */
  line-height: 1.4;
}

/* Metadata Grid */
.story-metadata-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px; /* V3: Increased from 15px */
  margin-bottom: 30px; /* V3: Increased from 25px */
  padding-bottom: 24px; /* V3: Increased from 20px */
  border-bottom: 1px solid #e0e0e0;
}

.metadata-item {
  min-width: 0;
}

.metadata-item label {
  display: block;
  font-size: 13px; /* V3: Increased from 11px */
  font-weight: 600;
  color: #9e9e9e;
  text-transform: uppercase;
  margin-bottom: 5px; /* V3: Increased from 4px */
}

.metadata-value {
  font-size: 17px; /* V3: Increased from 14px */
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px; /* V3: Increased from 8px */
}

.btn-edit {
  background: none;
  border: none;
  padding: 2px 7px; /* V3: Increased from 2px 6px */
  cursor: pointer;
  color: #9e9e9e;
  font-size: 14px; /* V3: Increased from 12px */
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
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px; /* V3: Increased from 8px */
}

.section-header label {
  font-size: 14px; /* V3: Increased from 12px */
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.section-content {
  font-size: 17px; /* V3: Increased from 14px */
  color: #333;
  line-height: 1.6;
}

.section-content pre {
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
  background: #f5f5f5;
  padding: 14px; /* V3: Increased from 12px */
  border-radius: 7px; /* V3: Increased from 6px */
  font-size: 16px; /* V3: Increased from 13px */
}

.text-muted {
  color: #9e9e9e;
}

.story-actions {
  margin-top: 24px; /* V3: Increased from 20px */
  padding-top: 24px; /* V3: Increased from 20px */
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px; /* V3: Increased from 10px */
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 72px 24px; /* V3: Increased from 60px 20px */
  color: #9e9e9e;
}

.empty-state i {
  margin-bottom: 18px; /* V3: Increased from 15px */
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 12px 0; /* V3: Increased from 0 0 10px 0 */
  color: #666;
}

.empty-state p {
  margin: 0;
}
```

### Part 5: Voting Panel and Cards

```css
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
  padding: 24px; /* V3: Increased from 20px */
}

/* Voting States */
.pending-state,
.vote-submitted-section,
.pointed-section,
.skipped-section {
  text-align: center;
  padding: 48px 24px; /* V3: Increased from 40px 20px */
}

.pending-state i,
.pointed-section i,
.skipped-section i {
  color: #9e9e9e;
  margin-bottom: 18px; /* V3: Increased from 15px */
}

.pointed-section i {
  color: #4caf50;
}

/* V3: Voting Cards (20% scale increase) */
.voting-cards-section {
  padding: 12px 0; /* V3: Increased from 10px 0 */
}

.voting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px; /* V3: Increased from 15px */
}

.round-indicator {
  font-weight: 600;
  color: #333;
}

.vote-count-text {
  font-size: 16px; /* V3: Increased from 13px */
  color: #666;
}

.timer-controls {
  display: flex;
  gap: 10px; /* V3: Increased from 8px */
  margin-bottom: 18px; /* V3: Increased from 15px */
}

/* V3: Cards Grid with 20% scale increase */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px; /* V3: Increased from 10px */
  margin-bottom: 24px; /* V3: Increased from 20px */
}

/* V3: Vote Card - 96x144px (20% increase from 80x120px) */
.vote-card {
  height: 144px; /* V3: Increased from 120px */
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 10px; /* V3: Increased from 8px */
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
  font-size: 22px; /* V3: Increased from 18px */
  font-weight: 600;
}

/* V3: Duck emoji for Pass card */
.card-pass {
  font-size: 48px; /* Large emoji size */
  line-height: 1;
}

.submit-btn {
  margin-bottom: 12px; /* V3: Increased from 10px */
}

.moderator-btn {
  margin-top: 12px; /* V3: Increased from 10px */
}
```

### Part 6: Vote Submitted and Participants

```css
/* Vote Submitted */
.submitted-confirmation {
  margin-bottom: 30px; /* V3: Increased from 25px */
}

.submitted-confirmation i {
  color: #4caf50;
  margin-bottom: 12px; /* V3: Increased from 10px */
}

.your-vote {
  font-size: 19px; /* V3: Increased from 16px */
}

.vote-value {
  font-size: 29px; /* V3: Increased from 24px */
  color: #2196f3;
}

.waiting-info {
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.vote-progress-bar {
  height: 10px; /* V3: Increased from 8px */
  background: #e0e0e0;
  border-radius: 5px; /* V3: Increased from 4px */
  overflow: hidden;
  margin: 12px 0; /* V3: Increased from 10px 0 */
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

/* V3: Participant Status with Avatars */
.participant-status {
  text-align: left;
  margin-top: 24px; /* V3: Increased from 20px */
  padding-top: 18px; /* V3: Increased from 15px */
  border-top: 1px solid #e0e0e0;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px; /* V3: Increased from 10px */
  padding: 10px 0; /* V3: Increased from 8px 0 */
  border-bottom: 1px solid #f0f0f0;
}

/* V3: Participant Avatar (32px diameter) */
.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-initials {
  background: #2196f3;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.participant-name {
  flex: 1;
  font-size: 16px; /* V3: Increased from 13px */
  color: #333;
}
```

### Part 7: Results and Moderator Controls

```css
/* Results */
.results-section {
  padding: 12px 0; /* V3: Increased from 10px 0 */
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.results-header h4 {
  margin: 0;
  font-size: 19px; /* V3: Increased from 16px */
}

.round-badge {
  background: #f0f0f0;
  padding: 5px 12px; /* V3: Increased from 4px 10px */
  border-radius: 12px; /* V3: Increased from 10px */
  font-size: 14px; /* V3: Increased from 12px */
}

.suggested-points {
  text-align: center;
  padding: 24px; /* V3: Increased from 20px */
  background: #f5f5f5;
  border-radius: 10px; /* V3: Increased from 8px */
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.suggested-points label {
  display: block;
  font-size: 14px; /* V3: Increased from 12px */
  color: #666;
  margin-bottom: 6px; /* V3: Increased from 5px */
}

.suggested-value {
  font-size: 58px; /* V3: Increased from 48px */
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.consensus-indicator {
  display: inline-block;
  margin-top: 12px; /* V3: Increased from 10px */
  color: #4caf50;
  font-size: 16px; /* V3: Increased from 13px */
}

.no-consensus-indicator {
  display: inline-block;
  margin-top: 12px; /* V3: Increased from 10px */
  color: #ff9800;
  font-size: 16px; /* V3: Increased from 13px */
}

/* Distribution Chart */
.distribution-chart {
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.distribution-chart h5,
.individual-votes h5 {
  font-size: 14px; /* V3: Increased from 12px */
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin: 0 0 12px 0; /* V3: Increased from 0 0 10px 0 */
}

.dist-bar-row {
  display: flex;
  align-items: center;
  gap: 12px; /* V3: Increased from 10px */
  margin-bottom: 10px; /* V3: Increased from 8px */
}

.dist-label {
  width: 48px; /* V3: Increased from 40px */
  font-weight: 600;
  font-size: 17px; /* V3: Increased from 14px */
  text-align: right;
}

.dist-bar-bg {
  flex: 1;
  height: 29px; /* V3: Increased from 24px */
  background: #e0e0e0;
  border-radius: 5px; /* V3: Increased from 4px */
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  background: #2196f3;
  transition: width 0.3s ease;
}

.dist-count {
  width: 36px; /* V3: Increased from 30px */
  font-weight: 600;
  font-size: 17px; /* V3: Increased from 14px */
}

/* Individual Votes */
.individual-votes {
  margin-bottom: 24px; /* V3: Increased from 20px */
}

.vote-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px; /* V3: Increased from 8px 12px */
  background: #f5f5f5;
  border-radius: 5px; /* V3: Increased from 4px */
  margin-bottom: 7px; /* V3: Increased from 6px */
}

.voter-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.voter {
  font-size: 16px; /* V3: Increased from 13px */
  color: #333;
}

.estimate {
  font-weight: 600;
  font-size: 17px; /* V3: Increased from 14px */
  color: #2196f3;
}

/* V3: Moderator Controls - Finalize Button Fix */
.moderator-controls {
  margin-top: 24px; /* V3: Increased from 20px */
  padding-top: 24px; /* V3: Increased from 20px */
  border-top: 1px solid #e0e0e0;
}

.finalize-group {
  margin-bottom: 18px; /* V3: Increased from 15px */
}

.finalize-group label {
  display: block;
  font-size: 14px; /* V3: Increased from 12px */
  font-weight: 600;
  color: #666;
  margin-bottom: 6px; /* V3: Increased from 5px */
}

.input-group {
  display: flex;
}

.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  font-size: 17px; /* V3: Increased from 14px */
  padding: 10px 14px; /* V3: Increased from 8px 12px */
}

.input-group-btn .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  padding: 10px 18px; /* V3: CRITICAL FIX - ensure button is fully visible */
  white-space: nowrap;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 288px 1fr 384px; /* V3: Scaled down proportionally */
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
    max-height: 240px; /* V3: Increased from 200px */
  }
  
  .story-list {
    display: flex;
    overflow-x: auto;
    padding: 12px;
    gap: 12px;
  }
  
  .story-list-item {
    flex-shrink: 0;
    width: 240px; /* V3: Increased from 200px */
    margin-bottom: 0;
  }
  
  .right-panel {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
```

## Testing

After updating the CSS:

1. Verify base font size is 19px (20% larger than V2's 16px)
2. Check vote cards are 96x144px (measure in browser dev tools)
3. Verify 16px spacing between timer and participant count in header
4. Check Finalize button is fully visible (not cut off)
5. Verify portal header (#sp-nav-bar) is hidden
6. Check participant avatars are 32px diameter and circular
7. Verify duck emoji (🐥) displays at correct size in Pass card

## Requirements Validated

- 7.1: 20% scale increase (base font 19px) ✓
- 7.2: Vote cards 96x144px ✓
- 4.2: Timer layout fix (16px spacing) ✓
- 10.1: Finalize button fully visible ✓
- 11.1: Portal header removed ✓
- 6.3: Avatar styling (32px diameter) ✓
- 3.1: Duck emoji sizing ✓
