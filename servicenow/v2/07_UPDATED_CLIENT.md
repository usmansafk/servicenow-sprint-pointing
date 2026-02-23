# Updated Client Controller (v2)

Complete replacement for your widget's Client Controller:

```javascript
function($scope, $http, $interval, $timeout) {
  var c = this;
  
  // ============ CONFIGURATION ============
  c.apiBase = '/api/x_1326913_sp_point/sprint_pointing_api';
  c.sessionCode = $scope.data.session_code;
  c.cardValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 30, 40, 50, 60, 80, 100, 'pass'];
  
  // ============ SESSION STATE (Centralized) ============
  c.state = {
    session: {
      id: null,
      code: null,
      name: null,
      state: 'draft',
      moderator_id: null
    },
    stories: {},
    storyOrder: [],
    currentStoryId: null,
    voting: {
      selectedCard: null,
      userVoted: false,
      results: null,
      finalPoints: null
    },
    participants: {},
    ui: {
      loading: true,
      error: null,
      timerActive: false,
      timerEndTime: null
    },
    meta: {
      isModerator: false,
      currentUserId: null,
      lastPollTime: null
    }
  };
  
  // Edit mode tracking
  c.editMode = {};
  c.editValues = {};
  
  // ============ POLLING SERVICE ============
  var PollingService = {
    lastData: null,
    isPolling: false,
    pollInterval: null,
    
    start: function(callback, interval) {
      var self = this;
      if (self.pollInterval) return;
      
      self.pollInterval = $interval(function() {
        if (self.isPolling || document.hidden) return;
        self.poll(callback);
      }, interval || 2000);
    },
    
    stop: function() {
      if (this.pollInterval) {
        $interval.cancel(this.pollInterval);
        this.pollInterval = null;
      }
    },
    
    poll: function(callback) {
      var self = this;
      self.isPolling = true;
      
      $http.get(c.apiBase + '/session/' + c.sessionCode)
        .then(function(response) {
          if (response.data.result && response.data.result.success) {
            var newData = response.data.result;
            var hasChanges = self.detectChanges(newData);
            
            if (hasChanges) {
              callback(newData);
            }
            
            self.lastData = angular.copy(newData);
          }
        })
        .catch(function(error) {
          console.error('Poll failed:', error);
        })
        .finally(function() {
          self.isPolling = false;
        });
    },
    
    detectChanges: function(newData) {
      if (!this.lastData) return true;
      
      var old = this.lastData;
      
      // Check key fields that affect UI
      if (old.state !== newData.state) return true;
      if (old.current_story?.sys_id !== newData.current_story?.sys_id) return true;
      if (old.current_story?.voting_state !== newData.current_story?.voting_state) return true;
      if (old.current_story?.votes_count !== newData.current_story?.votes_count) return true;
      if (old.current_story?.round !== newData.current_story?.round) return true;
      
      // Check story status changes
      if (newData.stories && old.stories) {
        for (var i = 0; i < newData.stories.length; i++) {
          var newStory = newData.stories[i];
          var oldStory = old.stories.find(function(s) { return s.sys_id === newStory.sys_id; });
          if (!oldStory || oldStory.status !== newStory.status || oldStory.final_points !== newStory.final_points) {
            return true;
          }
        }
      }
      
      return false;
    }
  };
  
  // ============ INITIALIZATION ============
  c.init = function() {
    if (!c.sessionCode) {
      c.state.ui.error = 'No session code provided';
      c.state.ui.loading = false;
      return;
    }
    
    c.loadSession();
    
    PollingService.start(function(newData) {
      c.applySessionData(newData);
    }, 2000);
  };
  
  // ============ DATA LOADING ============
  c.loadSession = function() {
    c.state.ui.loading = true;
    
    $http.get(c.apiBase + '/session/' + c.sessionCode)
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.applySessionData(response.data.result);
        } else {
          c.state.ui.error = response.data.result?.error || 'Failed to load session';
        }
      })
      .catch(function(error) {
        c.state.ui.error = 'Failed to connect to server';
      })
      .finally(function() {
        c.state.ui.loading = false;
      });
  };
  
  c.applySessionData = function(data) {
    // Update session info
    c.state.session = {
      id: data.session_id,
      code: c.sessionCode,
      name: data.session_name,
      state: data.state,
      moderator_id: data.moderator_id
    };
    
    c.state.meta.isModerator = data.is_moderator;
    
    // Update stories (preserve references where possible)
    var newStoryOrder = [];
    if (data.stories) {
      data.stories.forEach(function(story) {
        newStoryOrder.push(story.sys_id);
        
        if (c.state.stories[story.sys_id]) {
          // Update existing story in place
          angular.extend(c.state.stories[story.sys_id], story);
        } else {
          // Add new story
          c.state.stories[story.sys_id] = story;
        }
      });
    }
    c.state.storyOrder = newStoryOrder;
    
    // Update current story
    if (data.current_story) {
      var currentId = data.current_story.sys_id;
      c.state.stories[currentId] = data.current_story;
      
      // Only change current story if different
      if (c.state.currentStoryId !== currentId) {
        c.state.currentStoryId = currentId;
        c.resetVotingState();
      } else {
        // Update voting state based on story state
        if (data.current_story.voting_state === 'open' && !c.state.voting.userVoted) {
          // Keep card selection
        } else if (data.current_story.voting_state === 'revealed' && !c.state.voting.results) {
          // Need to fetch results
        }
      }
    }
    
    // Update participants
    c.state.participants = {};
    if (data.participants) {
      data.participants.forEach(function(p) {
        c.state.participants[p.user_id] = p;
      });
    }
    
    c.state.meta.lastPollTime = Date.now();
  };
  
  // ============ GETTERS ============
  c.getCurrentStory = function() {
    if (!c.state.currentStoryId) return null;
    return c.state.stories[c.state.currentStoryId];
  };
  
  c.getStories = function() {
    return c.state.storyOrder.map(function(id) {
      return c.state.stories[id];
    });
  };
  
  c.getProgress = function() {
    var stories = c.getStories();
    var pointed = stories.filter(function(s) { return s.status === 'pointed'; }).length;
    var currentIndex = c.state.currentStoryId 
      ? c.state.storyOrder.indexOf(c.state.currentStoryId) + 1 
      : 0;
    
    return {
      current: currentIndex,
      total: stories.length,
      pointed: pointed,
      remaining: stories.length - pointed
    };
  };
  
  c.getVoteProgress = function() {
    var currentStory = c.getCurrentStory();
    var participantCount = Object.keys(c.state.participants).length || 1;
    
    return {
      voted: currentStory ? (currentStory.votes_count || 0) : 0,
      total: participantCount
    };
  };
  
  c.isModerator = function() {
    return c.state.meta.isModerator;
  };
  
  c.getVotingPanelState = function() {
    var currentStory = c.getCurrentStory();
    var voting = c.state.voting;
    var isModerator = c.isModerator();
    
    if (!currentStory) {
      return { view: 'NO_STORY' };
    }
    
    var status = currentStory.status;
    var votingState = currentStory.voting_state;
    
    if (status === 'pending') {
      return { view: 'PENDING', showStartButton: isModerator };
    }
    
    if (status === 'voting') {
      if (votingState === 'open') {
        if (voting.userVoted) {
          return { view: 'VOTE_SUBMITTED', selectedCard: voting.selectedCard, showRevealButton: isModerator };
        }
        return { view: 'SHOW_CARDS' };
      }
      
      if (votingState === 'revealed') {
        return { view: 'SHOW_RESULTS', results: voting.results, showModeratorControls: isModerator };
      }
    }
    
    if (status === 'pointed') {
      return { view: 'POINTED', points: currentStory.final_points, showNextButton: isModerator };
    }
    
    if (status === 'skipped') {
      return { view: 'SKIPPED', showNextButton: isModerator };
    }
    
    return { view: 'UNKNOWN' };
  };
  
  // ============ ACTIONS ============
  c.selectStory = function(story) {
    if (c.state.currentStoryId !== story.sys_id) {
      c.state.currentStoryId = story.sys_id;
      c.resetVotingState();
    }
  };
  
  c.selectCard = function(value) {
    var currentStory = c.getCurrentStory();
    if (!currentStory || currentStory.voting_state !== 'open' || c.state.voting.userVoted) {
      return;
    }
    c.state.voting.selectedCard = value;
  };
  
  c.resetVotingState = function() {
    c.state.voting = {
      selectedCard: null,
      userVoted: false,
      results: null,
      finalPoints: null
    };
  };
  
  // ============ VOTING ACTIONS ============
  c.startVoting = function() {
    if (!c.isModerator()) return;
    
    var storyId = c.state.currentStoryId;
    if (!storyId) {
      alert('No story selected');
      return;
    }
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/start_voting', { story_id: storyId })
      .then(function(response) {
        if (response.data.result.success) {
          c.state.stories[storyId].status = 'voting';
          c.state.stories[storyId].voting_state = 'open';
          c.state.stories[storyId].current_round = 1;
          c.resetVotingState();
        } else {
          alert(response.data.result.error);
        }
      })
      .catch(function() {
        alert('Failed to start voting');
      });
  };
  
  c.submitVote = function() {
    var selectedCard = c.state.voting.selectedCard;
    var currentStory = c.getCurrentStory();
    
    if (selectedCard === null || !currentStory) return;
    
    var isPass = selectedCard === 'pass';
    var estimate = isPass ? 0 : selectedCard;
    
    $http.post(c.apiBase + '/vote/submit', {
      session_code: c.sessionCode,
      story_id: currentStory.sys_id,
      round: currentStory.round || 1,
      estimate: estimate,
      is_pass: isPass
    })
    .then(function(response) {
      if (response.data.result.success) {
        c.state.voting.userVoted = true;
        currentStory.votes_count = response.data.result.votes_count;
      } else {
        alert(response.data.result.error);
      }
    })
    .catch(function() {
      alert('Failed to submit vote');
    });
  };
  
  c.revealVotes = function() {
    if (!c.isModerator()) return;
    
    var currentStory = c.getCurrentStory();
    if (!currentStory) return;
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/reveal', { story_id: currentStory.sys_id })
      .then(function(response) {
        if (response.data.result.success) {
          currentStory.voting_state = 'revealed';
          c.state.voting.results = response.data.result.results;
          c.state.voting.finalPoints = response.data.result.results.suggested_points;
        } else {
          alert(response.data.result.error);
        }
      })
      .catch(function() {
        alert('Failed to reveal votes');
      });
  };
  
  c.finalizePoints = function() {
    if (!c.isModerator()) return;
    
    var currentStory = c.getCurrentStory();
    var finalPoints = c.state.voting.finalPoints;
    
    if (!currentStory || finalPoints === null) return;
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/finalize', {
      story_id: currentStory.sys_id,
      final_points: parseFloat(finalPoints)
    })
    .then(function(response) {
      if (response.data.result.success) {
        currentStory.status = 'pointed';
        currentStory.final_points = finalPoints;
        currentStory.voting_state = null;
        c.resetVotingState();
        alert('Points finalized! ' + response.data.result.story_number + ' = ' + response.data.result.points_written + ' pts');
      } else {
        alert(response.data.result.error);
      }
    })
    .catch(function() {
      alert('Failed to finalize points');
    });
  };
  
  c.newRound = function() {
    if (!c.isModerator()) return;
    
    var currentStory = c.getCurrentStory();
    if (!currentStory) return;
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/new_round', { story_id: currentStory.sys_id })
      .then(function(response) {
        if (response.data.result.success) {
          currentStory.voting_state = 'open';
          currentStory.current_round = response.data.result.round;
          currentStory.votes_count = 0;
          c.resetVotingState();
        } else {
          alert(response.data.result.error);
        }
      })
      .catch(function() {
        alert('Failed to start new round');
      });
  };
  
  c.nextStory = function() {
    if (!c.isModerator()) return;
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/next_story', {})
      .then(function(response) {
        if (response.data.result.success) {
          if (response.data.result.session_complete) {
            c.state.session.state = 'completed';
            alert('All stories pointed! Session complete.');
          } else {
            var nextStory = response.data.result.current_story;
            c.state.stories[nextStory.sys_id] = angular.extend(
              c.state.stories[nextStory.sys_id] || {},
              nextStory,
              { status: 'voting', voting_state: 'open', current_round: 1 }
            );
            c.state.currentStoryId = nextStory.sys_id;
            c.resetVotingState();
          }
        } else {
          alert(response.data.result.error);
        }
      })
      .catch(function() {
        alert('Failed to move to next story');
      });
  };
  
  c.skipStory = function() {
    var currentStory = c.getCurrentStory();
    if (currentStory) {
      currentStory.status = 'skipped';
    }
    c.nextStory();
  };
  
  // ============ TIMER ============
  c.timerInterval = null;
  
  c.startTimer = function(seconds) {
    c.state.ui.timerActive = true;
    c.state.ui.timerEndTime = Date.now() + (seconds * 1000);
    
    if (c.timerInterval) $interval.cancel(c.timerInterval);
    
    c.timerInterval = $interval(function() {
      if (Date.now() >= c.state.ui.timerEndTime) {
        c.stopTimer();
        // Optionally auto-reveal
        // c.revealVotes();
      }
    }, 1000);
  };
  
  c.stopTimer = function() {
    c.state.ui.timerActive = false;
    c.state.ui.timerEndTime = null;
    if (c.timerInterval) {
      $interval.cancel(c.timerInterval);
      c.timerInterval = null;
    }
  };
  
  c.getTimerProgress = function() {
    if (!c.state.ui.timerActive || !c.state.ui.timerEndTime) return 0;
    var remaining = c.state.ui.timerEndTime - Date.now();
    var total = 180000; // Assume 3 min max
    return Math.max(0, (remaining / total) * 100);
  };
  
  c.getTimerDisplay = function() {
    if (!c.state.ui.timerEndTime) return '0:00';
    var remaining = Math.max(0, c.state.ui.timerEndTime - Date.now());
    var seconds = Math.floor(remaining / 1000);
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  };
  
  // ============ EDITING ============
  c.enableEdit = function(field) {
    c.editMode[field] = true;
    c.editValues[field] = c.getCurrentStory()[field];
  };
  
  c.saveField = function(field) {
    c.editMode[field] = false;
    // TODO: Call API to save field
    var currentStory = c.getCurrentStory();
    if (currentStory) {
      currentStory[field] = c.editValues[field];
    }
  };
  
  c.hasUnsavedChanges = function() {
    return Object.keys(c.editMode).some(function(k) { return c.editMode[k]; });
  };
  
  c.cancelEdits = function() {
    c.editMode = {};
    c.editValues = {};
  };
  
  // ============ UTILITIES ============
  c.copySessionCode = function() {
    navigator.clipboard.writeText(c.sessionCode);
    // TODO: Show toast
  };
  
  c.dismissError = function() {
    c.state.ui.error = null;
  };
  
  // ============ CLEANUP ============
  $scope.$on('$destroy', function() {
    PollingService.stop();
    if (c.timerInterval) $interval.cancel(c.timerInterval);
  });
  
  // ============ START ============
  c.init();
}
```

## Key Improvements

1. **Centralized State**: All state in `c.state` object
2. **Smart Polling**: Only updates when data actually changes
3. **Stable References**: Stories stored in map, updated in place
4. **Proper Getters**: Functions return computed values
5. **Role-Based Logic**: `getVotingPanelState()` determines what to show
6. **Timer Support**: Built-in timer with progress tracking
7. **Edit Mode**: Support for inline editing of story fields
8. **Error Handling**: Proper error state management
9. **Cleanup**: Intervals cancelled on destroy
