# V3 Fixes for Failing Features

This guide fixes the features that are currently failing.

## Issues to Fix

1. ❌ Timer visible to all participants - FAIL
2. ❌ Participant avatars with initials - FAIL  
3. ❌ Vote results visible to all - FAIL
4. ⚠️ Reference fields editable - Need dropdown selectors instead of text fields

---

## Fix 1: Timer Visible to All Participants

**Problem**: Timer only shows for moderator, not syncing to other participants.

**Root Cause**: Backend API doesn't return timer state, and client doesn't sync timer from server.

### Backend Fix

Update your `SprintPointingAPI` Script Include, in the `getSessionState` method:

```javascript
// In SprintPointingAPI Script Include, getSessionState method
// Add after getting session data:

// V3: Add timer state to response
result.timer_active = sessionGR.getValue('timer_active') === 'true';
result.timer_remaining = parseInt(sessionGR.getValue('timer_remaining') || '0', 10);
result.timer_total = parseInt(sessionGR.getValue('timer_total') || '0', 10);
```

### Client Controller Fix

Add this method to your client controller (after the `stopTimer` method):

```javascript
// V3: Sync timer from server data (for non-moderators)
c.syncTimer = function(remainingSeconds, totalSeconds) {
  if (remainingSeconds > 0) {
    c.state.ui.timerActive = true;
    c.state.ui.timerEndTime = Date.now() + (remainingSeconds * 1000);
    
    if (!c.timerInterval) {
      c.timerInterval = $interval(function() {
        if (Date.now() >= c.state.ui.timerEndTime) {
          c.stopTimer();
        }
      }, 1000);
    }
  } else {
    c.stopTimer();
  }
};
```

Update `applySessionData` method to call `syncTimer`:

```javascript
// In applySessionData method, add at the end (before c.state.meta.lastPollTime):

// V3: Update timer state for all participants
if (data.timer_active) {
  c.syncTimer(data.timer_remaining, data.timer_total);
} else {
  c.stopTimer();
}
```

Update `detectChanges` in PollingService to detect timer changes:

```javascript
// In PollingService.detectChanges, add after round check:

// V3: Check timer state changes
if (old.timer_active !== newData.timer_active) return true;
if (old.timer_remaining !== newData.timer_remaining) return true;
```

---

## Fix 2: Participant Avatars with Initials

**Problem**: Avatars not showing, `getInitials()` method missing.

### Client Controller Fix

Add the `getInitials` method to your client controller (in the GETTERS section):

```javascript
// V3: Get initials from name for avatar fallback
c.getInitials = function(name) {
  if (!name) return '?';
  var parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
```

### Backend Fix

Update `applySessionData` to include photo data:

```javascript
// In applySessionData method, update participants section:

// V3: Update participants with avatar data
c.state.participants = {};
if (data.participants) {
  data.participants.forEach(function(p) {
    c.state.participants[p.user_id] = {
      name: p.name,
      photo: p.photo || null,
      has_voted: p.has_voted || false
    };
  });
}
```

Update your backend API to return photo field. In `SprintPointingAPI` Script Include:

```javascript
// In getSessionState method, when building participants array:

var participantGR = new GlideAggregate(this.voteTable);
participantGR.addQuery('session_story.session', sessionId);
participantGR.groupBy('voter');
participantGR.query();

result.participants = [];
while (participantGR.next()) {
    var voterId = participantGR.getValue('voter');
    var userGR = new GlideRecord('sys_user');
    if (userGR.get(voterId)) {
        result.participants.push({
            user_id: voterId,
            name: userGR.getValue('name'),
            photo: userGR.getValue('photo') || null, // V3: Add photo field
            has_voted: false // Will be updated below
        });
    }
}

// Track who has voted for current story
if (result.current_story) {
    var currentStoryId = result.current_story.sys_id;
    var currentRound = result.current_story.round || 1;
    
    var voteGR = new GlideRecord(this.voteTable);
    voteGR.addQuery('session_story', currentStoryId);
    voteGR.addQuery('round', currentRound);
    voteGR.query();
    
    var voterIds = [];
    while (voteGR.next()) {
        voterIds.push(voteGR.getValue('voter'));
    }
    
    // Update has_voted status
    result.participants.forEach(function(p) {
        p.has_voted = voterIds.indexOf(p.user_id) !== -1;
    });
}
```

---

## Fix 3: Vote Results Visible to All

**Problem**: Results only show for moderator.

