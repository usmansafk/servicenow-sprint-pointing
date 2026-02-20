# Step 6: Create the User Interface

Now we'll build the Service Portal page and widget with the 3-panel layout.

---

## Part A: Create Service Portal Page

### 1. Create the Portal Page

1. In Studio, click **Create Application File**
2. Filter by: **Service Portal**
3. Select: **Page**
4. Fill in:
   - **Page ID**: sprint_pointing
   - **Title**: Sprint Pointing
   - **Description**: Planning poker for sprint refinement
5. Click **Create**

### 2. Configure the Page

1. After creation, you'll see the page designer
2. In the **Page Properties** (right side):
   - **Layout**: Select `fluid` (full width)
3. Click **Save**

---

## Part B: Create the Main Widget

### 1. Create Widget

1. In Studio, click **Create Application File**
2. Select: **Widget**
3. Fill in:
   - **Widget Name**: Sprint Pointing App
   - **Widget ID**: sprint_pointing_app
   - **Description**: Main application widget for planning poker
4. Click **Create**

### 2. Add Widget to Page

1. Go back to your **sprint_pointing** page
2. In the page designer, click **Add Container**
3. Inside the container, click **Add Widget**
4. Search for: **Sprint Pointing App**
5. Add it to the page
6. Click **Save**

---

## Part C: Build the Widget

Now we'll add the HTML, CSS, Client Script, and Server Script.

### 1. HTML Template

In your widget, find the **HTML Template** section and replace with:

