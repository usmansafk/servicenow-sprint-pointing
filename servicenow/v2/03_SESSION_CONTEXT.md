# Session Context - Centralized State Management

## Overview

Since ServiceNow Service Portal uses AngularJS (not React), we'll implement a service-based state management pattern that achieves the same goals as React Context.

## Session State Service

Create this as part of your Client Controller or as a separate Angular service:

```javascript
// Session State Manager
// Centralized state with controlled mutations
var SessionState = {
  // Core state
  _state: {
    // Session info
    session: {
      id: null,
      code: null,
      name: null,
      state: 'draft', // draft, active, completed
      moderator_id: null
    },
    
    // Stories map (keyed by sys_id for O(1) lookup)
    stories: {},
    storyOrder: [], // Array of sys_ids for display order
    
    // Current story being voted on
    currentStoryId: null,
    
    // Voting state
    voting: {
      selectedCard: null,
      userVoted: false,
      results: null,
      finalPoints: null
    },
    
    // Participants
    participants: {},
    
    // UI state
    ui: {
      loading: true,
      error: null,
      showCreateModal: false,
      showJoinModal: false,
      timerActive: false,
      timerEndTime: null
    },
    
    // Meta
    meta: {
      isModerator: false,
      currentUserId: null,
      lastPollTime: null
    }
  },
  
  // Subscribers for state changes
  _subscribers: [],
  
  // Get current state (read-only)
  getState: function() {
    return this._state;
  },
  
  // Get specific state slice
  get: function(path) {
    var parts = path.split('.');
    var value = this._state;
    for (var i = 0; i < parts.length; i++) {
      value = value[parts[i]];
      if (value === undefined) return undefined;
    }
    return value;
  },
  
  // Subscribe to state changes
  subscribe: function(callback) {
    this._subscribers.push(callback);
    return function() {
      var index = this._subscribers.indexOf(callback);
      if (index > -1) this._subscribers.splice(index, 1);
    }.bind(this);
  },
  
  // Notify subscribers
  _notify: function(changedPaths) {
    this._subscribers.forEach(function(callback) {
      callback(this._state, changedPaths);
    }.bind(this));
  },
  
  // ============ ACTIONS (State Mutations) ============
  
  // Initialize session from API response
  initSession: function(data) {
    this._state.session = {
      id: data.session_id,
      code: data.session_code || this._state.session.code,
      name: data.session_name,
      state: data.state,
      moderator_id: data.moderator_id
    };
    
    this._state.meta.isModerator = data.is_moderator;
    
    // Build stories map
    this._state.stories = {};
    this._state.storyOrder = [];
    
    if (data.stories) {
      data.stories.forEach(function(story) {
        this._state.stories[story.sys_id] = story;
        this._state.storyOrder.push(story.sys_id);
      }.bind(this));
    }
    
    // Set current story
    if (data.current_story) {
      this._state.currentStoryId = data.current_story.sys_id;
      this._state.stories[data.current_story.sys_id] = data.current_story;
    }
    
    // Build participants map
    this._state.participants = {};
    if (data.participants) {
      data.participants.forEach(function(p) {
        this._state.participants[p.user_id] = p;
      }.bind(this));
    }
    
    this._state.ui.loading = false;
    this._state.ui.error = null;
    
    this._notify(['session', 'stories', 'currentStoryId', 'participants', 'ui']);
  },
  
  // Update session state
  updateSession: function(updates) {
    Object.assign(this._state.session, updates);
    this._notify(['session']);
  },
  
  // Update a single story
  updateStory: function(storyId, updates) {
    if (this._state.stories[storyId]) {
      Object.assign(this._state.stories[storyId], updates);
      this._notify(['stories.' + storyId]);
    }
  },
  
  // Set current story
  setCurrentStory: function(storyId) {
    if (this._state.currentStoryId !== storyId) {
      this._state.currentStoryId = storyId;
      this.resetVoting();
      this._notify(['currentStoryId', 'voting']);
    }
  },
  
  // Get current story object
  getCurrentStory: function() {
    if (!this._state.currentStoryId) return null;
    return this._state.stories[this._state.currentStoryId];
  },
  
  // Get stories as ordered array
  getStoriesArray: function() {
    return this._state.storyOrder.map(function(id) {
      return this._state.stories[id];
    }.bind(this));
  },
  
  // ============ VOTING ACTIONS ============
  
  // Select a card
  selectCard: function(value) {
    this._state.voting.selectedCard = value;
    this._notify(['voting.selectedCard']);
  },
  
  // Mark user as voted
  setUserVoted: function(voted) {
    this._state.voting.userVoted = voted;
    this._notify(['voting.userVoted']);
  },
  
  // Set vote results
  setVoteResults: function(results) {
    this._state.voting.results = results;
    if (results && results.suggested_points !== undefined) {
      this._state.voting.finalPoints = results.suggested_points;
    }
    this._notify(['voting.results', 'voting.finalPoints']);
  },
  
  // Set final points
  setFinalPoints: function(points) {
    this._state.voting.finalPoints = points;
    this._notify(['voting.finalPoints']);
  },
  
  // Reset voting state
  resetVoting: function() {
    this._state.voting = {
      selectedCard: null,
      userVoted: false,
      results: null,
      finalPoints: null
    };
    this._notify(['voting']);
  },
  
  // ============ UI ACTIONS ============
  
  setLoading: function(loading) {
    this._state.ui.loading = loading;
    this._notify(['ui.loading']);
  },
  
  setError: function(error) {
    this._state.ui.error = error;
    this._state.ui.loading = false;
    this._notify(['ui.error', 'ui.loading']);
  },
  
  // ============ TIMER ACTIONS ============
  
  startTimer: function(durationSeconds) {
    this._state.ui.timerActive = true;
    this._state.ui.timerEndTime = Date.now() + (durationSeconds * 1000);
    this._notify(['ui.timerActive', 'ui.timerEndTime']);
  },
  
  stopTimer: function() {
    this._state.ui.timerActive = false;
    this._state.ui.timerEndTime = null;
    this._notify(['ui.timerActive', 'ui.timerEndTime']);
  },
  
  // ============ COMPUTED VALUES ============
  
  // Get progress info
  getProgress: function() {
    var stories = this.getStoriesArray();
    var pointed = stories.filter(function(s) { return s.status === 'pointed'; }).length;
    var currentIndex = this._state.currentStoryId 
      ? this._state.storyOrder.indexOf(this._state.currentStoryId) + 1 
      : 0;
    
    return {
      current: currentIndex,
      total: stories.length,
      pointed: pointed,
      remaining: stories.length - pointed
    };
  },
  
  // Get vote progress for current story
  getVoteProgress: function() {
    var currentStory = this.getCurrentStory();
    var participantCount = Object.keys(this._state.participants).length;
    
    return {
      voted: currentStory ? (currentStory.votes_count || 0) : 0,
      total: Math.max(participantCount, 1)
    };
  }
};
```