### Root Cause

The `getVotingPanelState()` method has this line:

```javascript
return { view: 'SHOW_RESULTS', results: voting.results, showModeratorControls: isModerator };
```

This is correct - it returns `SHOW_RESULTS` for everyone. The issue is that `voting.results` is null for non-moderators.

### Client Controller Fix

Update the `revealVotes` method to work for all users:

```javascript
c.revealVotes = function() {
  if (!c.isModerator()) return;
  
  var currentStory = c.getCurrentStory();
  if (!currentStory) return;
  
  $http.post(c.apiBase + '/session/' + c.sessionCode + '/reveal', { story_id: currentStory.sys_id })
    .then(function(response) {
      if (response.data.result.success) {
        currentStory.voting_state = 'revealed';
        // V3: Results now include voter photos for avatar display
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
```

Update `applySessionData` to fetch results for non-moderators:

```javascript
// In applySessionData method, after updating current story:

// V3: If voting is revealed, fetch results for all participants
if (data.current_story && data.current_story.voting_state === 'revealed') {
  if (!c.state.voting.results) {
    // Fetch results if we don't have them yet
    c.fetchResults(data.current_story.sys_id);
  }
}
```

Add new method to fetch results:

```javascript
// Add this new method after revealVotes:

c.fetchResults = function(storyId) {
  $http.get(c.apiBase + '/session/' + c.sessionCode + '/results/' + storyId)
    .then(function(response) {
      if (response.data.result && response.data.result.success) {
        c.state.voting.results = response.data.result.results;
        c.state.voting.finalPoints = response.data.result.results.suggested_points;
      }
    })
    .catch(function(error) {
      console.error('Failed to fetch results:', error);
    });
};
```

### Backend Fix

Create a new GET endpoint for results. In your Scripted REST API:

1. **Name**: Get Results
2. **HTTP method**: GET
3. **Relative path**: `/session/{session_code}/results/{story_id}`
4. **Script**:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var storyId = request.pathParams.story_id;
    
    // Get session
    var sessionGR = new GlideRecord('x_1326913_sp_point_refinement_session');
    sessionGR.addQuery('session_code', sessionCode);
    sessionGR.query();
    
    if (!sessionGR.next()) {
        return { success: false, error: 'Session not found' };
    }
    
    // Get story
    var storyGR = new GlideRecord('x_1326913_sp_point_session_story');
    if (!storyGR.get(storyId)) {
        return { success: false, error: 'Story not found' };
    }
    
    // Check if voting is revealed
    if (storyGR.getValue('voting_state') !== 'revealed') {
        return { success: false, error: 'Voting not revealed yet' };
    }
    
    var currentRound = parseInt(storyGR.getValue('current_round') || '1', 10);
    
    // Get all votes for this story/round
    var votes = [];
    var voteGR = new GlideRecord('x_1326913_sp_point_vote');
    voteGR.addQuery('session_story', storyId);
    voteGR.addQuery('round', currentRound);
    voteGR.query();
    
    var estimates = [];
    while (voteGR.next()) {
        var voterId = voteGR.getValue('voter');
        var voterName = voteGR.getDisplayValue('voter');
        
        // V3: Get voter photo
        var voterPhoto = null;
        var userGR = new GlideRecord('sys_user');
        if (userGR.get(voterId)) {
            voterPhoto = userGR.getValue('photo') || null;
        }
        
        var estimate = voteGR.getValue('estimate');
        var isPass = voteGR.getValue('is_pass') === 'true';
        
        var voteValue = isPass ? 'pass' : parseFloat(estimate);
        
        votes.push({
            voter_name: voterName,
            voter_photo: voterPhoto,
            estimate: isPass ? 'pass' : estimate
        });
        
        if (!isPass) {
            estimates.push(voteValue);
        }
    }
    
    // Calculate results
    var results = {
        votes: votes,
        distribution: {},
        suggested_points: 0,
        has_consensus: false
    };
    
    // Build distribution
    votes.forEach(function(vote) {
        var val = vote.estimate;
        results.distribution[val] = (results.distribution[val] || 0) + 1;
    });
    
    // Calculate suggested points (median of non-pass votes)
    if (estimates.length > 0) {
        estimates.sort(function(a, b) { return a - b; });
        var mid = Math.floor(estimates.length / 2);
        results.suggested_points = estimates.length % 2 === 0
            ? (estimates[mid - 1] + estimates[mid]) / 2
            : estimates[mid];
        
        // Check consensus (all votes same)
        results.has_consensus = estimates.every(function(e) { return e === estimates[0]; });
    }
    
    return {
        success: true,
        results: results
    };

})(request, response);
```

---

## Fix 4: Reference Fields as Dropdowns

**Problem**: Reference fields are text inputs, but you want dropdowns with actual data.

### Solution: Use ServiceNow Reference Fields

Replace the text inputs with proper reference field lookups.

#### HTML Changes

Replace the reference field sections in your HTML:

```html
<!-- Assignment Group with Dropdown -->
<div class="metadata-item">
  <label>Assignment Group</label>
  <div class="metadata-value" ng-if="!c.editMode.assignment_group">
    {{c.getCurrentStory().assignment_group || 'Unassigned'}}
    <button class="btn-edit" ng-click="c.enableEdit('assignment_group')" ng-if="c.isModerator()">
      <i class="fa fa-pencil"></i>
    </button>
  </div>
  <div ng-if="c.editMode.assignment_group" class="edit-field">
    <select class="form-control form-control-sm"
            ng-model="c.editValues.assignment_group_id"
            ng-options="group.sys_id as group.name for group in c.assignmentGroups">
      <option value="">-- Select Group --</option>
    </select>
    <button class="btn btn-sm btn-success" ng-click="c.saveField('assignment_group')">
      <i class="fa fa-check"></i>
    </button>
    <button class="btn btn-sm btn-default" ng-click="c.cancelEdit('assignment_group')">
      <i class="fa fa-times"></i>
    </button>
  </div>
