# Session Creator - Sprint Selection UI

## Overview

Create a user-friendly session creation page where users:
1. Enter a session name
2. Select a sprint from dropdown
3. Stories auto-populate from that sprint
4. Click "Create Session" to start

---

## Part 1: Create Session Creator Widget

### Step 1: Create the Widget

1. In Studio, click **Create Application File**
2. Select: **Widget**
3. Fill in:
   - **Widget Name**: Session Creator
   - **Widget ID**: session_creator
   - **Description**: Create new sprint pointing sessions
4. Click **Create**

---

### Step 2: HTML Template

Replace the HTML with:

```html
<div class="session-creator-container">
  <div class="creator-header">
    <h1>Create Sprint Pointing Session</h1>
    <p>Select a sprint to start a new refinement session</p>
  </div>
  
  <!-- Step 1: Session Name -->
  <div class="form-section">
    <label class="form-label">Session Name</label>
    <input type="text" 
           class="form-control form-control-lg" 
           ng-model="c.sessionName"
           placeholder="e.g., Sprint 24.2 Refinement"
           ng-disabled="c.loading">
  </div>
  
  <!-- Step 2: Sprint Selection -->
  <div class="form-section">
    <label class="form-label">Select Sprint</label>
    <select class="form-control form-control-lg" 
            ng-model="c.selectedSprint"
            ng-change="c.onSprintSelected()"
            ng-disabled="c.loading || c.sprints.length === 0">
      <option value="">-- Choose a Sprint --</option>
      <option ng-repeat="sprint in c.sprints" 
              value="{{sprint.sys_id}}">
        {{sprint.name}} ({{sprint.state}})
      </option>
    </select>
    
    <div ng-if="c.loadingSprints" class="loading-message">
      <i class="fa fa-spinner fa-spin"></i> Loading sprints...
    </div>
    
    <div ng-if="!c.loadingSprints && c.sprints.length === 0" class="info-message">
      <i class="fa fa-info-circle"></i> No active sprints found. Create a sprint first.
    </div>
  </div>
  
  <!-- Step 3: Stories Preview -->
  <div class="form-section" ng-if="c.stories.length > 0">
    <label class="form-label">
      Stories in Sprint ({{c.stories.length}})
    </label>
    
    <div class="stories-preview">
      <div ng-repeat="story in c.stories | limitTo:10" class="story-preview-item">
        <span class="story-number">{{story.number}}</span>
        <span class="story-title">{{story.short_description}}</span>
        <span class="story-points" ng-if="story.story_points">
          {{story.story_points}} pts
        </span>
      </div>
      <div ng-if="c.stories.length > 10" class="more-stories">
        + {{c.stories.length - 10}} more stories
      </div>
    </div>
  </div>
  
  <!-- Loading Stories -->
  <div class="form-section" ng-if="c.loadingStories">
    <div class="loading-message">
      <i class="fa fa-spinner fa-spin"></i> Loading stories from sprint...
    </div>
  </div>
  
  <!-- Create Button -->
  <div class="form-actions">
    <button class="btn btn-primary btn-lg btn-block"
            ng-click="c.createSession()"
            ng-disabled="!c.canCreate()">
      <i class="fa fa-plus-circle"></i> Create Session
    </button>
  </div>
  
  <!-- Success State -->
  <div ng-if="c.createdSession" class="success-panel">
    <div class="success-icon">
      <i class="fa fa-check-circle fa-4x"></i>
    </div>
    <h2>Session Created!</h2>
    
    <div class="session-details">
      <div class="detail-row">
        <label>Session Code:</label>
        <div class="session-code-display">
          <span class="code">{{c.createdSession.session_code}}</span>
          <button class="btn btn-sm btn-default" 
                  ng-click="c.copyCode()"
                  title="Copy code">
            <i class="fa fa-copy"></i>
          </button>
        </div>
      </div>
      
      <div class="detail-row">
        <label>Share this link:</label>
        <div class="share-link">
          <input type="text" 
                 class="form-control" 
                 value="{{c.sessionUrl}}"
                 readonly
                 ng-click="$event.target.select()">
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <a ng-href="{{c.sessionUrl}}" 
         class="btn btn-success btn-lg"
         target="_blank">
        <i class="fa fa-arrow-right"></i> Open Session
      </a>
      
      <button class="btn btn-default btn-lg"
              ng-click="c.reset()">
        <i class="fa fa-plus"></i> Create Another
      </button>
    </div>
  </div>
  
  <!-- Error State -->
  <div ng-if="c.error" class="error-panel">
    <i class="fa fa-exclamation-triangle"></i>
    <p>{{c.error}}</p>
    <button class="btn btn-default" ng-click="c.dismissError()">
      Dismiss
    </button>
  </div>
</div>
```

