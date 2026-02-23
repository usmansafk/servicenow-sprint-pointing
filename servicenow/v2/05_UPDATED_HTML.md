# Updated HTML Template (v2)

Replace your widget's HTML Template with this complete version:

```html
<div class="sprint-pointing-app">
  
  <!-- ============ HEADER ============ -->
  <header class="app-header">
    <div class="header-left">
      <h1 class="app-title">Sprint Pointing</h1>
    </div>
    
    <div class="header-center" ng-if="c.state.session.code">
      <div class="session-badge">
        <span class="session-label">Session:</span>
        <span class="session-code">{{c.state.session.code}}</span>
        <button class="btn-icon" ng-click="c.copySessionCode()" title="Copy code">
          <i class="fa fa-copy"></i>
        </button>
      </div>
      <span class="session-name">{{c.state.session.name}}</span>
    </div>
    
    <div class="header-right">
      <!-- Progress Indicator -->
      <div class="progress-indicator" ng-if="c.getProgress().total > 0">
        <span class="progress-text">
          Story {{c.getProgress().current}} of {{c.getProgress().total}}
        </span>
        <span class="progress-pointed">
          ({{c.getProgress().pointed}} pointed)
        </span>
      </div>
      
      <!-- Participant Count -->
      <div class="participant-count" ng-if="c.state.participants">
        <i class="fa fa-users"></i>
        <span>{{Object.keys(c.state.participants).length}}</span>
      </div>
    </div>
  </header>
  
  <!-- ============ TIMER BAR ============ -->
  <div class="timer-bar" ng-if="c.state.ui.timerActive">
    <div class="timer-progress" ng-style="{'width': c.getTimerProgress() + '%'}"></div>
    <span class="timer-text">{{c.getTimerDisplay()}}</span>
  </div>
  
  <!-- ============ LOADING STATE ============ -->
  <div ng-if="c.state.ui.loading && !c.state.session.id" class="loading-overlay">
    <div class="loading-spinner">
      <i class="fa fa-spinner fa-spin fa-3x"></i>
      <p>Loading session...</p>
    </div>
  </div>
  
  <!-- ============ ERROR STATE ============ -->
  <div ng-if="c.state.ui.error" class="error-banner">
    <i class="fa fa-exclamation-triangle"></i>
    <span>{{c.state.ui.error}}</span>
    <button class="btn-icon" ng-click="c.dismissError()">
      <i class="fa fa-times"></i>
    </button>
  </div>
  
  <!-- ============ MAIN CONTENT ============ -->
  <main class="main-content" ng-if="c.state.session.id">
    
    <!-- LEFT PANEL: Story List -->
    <aside class="left-panel">
      <div class="panel-header">
        <h2>Stories</h2>
        <span class="story-count">{{c.getStories().length}}</span>
      </div>
      
      <div class="story-list">
        <div ng-repeat="story in c.getStories() track by story.sys_id" 
             class="story-list-item"
             ng-class="{
               'active': story.sys_id === c.state.currentStoryId,
               'status-pending': story.status === 'pending',
               'status-voting': story.status === 'voting',
               'status-pointed': story.status === 'pointed',
               'status-skipped': story.status === 'skipped'
             }"
             ng-click="c.selectStory(story)">
          
          <!-- Status Icon -->
          <div class="story-status-icon">
            <i ng-if="story.status === 'pending'" class="fa fa-circle-o"></i>
            <i ng-if="story.status === 'voting'" class="fa fa-spinner fa-pulse"></i>
            <i ng-if="story.status === 'pointed'" class="fa fa-check-circle"></i>
            <i ng-if="story.status === 'skipped'" class="fa fa-forward"></i>
          </div>
          
          <!-- Story Info -->
          <div class="story-info">
            <div class="story-number">{{story.number}}</div>
            <div class="story-title" title="{{story.short_description}}">
              {{story.short_description}}
            </div>
          </div>
          
          <!-- Points Badge -->
          <div class="story-points-badge" ng-if="story.final_points">
            {{story.final_points}}
          </div>
          
          <!-- Status Badge -->
          <div class="story-status-badge">
            <span ng-if="story.status === 'pending'" class="badge badge-default">Pending</span>
            <span ng-if="story.status === 'voting'" class="badge badge-warning">Voting</span>
            <span ng-if="story.status === 'pointed'" class="badge badge-success">Pointed</span>
            <span ng-if="story.status === 'skipped'" class="badge badge-muted">Skipped</span>
          </div>
        </div>
      </div>
      
      <!-- Session Actions (Moderator) -->
      <div class="panel-footer" ng-if="c.isModerator()">
        <button class="btn btn-sm btn-default" ng-click="c.endSession()">
          <i class="fa fa-stop"></i> End Session
        </button>
      </div>
    </aside>
    
    <!-- CENTER PANEL: Story Details -->
    <section class="center-panel">
      <div ng-if="c.getCurrentStory()" class="story-detail">
        
        <!-- Story Header -->
        <div class="story-detail-header">
          <div class="story-number-large">{{c.getCurrentStory().number}}</div>
          <div class="story-badges">
            <span class="badge badge-type" ng-if="c.getCurrentStory().type">
              {{c.getCurrentStory().type}}
            </span>
            <span class="badge badge-state">
              {{c.getCurrentStory().state}}
            </span>
          </div>
        </div>
        
        <!-- Story Title -->
        <h3 class="story-title-large">{{c.getCurrentStory().short_description}}</h3>
        
        <!-- Story Metadata Grid -->
        <div class="story-metadata-grid">
          <div class="metadata-item">
            <label>Assignment Group</label>
            <div class="metadata-value" ng-if="!c.editMode.assignment_group">
              {{c.getCurrentStory().assignment_group || 'Unassigned'}}
              <button class="btn-edit" ng-click="c.enableEdit('assignment_group')" ng-if="c.isModerator()">
                <i class="fa fa-pencil"></i>
              </button>
            </div>
            <input ng-if="c.editMode.assignment_group" 
                   type="text" 
                   class="form-control form-control-sm"
                   ng-model="c.editValues.assignment_group"
                   ng-blur="c.saveField('assignment_group')">
          </div>
          
          <div class="metadata-item">
            <label>Assigned To</label>
            <div class="metadata-value" ng-if="!c.editMode.assigned_to">
              {{c.getCurrentStory().assigned_to || 'Unassigned'}}
              <button class="btn-edit" ng-click="c.enableEdit('assigned_to')" ng-if="c.isModerator()">
                <i class="fa fa-pencil"></i>
              </button>
            </div>
            <input ng-if="c.editMode.assigned_to" 
                   type="text" 
                   class="form-control form-control-sm"
                   ng-model="c.editValues.assigned_to"
                   ng-blur="c.saveField('assigned_to')">
          </div>
          
          <div class="metadata-item">
            <label>Points</label>
            <div class="metadata-value">
              <span ng-if="c.getCurrentStory().current_points">{{c.getCurrentStory().current_points}}</span>
              <span ng-if="!c.getCurrentStory().current_points" class="text-muted">Not pointed</span>
            </div>
          </div>
          
          <div class="metadata-item">
            <label>Opened</label>
            <div class="metadata-value">
              {{c.getCurrentStory().opened || 'N/A'}}
            </div>
          </div>
          
          <div class="metadata-item">
            <label>Opened By</label>
            <div class="metadata-value">
              {{c.getCurrentStory().opened_by || 'N/A'}}
            </div>
          </div>
          
          <div class="metadata-item">
            <label>Sprint</label>
            <div class="metadata-value">
              {{c.getCurrentStory().sprint || 'N/A'}}
            </div>
          </div>
        </div>
        
        <!-- Description -->
        <div class="story-section">
          <div class="section-header">
            <label>Description</label>
            <button class="btn-edit" ng-click="c.enableEdit('description')" ng-if="c.isModerator() && !c.editMode.description">
              <i class="fa fa-pencil"></i>
            </button>
          </div>
          <div class="section-content" ng-if="!c.editMode.description">
            <p ng-if="c.getCurrentStory().description">{{c.getCurrentStory().description}}</p>
            <p ng-if="!c.getCurrentStory().description" class="text-muted">No description provided</p>
          </div>
          <textarea ng-if="c.editMode.description" 
                    class="form-control"
                    rows="4"
                    ng-model="c.editValues.description"
                    ng-blur="c.saveField('description')"></textarea>
        </div>
        
        <!-- Acceptance Criteria -->
        <div class="story-section">
          <div class="section-header">
            <label>Acceptance Criteria</label>
            <button class="btn-edit" ng-click="c.enableEdit('acceptance_criteria')" ng-if="c.isModerator() && !c.editMode.acceptance_criteria">
              <i class="fa fa-pencil"></i>
            </button>
          </div>
          <div class="section-content" ng-if="!c.editMode.acceptance_criteria">
            <pre ng-if="c.getCurrentStory().acceptance_criteria">{{c.getCurrentStory().acceptance_criteria}}</pre>
            <p ng-if="!c.getCurrentStory().acceptance_criteria" class="text-muted">No acceptance criteria defined</p>
          </div>
          <textarea ng-if="c.editMode.acceptance_criteria" 
                    class="form-control"
                    rows="6"
                    ng-model="c.editValues.acceptance_criteria"
                    ng-blur="c.saveField('acceptance_criteria')"></textarea>
        </div>
        
        <!-- Save Button (if any edits pending) -->
        <div class="story-actions" ng-if="c.hasUnsavedChanges()">
          <button class="btn btn-primary" ng-click="c.saveAllChanges()">
            <i class="fa fa-save"></i> Save Changes
          </button>
          <button class="btn btn-default" ng-click="c.cancelEdits()">
            Cancel
          </button>
        </div>
        
      </div>
      
      <!-- No Story Selected -->
      <div ng-if="!c.getCurrentStory()" class="empty-state">
        <i class="fa fa-hand-pointer-o fa-4x"></i>
        <h3>Select a Story</h3>
        <p>Choose a story from the list to view details and start voting</p>
      </div>
    </section>
    
    <!-- RIGHT PANEL: Voting Area -->
    <aside class="right-panel">
      <div class="panel-header">
        <h2>Voting</h2>
        <div class="vote-progress" ng-if="c.getCurrentStory() && c.getCurrentStory().status === 'voting'">
          <span>{{c.getVoteProgress().voted}}/{{c.getVoteProgress().total}}</span>
        </div>
      </div>
      
      <!-- Voting Panel Content (uses ng-switch from 04_VOTING_LOGIC.md) -->
      <div class="voting-panel-content" ng-switch="c.getVotingPanelState().view">
        
        <!-- No Story Selected -->
        <div ng-switch-when="NO_STORY" class="empty-state">
          <i class="fa fa-hand-pointer-o fa-3x"></i>
          <p>Select a story to begin voting</p>
        </div>
        
        <!-- Story Pending -->
        <div ng-switch-when="PENDING" class="pending-state">
          <i class="fa fa-hourglass-start fa-3x"></i>
          <p ng-if="!c.isModerator()">Waiting for moderator to start voting...</p>
          <button ng-if="c.isModerator()" 
                  class="btn btn-primary btn-lg"
                  ng-click="c.startVoting()">
            <i class="fa fa-play"></i> Start Voting
          </button>
        </div>
        
        <!-- Show Voting Cards -->
        <div ng-switch-when="SHOW_CARDS" class="voting-cards-section">
          <div class="voting-header">
            <span class="round-indicator">Round {{c.getCurrentStory().round || 1}}</span>
            <span class="vote-count-text">{{c.getVoteProgress().voted}} of {{c.getVoteProgress().total}} voted</span>
          </div>
          
          <!-- Timer Controls (Moderator) -->
          <div class="timer-controls" ng-if="c.isModerator() && !c.state.ui.timerActive">
            <button class="btn btn-sm btn-default" ng-click="c.startTimer(60)">
              <i class="fa fa-clock-o"></i> 1 min
            </button>
            <button class="btn btn-sm btn-default" ng-click="c.startTimer(120)">
              <i class="fa fa-clock-o"></i> 2 min
            </button>
            <button class="btn btn-sm btn-default" ng-click="c.startTimer(180)">
              <i class="fa fa-clock-o"></i> 3 min
            </button>
          </div>
          
          <div class="cards-grid">
            <div ng-repeat="card in c.cardValues track by $index" 
                 class="vote-card"
                 ng-class="{'selected': c.state.voting.selectedCard === card}"
                 ng-click="c.selectCard(card)">
              <span class="card-value">{{card}}</span>
            </div>
          </div>
          
          <button ng-if="c.state.voting.selectedCard !== null" 
                  class="btn btn-primary btn-block btn-lg submit-btn"
                  ng-click="c.submitVote()"
                  ng-disabled="c.state.ui.loading">
            <i class="fa fa-check"></i> Submit Vote
          </button>
          
          <!-- Moderator: Reveal Button -->
          <button ng-if="c.isModerator()" 
                  class="btn btn-warning btn-block moderator-btn"
                  ng-click="c.revealVotes()"
                  ng-disabled="c.state.ui.loading">
            <i class="fa fa-eye"></i> Stop & Reveal
          </button>
        </div>
        
        <!-- Vote Submitted -->
        <div ng-switch-when="VOTE_SUBMITTED" class="vote-submitted-section">
          <div class="submitted-confirmation">
            <i class="fa fa-check-circle fa-4x text-success"></i>
            <h4>Vote Submitted!</h4>
            <div class="your-vote">
              Your vote: <strong class="vote-value">{{c.state.voting.selectedCard}}</strong>
            </div>
          </div>
          
          <div class="waiting-info">
            <p>Waiting for others...</p>
            <div class="vote-progress-bar">
              <div class="progress-fill" 
                   ng-style="{'width': (c.getVoteProgress().voted / c.getVoteProgress().total * 100) + '%'}">
              </div>
            </div>
            <span class="progress-text">{{c.getVoteProgress().voted}} of {{c.getVoteProgress().total}}</span>
          </div>
          
          <!-- Participant Vote Status -->
          <div class="participant-status" ng-if="c.state.participants">
            <div ng-repeat="(id, participant) in c.state.participants" class="participant-item">
              <span class="participant-name">{{participant.name}}</span>
              <i ng-if="participant.has_voted" class="fa fa-check text-success"></i>
              <i ng-if="!participant.has_voted" class="fa fa-clock-o text-muted"></i>
            </div>
          </div>
          
          <!-- Moderator: Reveal Button -->
          <button ng-if="c.isModerator()" 
                  class="btn btn-warning btn-block moderator-btn"
                  ng-click="c.revealVotes()"
                  ng-disabled="c.state.ui.loading">
            <i class="fa fa-eye"></i> Stop & Reveal
          </button>
        </div>
        
        <!-- Show Results -->
        <div ng-switch-when="SHOW_RESULTS" class="results-section">
          <div class="results-header">
            <h4>Results</h4>
            <span class="round-badge">Round {{c.getCurrentStory().round || 1}}</span>
          </div>
          
          <!-- Suggested Points -->
          <div class="suggested-points">
            <label>Suggested</label>
            <div class="suggested-value">{{c.state.voting.results.suggested_points}}</div>
            <span ng-if="c.state.voting.results.has_consensus" class="consensus-indicator">
              <i class="fa fa-check-circle"></i> Consensus
            </span>
            <span ng-if="!c.state.voting.results.has_consensus" class="no-consensus-indicator">
              <i class="fa fa-exclamation-circle"></i> No Consensus
            </span>
          </div>
          
          <!-- Distribution Chart -->
          <div class="distribution-chart">
            <h5>Vote Distribution</h5>
            <div ng-repeat="(value, count) in c.state.voting.results.distribution track by value" 
                 class="dist-bar-row">
              <span class="dist-label">{{value}}</span>
              <div class="dist-bar-bg">
                <div class="dist-bar-fill" 
                     ng-style="{'width': (count / c.state.voting.results.votes.length * 100) + '%'}">
                </div>
              </div>
              <span class="dist-count">{{count}}</span>
            </div>
          </div>
          
          <!-- Individual Votes -->
          <div class="individual-votes">
            <h5>Individual Votes</h5>
            <div ng-repeat="vote in c.state.voting.results.votes track by vote.voter_name" 
                 class="vote-row">
              <span class="voter">{{vote.voter_name}}</span>
              <span class="estimate">{{vote.estimate}}</span>
            </div>
          </div>
          
          <!-- Moderator Controls -->
          <div ng-if="c.isModerator()" class="moderator-controls">
            <div class="finalize-group">
              <label>Final Points</label>
              <div class="input-group">
                <input type="number" 
                       class="form-control" 
                       ng-model="c.state.voting.finalPoints"
                       step="0.5"
                       min="0">
                <span class="input-group-btn">
                  <button class="btn btn-success"
                          ng-click="c.finalizePoints()"
                          ng-disabled="c.state.voting.finalPoints === null || c.state.ui.loading">
                    <i class="fa fa-check"></i> Finalize
                  </button>
                </span>
              </div>
            </div>
            
            <button class="btn btn-default btn-block"
                    ng-click="c.newRound()"
                    ng-disabled="c.state.ui.loading">
              <i class="fa fa-refresh"></i> New Round
            </button>
            
            <button class="btn btn-link btn-block"
                    ng-click="c.skipStory()">
              <i class="fa fa-forward"></i> Skip Story
            </button>
          </div>
        </div>
        
        <!-- Story Pointed -->
        <div ng-switch-when="POINTED" class="pointed-section">
          <div class="pointed-confirmation">
            <i class="fa fa-trophy fa-4x text-success"></i>
            <h3>{{c.getCurrentStory().final_points}} Points</h3>
            <p>Story pointed successfully!</p>
          </div>
          
          <button ng-if="c.isModerator()" 
                  class="btn btn-primary btn-block btn-lg"
                  ng-click="c.nextStory()"
                  ng-disabled="c.state.ui.loading">
            <i class="fa fa-arrow-right"></i> Next Story
          </button>
        </div>
        
        <!-- Story Skipped -->
        <div ng-switch-when="SKIPPED" class="skipped-section">
          <div class="skipped-info">
            <i class="fa fa-forward fa-3x text-muted"></i>
            <p>Story was skipped</p>
          </div>
          
          <button ng-if="c.isModerator()" 
                  class="btn btn-primary btn-block"
                  ng-click="c.nextStory()"
                  ng-disabled="c.state.ui.loading">
            <i class="fa fa-arrow-right"></i> Next Story
          </button>
        </div>
        
      </div>
    </aside>
    
  </main>
  
</div>
```

## Key Changes from v1

1. **Stable Keys**: All `ng-repeat` use `track by` for stable DOM
2. **Structured Story Panel**: Metadata grid with editable fields
3. **Progress Indicators**: Story X of Y, pointed count
4. **Status Badges**: Visual status in story list
5. **Timer Bar**: Top-level progress bar
6. **Vote Progress**: Shows X of Y voted
7. **Participant Status**: Shows who has voted
8. **Better State Handling**: Uses `ng-switch` for clean conditional rendering
9. **Moderator Controls**: Clearly separated and contextual
10. **Loading States**: Inline loading indicators
