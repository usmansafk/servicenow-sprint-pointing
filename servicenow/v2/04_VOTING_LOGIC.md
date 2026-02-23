# Complete Voting Lifecycle Implementation

## Voting Actions

Add these to your Client Controller:

```javascript
// ============ VOTING LIFECYCLE ============

// 1. START VOTING (Moderator only)
c.startVoting = function(storyId) {
  if (!c.isModerator()) {
    console.error('Only moderator can start voting');
    return;
  }
  
  storyId = storyId || SessionState.get('currentStoryId');
  if (!storyId) {
    c.showError('No story selected');
    return;
  }
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/start_voting', {
    story_id: storyId
  })
  .then(function(response) {
    if (response.data.result.success) {
      // Update story status
      SessionState.updateStory(storyId, {
        status: 'voting',
        voting_state: 'open',
        current_round: 1
      });
      SessionState.setCurrentStory(storyId);
      SessionState.resetVoting();
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to start voting');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 2. SELECT CARD (All participants)
c.selectCard = function(value) {
  var currentStory = SessionState.getCurrentStory();
  
  // Validate voting is open
  if (!currentStory || currentStory.voting_state !== 'open') {
    console.warn('Cannot select card - voting not open');
    return;
  }
  
  // Validate user hasn't already submitted
  if (SessionState.get('voting.userVoted')) {
    console.warn('Already voted - cannot change selection');
    return;
  }
  
  SessionState.selectCard(value);
};

// 3. SUBMIT VOTE (All participants)
c.submitVote = function() {
  var selectedCard = SessionState.get('voting.selectedCard');
  var currentStory = SessionState.getCurrentStory();
  
  if (!selectedCard && selectedCard !== 0) {
    c.showError('Please select a card first');
    return;
  }
  
  if (!currentStory) {
    c.showError('No story selected');
    return;
  }
  
  if (currentStory.voting_state !== 'open') {
    c.showError('Voting is not open');
    return;
  }
  
  var isPass = selectedCard === 'pass';
  var estimate = isPass ? 0 : selectedCard;
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/vote/submit', {
    session_code: c.sessionCode,
    story_id: currentStory.sys_id,
    round: currentStory.round || 1,
    estimate: estimate,
    is_pass: isPass
  })
  .then(function(response) {
    if (response.data.result.success) {
      SessionState.setUserVoted(true);
      
      // Update vote count locally
      var newCount = response.data.result.votes_count;
      SessionState.updateStory(currentStory.sys_id, {
        votes_count: newCount
      });
      
      c.showSuccess('Vote submitted!');
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to submit vote');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 4. REVEAL VOTES (Moderator only)
c.revealVotes = function() {
  if (!c.isModerator()) {
    console.error('Only moderator can reveal votes');
    return;
  }
  
  var currentStory = SessionState.getCurrentStory();
  if (!currentStory) {
    c.showError('No story selected');
    return;
  }
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/reveal', {
    story_id: currentStory.sys_id
  })
  .then(function(response) {
    if (response.data.result.success) {
      // Update story state
      SessionState.updateStory(currentStory.sys_id, {
        voting_state: 'revealed'
      });
      
      // Store results
      SessionState.setVoteResults(response.data.result.results);
      
      // Stop timer if running
      SessionState.stopTimer();
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to reveal votes');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 5. FINALIZE POINTS (Moderator only)
c.finalizePoints = function() {
  if (!c.isModerator()) {
    console.error('Only moderator can finalize points');
    return;
  }
  
  var currentStory = SessionState.getCurrentStory();
  var finalPoints = SessionState.get('voting.finalPoints');
  
  if (!currentStory) {
    c.showError('No story selected');
    return;
  }
  
  if (finalPoints === null || finalPoints === undefined || finalPoints === '') {
    c.showError('Please enter final points');
    return;
  }
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/finalize', {
    story_id: currentStory.sys_id,
    final_points: parseFloat(finalPoints)
  })
  .then(function(response) {
    if (response.data.result.success) {
      // Update story in state
      SessionState.updateStory(currentStory.sys_id, {
        status: 'pointed',
        final_points: finalPoints,
        voting_state: null
      });
      
      // Reset voting state
      SessionState.resetVoting();
      
      c.showSuccess('Points finalized! Story ' + response.data.result.story_number + 
                    ' updated with ' + response.data.result.points_written + ' points');
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to finalize points');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 6. NEW ROUND (Moderator only)
c.newRound = function() {
  if (!c.isModerator()) {
    console.error('Only moderator can start new round');
    return;
  }
  
  var currentStory = SessionState.getCurrentStory();
  if (!currentStory) {
    c.showError('No story selected');
    return;
  }
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/new_round', {
    story_id: currentStory.sys_id
  })
  .then(function(response) {
    if (response.data.result.success) {
      // Update story state
      SessionState.updateStory(currentStory.sys_id, {
        voting_state: 'open',
        current_round: response.data.result.round,
        votes_count: 0
      });
      
      // Reset voting UI
      SessionState.resetVoting();
      
      c.showSuccess('Round ' + response.data.result.round + ' started');
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to start new round');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 7. NEXT STORY (Moderator only)
c.nextStory = function() {
  if (!c.isModerator()) {
    console.error('Only moderator can advance stories');
    return;
  }
  
  SessionState.setLoading(true);
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/next_story', {})
  .then(function(response) {
    if (response.data.result.success) {
      if (response.data.result.session_complete) {
        // All stories pointed
        SessionState.updateSession({ state: 'completed' });
        c.showSuccess('All stories have been pointed! Session complete.');
      } else {
        // Move to next story
        var nextStory = response.data.result.current_story;
        
        // Update the new current story
        SessionState.updateStory(nextStory.sys_id, {
          status: 'voting',
          voting_state: 'open',
          current_round: 1
        });
        
        SessionState.setCurrentStory(nextStory.sys_id);
        SessionState.resetVoting();
        
        c.showSuccess('Now pointing: ' + nextStory.number);
      }
    } else {
      c.showError(response.data.result.error);
    }
  })
  .catch(function(error) {
    c.showError('Failed to move to next story');
  })
  .finally(function() {
    SessionState.setLoading(false);
  });
};

// 8. SKIP STORY (Moderator only)
c.skipStory = function() {
  if (!c.isModerator()) {
    console.error('Only moderator can skip stories');
    return;
  }
  
  var currentStory = SessionState.getCurrentStory();
  if (!currentStory) {
    c.showError('No story selected');
    return;
  }
  
  // Mark as skipped and move to next
  SessionState.updateStory(currentStory.sys_id, {
    status: 'skipped'
  });
  
  c.nextStory();
};

// ============ HELPER FUNCTIONS ============

// Show success message (replace with toast in v3)
c.showSuccess = function(message) {
  // For now, use console. Replace with toast notification later.
  console.log('SUCCESS:', message);
  // Could also set a temporary state:
  // SessionState.setMessage({ type: 'success', text: message });
};

// Show error message
c.showError = function(message) {
  console.error('ERROR:', message);
  // For now, use alert. Replace with toast notification later.
  alert(message);
};

// Check if user is moderator
c.isModerator = function() {
  return SessionState.get('meta.isModerator');
};

// Get what to show in voting panel
c.getVotingPanelState = function() {
  var currentStory = SessionState.getCurrentStory();
  var voting = SessionState.get('voting');
  var isModerator = c.isModerator();
  
  if (!currentStory) {
    return { view: 'NO_STORY' };
  }
  
  var status = currentStory.status;
  var votingState = currentStory.voting_state;
  
  // Story pending - not yet being voted on
  if (status === 'pending') {
    return { 
      view: 'PENDING',
      showStartButton: isModerator
    };
  }
  
  // Story in voting
  if (status === 'voting') {
    // Voting is open
    if (votingState === 'open') {
      if (voting.userVoted) {
        return { 
          view: 'VOTE_SUBMITTED',
          selectedCard: voting.selectedCard,
          showRevealButton: isModerator
        };
      }
      return { view: 'SHOW_CARDS' };
    }
    
    // Votes revealed
    if (votingState === 'revealed') {
      return {
        view: 'SHOW_RESULTS',
        results: voting.results,
        finalPoints: voting.finalPoints,
        showModeratorControls: isModerator
      };
    }
  }
  
  // Story already pointed
  if (status === 'pointed') {
    return {
      view: 'POINTED',
      points: currentStory.final_points,
      showNextButton: isModerator
    };
  }
  
  // Story skipped
  if (status === 'skipped') {
    return {
      view: 'SKIPPED',
      showNextButton: isModerator
    };
  }
  
  return { view: 'UNKNOWN' };
};
```