---

### Step 3: CSS

```css
.session-creator-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.creator-header {
  text-align: center;
  margin-bottom: 40px;
}

.creator-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.creator-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.form-section {
  margin-bottom: 30px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-control-lg {
  font-size: 16px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.form-control-lg:focus {
  border-color: #2196f3;
  outline: none;
}

.loading-message,
.info-message {
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-top: 10px;
  color: #666;
}

.loading-message i,
.info-message i {
  margin-right: 8px;
}

.stories-preview {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.story-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.story-preview-item:last-child {
  border-bottom: none;
}

.story-number {
  font-size: 12px;
  font-weight: 600;
  color: #2196f3;
  min-width: 100px;
}

.story-title {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.story-points {
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
  background: #e8f5e9;
  padding: 4px 10px;
  border-radius: 12px;
}

.more-stories {
  padding: 12px 16px;
  text-align: center;
  color: #666;
  font-size: 13px;
  background: #f5f5f5;
}

.form-actions {
  margin-top: 40px;
}

.btn-block {
  width: 100%;
}

/* Success Panel */
.success-panel {
  text-align: center;
  padding: 40px 20px;
  background: #f0f9ff;
  border-radius: 12px;
  margin-top: 30px;
}

.success-icon {
  color: #4caf50;
  margin-bottom: 20px;
}

.success-panel h2 {
  margin: 0 0 30px 0;
  color: #333;
}

.session-details {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.session-code-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-code-display .code {
  font-family: monospace;
  font-size: 24px;
  font-weight: 700;
  color: #2196f3;
  background: #e3f2fd;
  padding: 8px 16px;
  border-radius: 6px;
  flex: 1;
}

.share-link input {
  font-size: 14px;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.action-buttons .btn {
  flex: 1;
}

/* Error Panel */
.error-panel {
  padding: 20px;
  background: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  color: #c62828;
}

.error-panel i {
  font-size: 24px;
  margin-bottom: 10px;
}

.error-panel p {
  margin: 10px 0;
}
```

---

### Step 4: Client Controller

```javascript
function($scope, $http) {
  var c = this;
  
  // Configuration
  c.apiBase = '/api/x_1326913_sp_point/sprint_pointing_api';
  
  // State
  c.sessionName = '';
  c.selectedSprint = '';
  c.sprints = [];
  c.stories = [];
  c.createdSession = null;
  c.sessionUrl = '';
  c.loading = false;
  c.loadingSprints = false;
  c.loadingStories = false;
  c.error = null;
  
  // Initialize
  c.init = function() {
    c.loadSprints();
  };
  
  // Load available sprints
  c.loadSprints = function() {
    c.loadingSprints = true;
    
    $http.get(c.apiBase + '/sprints')
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.sprints = response.data.result.sprints;
        } else {
          c.error = 'Failed to load sprints';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to connect to server';
      })
      .finally(function() {
        c.loadingSprints = false;
      });
  };
  
  // When sprint is selected, load its stories
  c.onSprintSelected = function() {
    if (!c.selectedSprint) {
      c.stories = [];
      return;
    }
    
    c.loadingStories = true;
    c.stories = [];
    
    $http.get(c.apiBase + '/sprint/' + c.selectedSprint + '/stories')
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.stories = response.data.result.stories;
          
          // Auto-generate session name if empty
          if (!c.sessionName) {
            var sprint = c.sprints.find(function(s) { 
              return s.sys_id === c.selectedSprint; 
            });
            if (sprint) {
              c.sessionName = sprint.name + ' Refinement';
            }
          }
        } else {
          c.error = 'Failed to load stories';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to load stories';
      })
      .finally(function() {
        c.loadingStories = false;
      });
  };
  
  // Check if can create session
  c.canCreate = function() {
    return c.sessionName && 
           c.selectedSprint && 
           c.stories.length > 0 && 
           !c.loading &&
           !c.createdSession;
  };
  
  // Create session
  c.createSession = function() {
    if (!c.canCreate()) return;
    
    c.loading = true;
    c.error = null;
    
    // Extract story sys_ids
    var storyIds = c.stories.map(function(s) { return s.sys_id; });
    
    var sessionData = {
      session_name: c.sessionName,
      story_ids: storyIds,
      sprint_id: c.selectedSprint
    };
    
    $http.post(c.apiBase + '/session/create', sessionData)
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.createdSession = response.data.result;
          c.sessionUrl = window.location.origin + 
                         '/sp?id=sprint_pointing&session=' + 
                         c.createdSession.session_code;
        } else {
          c.error = response.data.result?.error || 'Failed to create session';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to create session';
      })
      .finally(function() {
        c.loading = false;
      });
  };
  
  // Copy session code to clipboard
  c.copyCode = function() {
    if (c.createdSession) {
      navigator.clipboard.writeText(c.createdSession.session_code);
      // TODO: Show toast notification
    }
  };
  
  // Reset form
  c.reset = function() {
    c.sessionName = '';
    c.selectedSprint = '';
    c.stories = [];
    c.createdSession = null;
    c.sessionUrl = '';
    c.error = null;
  };
  
  // Dismiss error
  c.dismissError = function() {
    c.error = null;
  };
  
  // Start
  c.init();
}
```