```html
<div class="sprint-pointing-container">
  <!-- Header -->
  <div class="sp-header">
    <h2>Sprint Pointing</h2>
    <div class="session-info" ng-if="c.sessionData">
      <span class="session-code">Session: {{c.sessionData.session_code}}</span>
      <span class="session-name">{{c.sessionData.session_name}}</span>
    </div>
  </div>

  <!-- Loading State -->
  <div ng-if="c.loading" class="loading-state">
    <i class="fa fa-spinner fa-spin fa-3x"></i>
    <p>Loading session...</p>
  </div>

  <!-- Error State -->
  <div ng-if="c.error" class="error-state">
    <i class="fa fa-exclamation-triangle fa-3x"></i>
    <p>{{c.error}}</p>
  </div>

  <!-- Main Content: 3-Panel Layout -->
  <div ng-if="!c.loading && !c.error && c.sessionData" class="three-panel-layout">
    
    <!-- LEFT PANEL: Story List -->
    <div class="left-panel">
      <h3>Stories ({{c.sessionData.stories.length}})</h3>
      <div class="story-list">
        <div ng-repeat="story in c.sessionData.stories" 
             class="story-item"
             ng-class="{'active': story.status === 'voting', 'completed': story.status === 'pointed'}"
             ng-click="c.selectStory(story)">
          <div class="story-status">
            <i ng-if="story.status === 'pointed'" class="fa fa-check-circle text-success"></i>
            <i ng-if="story.status === 'voting'" class="fa fa-arrow-right text-warning"></i>
            <i ng-if="story.status === 'pending'" class="fa fa-circle-o text-muted"></i>
            <i ng-if="story.status === 'skipped'" class="fa fa-ban text-muted"></i>
          </div>
          <div class="story-info">
            <div class="story-number">{{story.number}}</div>
            <div class="story-title">{{story.short_description}}</div>
            <div ng-if="story.final_points" class="story-points">{{story.final_points}} pts</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CENTER PANEL: Story Details -->
    <div class="center-panel">
      <div ng-if="c.currentStory">
        <div class="story-header">
          <h3>{{c.currentStory.number}}</h3>
          <span class="story-state-badge">{{c.currentStory.state}}</span>
        </div>
        <h4>{{c.currentStory.short_description}}</h4>
        
        <div class="story-section">
          <label>Description:</label>
          <p>{{c.currentStory.description || 'No description'}}</p>
        </div>

        <div class="story-section">
          <label>Acceptance Criteria:</label>
          <p class="pre-wrap">{{c.currentStory.acceptance_criteria || 'No acceptance criteria'}}</p>
        </div>

        <div class="story-meta">
          <div><strong>Assigned to:</strong> {{c.currentStory.assigned_to || 'Unassigned'}}</div>
          <div><strong>Current Points:</strong> {{c.currentStory.current_points || 'Not pointed'}}</div>
        </div>
      </div>
      <div ng-if="!c.currentStory" class="no-story-selected">
        <i class="fa fa-hand-pointer-o fa-3x"></i>
        <p>Select a story from the left to begin</p>
      </div>
    </div>

    <!-- RIGHT PANEL: Voting Area -->
    <div class="right-panel">
      <div ng-if="c.currentStory">
        
        <!-- Voting Status -->
        <div class="voting-status">
          <div ng-if="c.currentStory.voting_state === 'open'">
            <h4>Round {{c.currentStory.round}}</h4>
            <p class="vote-count">{{c.currentStory.votes_count || 0}} votes submitted</p>
          </div>
          <div ng-if="c.currentStory.voting_state === 'revealed'">
            <h4>Results - Round {{c.currentStory.round}}</h4>
          </div>
        </div>

        <!-- Voting Cards (when voting is open) -->
        <div ng-if="c.currentStory.voting_state === 'open' && !c.userVoted" class="voting-cards">
          <div class="cards-grid">
            <div ng-repeat="card in c.cardValues" 
                 class="vote-card"
                 ng-class="{'selected': c.selectedCard === card}"
                 ng-click="c.selectCard(card)">
              <span class="card-value">{{card}}</span>
            </div>
          </div>
          <button ng-if="c.selectedCard" 
                  class="btn btn-primary btn-block submit-vote-btn"
                  ng-click="c.submitVote()">
            Submit Vote
          </button>
        </div>

        <!-- Vote Submitted Message -->
        <div ng-if="c.userVoted && c.currentStory.voting_state === 'open'" class="vote-submitted">
          <i class="fa fa-check-circle fa-3x text-success"></i>
          <p>Your vote: <strong>{{c.selectedCard}}</strong></p>
          <p class="text-muted">Waiting for others...</p>
        </div>

        <!-- Results (when revealed) -->
        <div ng-if="c.voteResults && c.currentStory.voting_state === 'revealed'" class="vote-results">
          <div class="results-summary">
            <div class="suggested-points">
              <label>Suggested Points:</label>
              <h2>{{c.voteResults.suggested_points}}</h2>
              <span ng-if="c.voteResults.has_consensus" class="consensus-badge">
                <i class="fa fa-check"></i> Consensus
              </span>
            </div>
          </div>

          <div class="votes-list">
            <h5>Individual Votes:</h5>
            <div ng-repeat="vote in c.voteResults.votes" class="vote-item">
              <span class="voter-name">{{vote.voter_name}}</span>
              <span class="vote-value">{{vote.estimate}}</span>
            </div>
          </div>

          <div class="distribution">
            <h5>Distribution:</h5>
            <div ng-repeat="(value, count) in c.voteResults.distribution" class="dist-item">
              <span class="dist-value">{{value}}</span>
              <div class="dist-bar" style="width: {{(count / c.voteResults.votes.length * 100)}}%"></div>
              <span class="dist-count">{{count}}</span>
            </div>
          </div>
        </div>

        <!-- Moderator Controls -->
        <div ng-if="c.sessionData.is_moderator" class="moderator-controls">
          <h5>Moderator Controls</h5>
          
          <button ng-if="c.currentStory.voting_state === 'open'" 
                  class="btn btn-warning btn-block"
                  ng-click="c.revealVotes()">
            <i class="fa fa-eye"></i> Stop & Reveal Votes
          </button>

          <div ng-if="c.currentStory.voting_state === 'revealed'">
            <div class="form-group">
              <label>Final Points:</label>
              <input type="number" 
                     class="form-control" 
                     ng-model="c.finalPoints"
                     placeholder="Enter points">
            </div>
            <button class="btn btn-success btn-block"
                    ng-click="c.finalizePoints()"
                    ng-disabled="!c.finalPoints">
              <i class="fa fa-check"></i> Finalize Points
            </button>
            <button class="btn btn-default btn-block"
                    ng-click="c.newRound()">
              <i class="fa fa-refresh"></i> New Round
            </button>
          </div>

          <button ng-if="c.currentStory.status === 'pointed'" 
                  class="btn btn-primary btn-block"
                  ng-click="c.nextStory()">
            <i class="fa fa-arrow-right"></i> Next Story
          </button>
        </div>

      </div>
    </div>

  </div>
</div>
```