## Using Session State in Controller

```javascript
function($scope, $http, $interval) {
  var c = this;
  
  // Expose state to template
  c.state = SessionState.getState();
  
  // Subscribe to state changes
  SessionState.subscribe(function(state, changedPaths) {
    // Angular will auto-digest, but force if needed
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  // Computed getters
  c.getCurrentStory = function() {
    return SessionState.getCurrentStory();
  };
  
  c.getStories = function() {
    return SessionState.getStoriesArray();
  };
  
  c.getProgress = function() {
    return SessionState.getProgress();
  };
  
  c.getVoteProgress = function() {
    return SessionState.getVoteProgress();
  };
  
  c.isModerator = function() {
    return SessionState.get('meta.isModerator');
  };
  
  // Actions
  c.selectCard = function(value) {
    SessionState.selectCard(value);
  };
  
  c.selectStory = function(story) {
    SessionState.setCurrentStory(story.sys_id);
  };
  
  // ... rest of controller
}
```

## Template Usage

```html
<!-- Access state directly -->
<div ng-if="c.state.ui.loading">Loading...</div>

<!-- Use computed getters -->
<div class="progress">
  Story {{c.getProgress().current}} of {{c.getProgress().total}}
</div>

<!-- Vote progress -->
<div class="vote-count">
  {{c.getVoteProgress().voted}} of {{c.getVoteProgress().total}} voted
</div>

<!-- Current story -->
<div ng-if="c.getCurrentStory()">
  <h3>{{c.getCurrentStory().number}}</h3>
</div>

<!-- Stories list with stable keys -->
<div ng-repeat="story in c.getStories() track by story.sys_id">
  {{story.number}}
</div>

<!-- Moderator controls -->
<div ng-if="c.isModerator()">
  <!-- moderator-only buttons -->
</div>
```

## Benefits of This Architecture

1. **Single Source of Truth** - All state in one place
2. **Controlled Mutations** - State only changes through actions
3. **Change Detection** - Subscribers notified of specific changes
4. **Computed Values** - Derived data calculated on demand
5. **Stable References** - Stories stored in map, not replaced
6. **Testable** - State logic separated from UI
7. **Debuggable** - Can log all state changes