---

### Step 5: Server Script

```javascript
(function() {
  // No server-side logic needed for this widget
  // All API calls go directly to REST endpoints
})();
```

---

## Part 2: Create Service Portal Page

### Step 1: Create Page

1. In Studio, click **Create Application File**
2. Select: **Page**
3. Fill in:
   - **Page ID**: create_session
   - **Title**: Create Sprint Pointing Session
   - **Description**: Session creation page
4. Click **Create**

### Step 2: Add Widget to Page

1. In the page designer, click **Add Container**
2. Click **Add Widget** inside the container
3. Search for: **Session Creator**
4. Add it to the page
5. Click **Save**

---

## Part 3: Create ServiceNow Module

### Step 1: Create Module

1. In Studio, click **Create Application File**
2. Filter by: **User Interface**
3. Select: **Module**
4. Fill in:
   - **Title**: Create Session
   - **Application Menu**: Sprint Pointing (select existing)
   - **Order**: 100
   - **Link type**: URL (from arguments)
   - **Arguments**: `$sp.do?id=create_session`
5. Click **Create**

### Step 2: Create Additional Modules

Create these modules for easy access:

#### Module 2: View Sessions
- **Title**: Sessions
- **Application Menu**: Sprint Pointing
- **Order**: 200
- **Link type**: List of Records
- **Table**: Refinement Session [x_1326913_sp_point_refinement_session]

#### Module 3: View Session Stories
- **Title**: Session Stories
- **Application Menu**: Sprint Pointing
- **Order**: 300
- **Link type**: List of Records
- **Table**: Session Story [x_1326913_sp_point_session_story]

#### Module 4: View Votes
- **Title**: Votes
- **Application Menu**: Sprint Pointing
- **Order**: 400
- **Link type**: List of Records
- **Table**: Vote [x_1326913_sp_point_vote]

---

## End-to-End Process

### For Moderator (Creating Session):

1. **Navigate**: Go to **Sprint Pointing > Create Session** in ServiceNow left nav
2. **Enter Name**: Type session name (e.g., "Sprint 24.2 Refinement")
3. **Select Sprint**: Choose sprint from dropdown
4. **Review Stories**: See all stories from that sprint auto-populate
5. **Create**: Click "Create Session" button
6. **Share**: Copy session code or share link with team
7. **Open**: Click "Open Session" to start

### For Participants (Joining Session):

1. **Receive Link**: Get link from moderator
2. **Open**: Click link to open session
3. **View Stories**: See story list on left
4. **Wait**: Moderator starts voting on first story
5. **Vote**: Select card and submit vote
6. **Wait for Reveal**: See results when moderator reveals
7. **Repeat**: Continue for each story

### For Moderator (Running Session):

1. **Select Story**: Click story from left panel
2. **Start Voting**: Click "Start Voting" button
3. **Monitor**: Watch vote count (X of Y voted)
4. **Reveal**: Click "Stop & Reveal" when ready
5. **Review Results**: See vote distribution and suggested points
6. **Finalize**: Enter final points and click "Finalize Points"
7. **Next Story**: Click "Next Story" to continue
8. **Repeat**: Until all stories are pointed

---

## Testing the Complete Flow

1. **Create Session**:
   - Go to Sprint Pointing > Create Session
   - Select a sprint with stories
   - Create session
   - Copy session code

2. **Open Session** (as moderator):
   - Click "Open Session" or use URL
   - Verify stories loaded
   - Verify you see moderator controls

3. **Join Session** (as participant):
   - Open in incognito/different browser
   - Use same session URL
   - Verify you see participant view

4. **Run Full Voting Cycle**:
   - Moderator: Start voting
   - Participant: Submit vote
   - Moderator: Reveal votes
   - Moderator: Finalize points
   - Verify story updated in ServiceNow
   - Moderator: Next story

---

## Next Steps

After implementing this:
1. Test session creation with your test sprints
2. Verify stories auto-populate
3. Test full voting flow
4. Check that points write back to stories
5. Verify modules appear in left nav