</div>

<!-- Assigned To with Dropdown -->
<div class="metadata-item">
  <label>Assigned To</label>
  <div class="metadata-value" ng-if="!c.editMode.assigned_to">
    {{c.getCurrentStory().assigned_to || 'Unassigned'}}
    <button class="btn-edit" ng-click="c.enableEdit('assigned_to')" ng-if="c.isModerator()">
      <i class="fa fa-pencil"></i>
    </button>
  </div>
  <div ng-if="c.editMode.assigned_to" class="edit-field">
    <select class="form-control form-control-sm"
            ng-model="c.editValues.assigned_to_id"
            ng-options="user.sys_id as user.name for user in c.users">
      <option value="">-- Select User --</option>
    </select>
    <button class="btn btn-sm btn-success" ng-click="c.saveField('assigned_to')">
      <i class="fa fa-check"></i>
    </button>
    <button class="btn btn-sm btn-default" ng-click="c.cancelEdit('assigned_to')">
      <i class="fa fa-times"></i>
    </button>
  </div>
</div>

<!-- Sprint with Dropdown -->
<div class="metadata-item">
  <label>Sprint</label>
  <div class="metadata-value" ng-if="!c.editMode.sprint">
    {{c.getCurrentStory().sprint || 'N/A'}}
    <button class="btn-edit" ng-click="c.enableEdit('sprint')" ng-if="c.isModerator()">
      <i class="fa fa-pencil"></i>
    </button>
  </div>
  <div ng-if="c.editMode.sprint" class="edit-field">
    <select class="form-control form-control-sm"
            ng-model="c.editValues.sprint_id"
            ng-options="sprint.sys_id as sprint.name for sprint in c.sprints">
      <option value="">-- Select Sprint --</option>
    </select>
    <button class="btn btn-sm btn-success" ng-click="c.saveField('sprint')">
      <i class="fa fa-check"></i>
    </button>
    <button class="btn btn-sm btn-default" ng-click="c.cancelEdit('sprint')">
      <i class="fa fa-times"></i>
    </button>
  </div>
</div>
```

#### Client Controller Changes

Add data arrays and update methods:

```javascript
// Add to state initialization:
c.assignmentGroups = [];
c.users = [];
c.sprints = [];

// Add method to load reference data:
c.loadReferenceData = function() {
  // Load assignment groups
  $http.get(c.apiBase + '/reference/groups')
    .then(function(response) {
      if (response.data.result && response.data.result.success) {
        c.assignmentGroups = response.data.result.groups;
      }
    });
  
  // Load users
  $http.get(c.apiBase + '/reference/users')
    .then(function(response) {
      if (response.data.result && response.data.result.success) {
        c.users = response.data.result.users;
      }
    });
  
  // Load sprints
  $http.get(c.apiBase + '/reference/sprints')
    .then(function(response) {
      if (response.data.result && response.data.result.success) {
        c.sprints = response.data.result.sprints;
      }
    });
};