---

### 2. CSS / SCSS

Find the **CSS** section and replace with:

```css
.sprint-pointing-container {
  padding: 20px;
  background: #f4f6f9;
  min-height: 100vh;
}

.sp-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sp-header h2 {
  margin: 0;
  color: #2c3e50;
}

.session-info {
  display: flex;
  gap: 20px;
}

.session-code {
  background: #3498db;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.session-name {
  color: #7f8c8d;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.error-state {
  color: #e74c3c;
}

/* Three Panel Layout */
.three-panel-layout {
  display: grid;
  grid-template-columns: 300px 1fr 400px;
  gap: 20px;
  min-height: 600px;
}

/* LEFT PANEL */
.left-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  max-height: 80vh;
}

.left-panel h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.story-list {
  margin-top: 15px;
}

.story-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  margin-bottom: 10px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.story-item:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.story-item.active {
  border-color: #f39c12;
  background: #fff3cd;
}

.story-item.completed {
  border-color: #27ae60;
  background: #d4edda;
}

.story-status {
  font-size: 20px;
  display: flex;
  align-items: center;
}

.story-info {
  flex: 1;
}

.story-number {
  font-weight: bold;
  color: #3498db;
  font-size: 12px;
}

.story-title {
  font-size: 14px;
  color: #2c3e50;
  margin-top: 4px;
}

.story-points {
  font-size: 12px;
  color: #27ae60;
  font-weight: bold;
  margin-top: 4px;
}

/* CENTER PANEL */
.center-panel {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  max-height: 80vh;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.story-header h3 {
  margin: 0;
  color: #3498db;
}

.story-state-badge {
  background: #95a5a6;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
}

.center-panel h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.story-section {
  margin-bottom: 25px;
}

.story-section label {
  font-weight: bold;
  color: #7f8c8d;
  display: block;
  margin-bottom: 8px;
}

.story-section p {
  color: #2c3e50;
  line-height: 1.6;
}

.pre-wrap {
  white-space: pre-wrap;
}

.story-meta {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.no-story-selected {
  text-align: center;
  padding: 80px 20px;
  color: #95a5a6;
}

/* RIGHT PANEL */
.right-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  max-height: 80vh;
}

.voting-status {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.voting-status h4 {
  margin: 0;
  color: #2c3e50;
}

.vote-count {
  color: #7f8c8d;
  margin: 5px 0 0 0;
}

/* Voting Cards */
.voting-cards {
  margin-top: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.vote-card {
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.vote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.vote-card.selected {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: white;
}

.submit-vote-btn {
  margin-top: 15px;
  font-size: 16px;
  padding: 12px;
}

/* Vote Submitted */
.vote-submitted {
  text-align: center;
  padding: 40px 20px;
}

.vote-submitted p {
  margin-top: 15px;
  font-size: 16px;
}

/* Results */
.vote-results {
  margin-top: 20px;
}

.results-summary {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.suggested-points h2 {
  font-size: 48px;
  color: #3498db;
  margin: 10px 0;
}

.consensus-badge {
  background: #27ae60;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
}

.votes-list, .distribution {
  margin-top: 20px;
}

.votes-list h5, .distribution h5 {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.vote-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 5px;
}

.voter-name {
  color: #2c3e50;
}

.vote-value {
  font-weight: bold;
  color: #3498db;
}

.dist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.dist-value {
  width: 40px;
  font-weight: bold;
  color: #2c3e50;
}

.dist-bar {
  height: 24px;
  background: #3498db;
  border-radius: 4px;
  min-width: 20px;
}

.dist-count {
  font-weight: bold;
  color: #7f8c8d;
}

/* Moderator Controls */
.moderator-controls {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #ecf0f1;
}

.moderator-controls h5 {
  color: #7f8c8d;
  margin-bottom: 15px;
}

.moderator-controls .btn {
  margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 1200px) {
  .three-panel-layout {
    grid-template-columns: 250px 1fr 350px;
  }
}

@media (max-width: 992px) {
  .three-panel-layout {
    grid-template-columns: 1fr;
  }
  
  .left-panel, .center-panel, .right-panel {
    max-height: none;
  }
}
```

---

## Next Step

Continue to: `07_CREATE_UI_SCRIPTS.md` for the Client Script and Server Script