## Voting Panel Template Logic

```html
<!-- Voting Panel Content -->
<div class="voting-panel-content" ng-switch="c.getVotingPanelState().view">
  
  <!-- No Story Selected -->
  <div ng-switch-when="NO_STORY" class="empty-state">
    <i class="fa fa-hand-pointer-o fa-3x"></i>
    <p>Select a story from the left to begin</p>
  </div>
  
  <!-- Story Pending - Waiting to Start -->
  <div ng-switch-when="PENDING" class="pending-state">
    <i class="fa fa-clock-o fa-3x"></i>
    <p ng-if="!c.isModerator()">Waiting for moderator to start voting...</p>
    <button ng-if="c.isModerator()" 
            class="btn btn-primary btn-lg"
            ng-click="c.startVoting()">
      <i class="fa fa-play"></i> Start Voting
    </button>
  </div>
  
  <!-- Show Voting Cards -->
  <div ng-switch-when="SHOW_CARDS" class="voting-cards-container">
    <div class="voting-status">
      <span class="round-badge">Round {{c.getCurrentStory().round || 1}}</span>
      <span class="vote-count">{{c.getVoteProgress().voted}} of {{c.getVoteProgress().total}} voted</span>
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
            class="btn btn-primary btn-block submit-vote-btn"
            ng-click="c.submitVote()"
            ng-disabled="c.state.ui.loading">
      <i class="fa fa-check"></i> Submit Vote
    </button>
  </div>
  
  <!-- Vote Submitted - Waiting for Others -->
  <div ng-switch-when="VOTE_SUBMITTED" class="vote-submitted-state">
    <div class="submitted-card">
      <i class="fa fa-check-circle fa-3x text-success"></i>
      <p>Your vote: <strong>{{c.getVotingPanelState().selectedCard}}</strong></p>
    </div>
    
    <div class="waiting-message">
      <p>Waiting for others to vote...</p>
      <p class="vote-progress">{{c.getVoteProgress().voted}} of {{c.getVoteProgress().total}} voted</p>
    </div>
    
    <!-- Moderator: Reveal Button -->
    <button ng-if="c.getVotingPanelState().showRevealButton" 
            class="btn btn-warning btn-block"
            ng-click="c.revealVotes()"
            ng-disabled="c.state.ui.loading">
      <i class="fa fa-eye"></i> Stop Voting & Reveal
    </button>
  </div>
  
  <!-- Show Results -->
  <div ng-switch-when="SHOW_RESULTS" class="results-container">
    <div class="results-header">
      <h4>Results - Round {{c.getCurrentStory().round || 1}}</h4>
    </div>
    
    <!-- Suggested Points -->
    <div class="suggested-points-box">
      <label>Suggested Points</label>
      <div class="suggested-value">{{c.getVotingPanelState().results.suggested_points}}</div>
      <span ng-if="c.getVotingPanelState().results.has_consensus" class="consensus-badge">
        <i class="fa fa-check"></i> Consensus
      </span>
    </div>
    
    <!-- Vote Distribution -->
    <div class="vote-distribution">
      <h5>Distribution</h5>
      <div ng-repeat="(value, count) in c.getVotingPanelState().results.distribution" 
           class="dist-row">
        <span class="dist-value">{{value}}</span>
        <div class="dist-bar-container">
          <div class="dist-bar" 
               ng-style="{'width': (count / c.getVotingPanelState().results.votes.length * 100) + '%'}">
          </div>
        </div>
        <span class="dist-count">{{count}}</span>
      </div>
    </div>
    
    <!-- Individual Votes -->
    <div class="individual-votes">
      <h5>Individual Votes</h5>
      <div ng-repeat="vote in c.getVotingPanelState().results.votes" class="vote-row">
        <span class="voter-name">{{vote.voter_name}}</span>
        <span class="voter-estimate">{{vote.estimate}}</span>
      </div>
    </div>
    
    <!-- Moderator Controls -->
    <div ng-if="c.getVotingPanelState().showModeratorControls" class="moderator-actions">
      <div class="finalize-section">
        <label>Final Points</label>
        <input type="number" 
               class="form-control" 
               ng-model="c.state.voting.finalPoints"
               placeholder="Enter points">
        <button class="btn btn-success btn-block"
                ng-click="c.finalizePoints()"
                ng-disabled="!c.state.voting.finalPoints || c.state.ui.loading">
          <i class="fa fa-check"></i> Finalize Points
        </button>
      </div>
      
      <button class="btn btn-default btn-block"
              ng-click="c.newRound()"
              ng-disabled="c.state.ui.loading">
        <i class="fa fa-refresh"></i> New Round
      </button>
    </div>
  </div>
  
  <!-- Story Pointed -->
  <div ng-switch-when="POINTED" class="pointed-state">
    <div class="pointed-badge">
      <i class="fa fa-check-circle fa-3x text-success"></i>
      <h3>{{c.getVotingPanelState().points}} Points</h3>
      <p>Story pointed successfully!</p>
    </div>
    
    <button ng-if="c.getVotingPanelState().showNextButton" 
            class="btn btn-primary btn-block"
            ng-click="c.nextStory()"
            ng-disabled="c.state.ui.loading">
      <i class="fa fa-arrow-right"></i> Next Story
    </button>
  </div>
  
  <!-- Story Skipped -->
  <div ng-switch-when="SKIPPED" class="skipped-state">
    <div class="skipped-badge">
      <i class="fa fa-forward fa-3x text-muted"></i>
      <p>Story skipped</p>
    </div>
    
    <button ng-if="c.getVotingPanelState().showNextButton" 
            class="btn btn-primary btn-block"
            ng-click="c.nextStory()"
            ng-disabled="c.state.ui.loading">
      <i class="fa fa-arrow-right"></i> Next Story
    </button>
  </div>
  
</div>
```

## One Vote Per User Per Round (Backend)

The backend already handles this in the Script Include. Here's the key logic:

```javascript
// In SprintPointingAPI.submitVote()

// Check if user already voted in this round
var existingVote = new GlideRecord(this.voteTable);
existingVote.addQuery('session_story', storyId);
existingVote.addQuery('round', round);
existingVote.addQuery('voter', currentUser);
existingVote.query();

if (existingVote.next()) {
  // UPDATE existing vote (allows changing vote before reveal)
  existingVote.setValue('estimate', estimate);
  existingVote.setValue('is_pass', isPass);
  existingVote.setValue('voted_at', new GlideDateTime());
  existingVote.update();
} else {
  // INSERT new vote
  var voteGR = new GlideRecord(this.voteTable);
  voteGR.initialize();
  voteGR.setValue('session_story', storyId);
  voteGR.setValue('round', round);
  voteGR.setValue('voter', currentUser);
  voteGR.setValue('estimate', estimate);
  voteGR.setValue('is_pass', isPass);
  voteGR.setValue('voted_at', new GlideDateTime());
  voteGR.insert();
}
```

This ensures:
- One vote per user per round
- Users can change their vote before reveal
- Previous round votes are preserved for history
