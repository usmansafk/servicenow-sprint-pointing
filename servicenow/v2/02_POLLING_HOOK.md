# Smart Polling Implementation

## The Problem with Current Polling

```javascript
// CURRENT: Causes flicker
$interval(function() {
  c.loadSession(true); // Replaces entire state
}, 2000);
```

## Solution: Smart Polling with Change Detection

### Polling Service

Add this to your Client Controller:

```javascript
// Smart polling that only updates changed data
var PollingService = {
  lastData: null,
  lastPollTime: null,
  isPolling: false,
  pollInterval: null,
  
  // Start polling
  start: function(callback, interval) {
    var self = this;
    interval = interval || 2000;
    
    // Don't start if already polling
    if (self.pollInterval) return;
    
    self.pollInterval = $interval(function() {
      // Skip if previous poll still running
      if (self.isPolling) return;
      
      // Skip if tab not visible
      if (document.hidden) return;
      
      self.poll(callback);
    }, interval);
  },
  
  // Stop polling
  stop: function() {
    if (this.pollInterval) {
      $interval.cancel(this.pollInterval);
      this.pollInterval = null;
    }
  },
  
  // Execute single poll
  poll: function(callback) {
    var self = this;
    self.isPolling = true;
    
    $http.get(c.apiBase + '/session/' + c.sessionCode)
      .then(function(response) {
        if (response.data.result.success) {
          var newData = response.data.result;
          var changes = self.detectChanges(newData);
          
          if (changes.hasChanges) {
            callback(newData, changes);
          }
          
          self.lastData = newData;
          self.lastPollTime = Date.now();
        }
      })
      .catch(function(error) {
        console.error('Poll failed:', error);
      })
      .finally(function() {
        self.isPolling = false;
      });
  },
  
  // Detect what changed between polls
  detectChanges: function(newData) {
    var changes = {
      hasChanges: false,
      sessionChanged: false,
      storiesChanged: [],
      currentStoryChanged: false,
      votesChanged: false,
      participantsChanged: false
    };
    
    // First poll - everything is new
    if (!this.lastData) {
      changes.hasChanges = true;
      changes.sessionChanged = true;
      return changes;
    }
    
    var oldData = this.lastData;
    
    // Check session-level changes
    if (oldData.state !== newData.state) {
      changes.hasChanges = true;
      changes.sessionChanged = true;
    }
    
    // Check current story changes
    if (this.currentStoryChanged(oldData.current_story, newData.current_story)) {
      changes.hasChanges = true;
      changes.currentStoryChanged = true;
    }
    
    // Check individual story changes
    if (newData.stories && oldData.stories) {
      newData.stories.forEach(function(newStory) {
        var oldStory = oldData.stories.find(function(s) {
          return s.sys_id === newStory.sys_id;
        });
        
        if (!oldStory || !angular.equals(oldStory, newStory)) {
          changes.hasChanges = true;
          changes.storiesChanged.push(newStory.sys_id);
        }
      });
    }
    
    // Check vote count changes (for current story)
    if (newData.current_story && oldData.current_story) {
      if (newData.current_story.votes_count !== oldData.current_story.votes_count) {
        changes.hasChanges = true;
        changes.votesChanged = true;
      }
    }
    
    // Check participant changes
    if (!angular.equals(oldData.participants, newData.participants)) {
      changes.hasChanges = true;
      changes.participantsChanged = true;
    }
    
    return changes;
  },
  
  // Helper: Check if current story changed
  currentStoryChanged: function(oldStory, newStory) {
    if (!oldStory && !newStory) return false;
    if (!oldStory || !newStory) return true;
    
    // Check key fields that affect UI
    return (
      oldStory.sys_id !== newStory.sys_id ||
      oldStory.status !== newStory.status ||
      oldStory.voting_state !== newStory.voting_state ||
      oldStory.round !== newStory.round ||
      oldStory.votes_count !== newStory.votes_count
    );
  }
};
```

### Using the Polling Service

```javascript
// In your init function
c.init = function() {
  // Initial load
  c.loadSession();
  
  // Start smart polling
  PollingService.start(function(newData, changes) {
    c.applyChanges(newData, changes);
  }, 2000);
};

// Apply only the changes (not full replacement)
c.applyChanges = function(newData, changes) {
  // Update session-level data
  if (changes.sessionChanged) {
    c.sessionData.state = newData.state;
    c.sessionData.session_name = newData.session_name;
    c.sessionData.is_moderator = newData.is_moderator;
  }
  
  // Update only changed stories
  if (changes.storiesChanged.length > 0) {
    changes.storiesChanged.forEach(function(storyId) {
      var newStory = newData.stories.find(function(s) { return s.sys_id === storyId; });
      var index = c.sessionData.stories.findIndex(function(s) { return s.sys_id === storyId; });
      
      if (index >= 0 && newStory) {
        // Update in place (preserves reference)
        angular.extend(c.sessionData.stories[index], newStory);
      }
    });
  }
  
  // Update current story
  if (changes.currentStoryChanged) {
    if (newData.current_story) {
      if (c.currentStory && c.currentStory.sys_id === newData.current_story.sys_id) {
        // Update in place
        angular.extend(c.currentStory, newData.current_story);
      } else {
        // New current story
        c.currentStory = newData.current_story;
        c.resetVotingState();
      }
    }
  }
  
  // Update vote count only
  if (changes.votesChanged && c.currentStory) {
    c.currentStory.votes_count = newData.current_story.votes_count;
  }
  
  // Update participants
  if (changes.participantsChanged) {
    c.sessionData.participants = newData.participants;
  }
};

// Cleanup on destroy
$scope.$on('$destroy', function() {
  PollingService.stop();
});
```

### Visibility-Aware Polling

```javascript
// Pause polling when tab is not visible
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('Tab hidden - polling paused');
  } else {
    console.log('Tab visible - polling resumed');
    // Force immediate poll when tab becomes visible
    PollingService.poll(function(newData, changes) {
      c.applyChanges(newData, changes);
    });
  }
});
```

### Stable ng-repeat Keys

In your HTML template, always use `track by`:

```html
<!-- BEFORE (causes flicker) -->
<div ng-repeat="story in c.sessionData.stories">

<!-- AFTER (stable DOM elements) -->
<div ng-repeat="story in c.sessionData.stories track by story.sys_id">
```

This ensures Angular reuses existing DOM elements instead of recreating them.