// Call in init:
c.init = function() {
  if (!c.sessionCode) {
    c.state.ui.error = 'No session code provided';
    c.state.ui.loading = false;
    return;
  }
  
  c.loadSession();
  c.loadReferenceData(); // Add this line
  
  PollingService.start(function(newData) {
    c.applySessionData(newData);
  }, 2000);
};

// Update enableEdit to store sys_id:
c.enableEdit = function(field) {
  c.editMode[field] = true;
  var currentStory = c.getCurrentStory();
  
  // Store the sys_id for reference fields
  if (field === 'assignment_group') {
    c.editValues.assignment_group_id = currentStory.assignment_group_id || '';
  } else if (field === 'assigned_to') {
    c.editValues.assigned_to_id = currentStory.assigned_to_id || '';
  } else if (field === 'sprint') {
    c.editValues.sprint_id = currentStory.sprint_id || '';
  } else {
    c.editValues[field] = currentStory[field];
  }
};

// Update saveField to use sys_id:
c.saveField = function(field) {
  c.editMode[field] = false;
  var currentStory = c.getCurrentStory();
  
  if (!currentStory) return;
  
  var updates = {};
  
  // Map field to sys_id
  if (field === 'assignment_group') {
    updates.assignment_group = c.editValues.assignment_group_id;
  } else if (field === 'assigned_to') {
    updates.assigned_to = c.editValues.assigned_to_id;
  } else if (field === 'sprint') {
    updates.sprint = c.editValues.sprint_id;
  } else {
    updates[field] = c.editValues[field];
  }
  
  $http.patch(c.apiBase + '/story/' + currentStory.sys_id, updates)
    .then(function(response) {
      if (response.data.result.success) {
        // Update display value
        currentStory[field] = response.data.result.display_value;
        currentStory[field + '_id'] = updates[field];
      } else {
        alert('Failed to update field: ' + response.data.result.error);
      }
    })
    .catch(function() {
      alert('Failed to update field');
    });
};

// Add cancelEdit method:
c.cancelEdit = function(field) {
  c.editMode[field] = false;
  delete c.editValues[field];
  delete c.editValues[field + '_id'];
};
```

#### Backend API Endpoints

Create 3 new GET endpoints for reference data:

**1. Get Assignment Groups**
- Path: `/reference/groups`
- Method: GET

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var groups = [];
    var gr = new GlideRecord('sys_user_group');
    gr.addQuery('active', true);
    gr.orderBy('name');
    gr.setLimit(100);
    gr.query();
    
    while (gr.next()) {
        groups.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name')
        });
    }
    
    return { success: true, groups: groups };
})(request, response);
```

**2. Get Users**
- Path: `/reference/users`
- Method: GET

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var users = [];
    var gr = new GlideRecord('sys_user');
    gr.addQuery('active', true);
    gr.orderBy('name');
    gr.setLimit(100);
    gr.query();
    
    while (gr.next()) {
        users.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name')
        });
    }
    
    return { success: true, users: users };
})(request, response);
```

**3. Get Sprints**
- Path: `/reference/sprints`
- Method: GET

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var sprints = [];
    var gr = new GlideRecord('rm_sprint');
    gr.addQuery('state', '!=', 'closed');
    gr.orderByDesc('start_date');
    gr.setLimit(50);
    gr.query();
    
    while (gr.next()) {
        sprints.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('short_description') || gr.getValue('number')
        });
    }
    
    return { success: true, sprints: sprints };
})(request, response);
```

---

## Testing After Fixes

### Test Timer
1. Open session in 2 browsers (moderator + participant)
2. Moderator: Start timer
3. Participant: Verify timer appears and counts down

### Test Avatars
1. Have multiple users vote
2. Check participant list shows avatars or initials
3. Verify initials are correct (first + last name)

### Test Vote Results
1. Reveal votes as moderator
2. Open session as participant
3. Verify participant can see all individual votes

### Test Reference Dropdowns
1. Click edit on Assignment Group
2. Verify dropdown shows actual groups
3. Select a group and save
4. Verify it persists

---

## Summary

All fixes are now provided. Apply them in this order:

1. Backend API updates (timer state, participant photos, results endpoint, reference endpoints)
2. Client controller updates (syncTimer, getInitials, fetchResults, reference data loading)
3. HTML updates (reference field dropdowns)

This will fix all failing features!
