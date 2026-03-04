# Backend API Updates (V3)

This guide covers the backend API enhancements needed for V3 features.

## V3 Backend Enhancements

- Enhanced poll endpoint returns participant_count, timer_state, vote_results
- Story update endpoint for reference fields (Assignment Group, Assigned To, Sprint)
- Participant data includes photos for avatar display
- Timer state synchronized across all participants

## Implementation Steps

### Step 1: Update Get Session Endpoint

The existing GET `/session/{session_code}` endpoint needs to return additional V3 data.

1. Navigate to **Scripted REST API > Sprint Pointing API** in ServiceNow
2. Find the **Get Session** resource (GET `/session/{session_code}`)
3. Update the Script Include method `getSessionState` to include V3 fields

**Location**: Script Include `SprintPointingAPI`, method `getSessionState`

**Add these fields to the response**:

```javascript
// In SprintPointingAPI Script Include, getSessionState method

// After getting session data, add timer state
result.timer_active = sessionGR.getValue('timer_active') === 'true';
result.timer_remaining = parseInt(sessionGR.getValue('timer_remaining') || '0', 10);
result.timer_total = parseInt(sessionGR.getValue('timer_total') || '0', 10);

// Add participant count
result.participant_count = this._getParticipantCount(sessionId);

// Update participant data to include photos
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

**Add helper method for participant count**:

```javascript
// In SprintPointingAPI Script Include, add new method

_getParticipantCount: function(sessionId) {
    try {
        var voteGR = new GlideAggregate(this.voteTable);
        voteGR.addQuery('session_story.session', sessionId);
        voteGR.addAggregate('COUNT', 'DISTINCT', 'voter');
        voteGR.query();
        
        if (voteGR.next()) {
            return parseInt(voteGR.getAggregate('COUNT', 'DISTINCT', 'voter') || '0', 10);
        }
        return 0;
    } catch (e) {
        gs.error('Error getting participant count: ' + e.message);
        return 0;
    }
},
```

### Step 2: Update Reveal Votes Endpoint

The reveal endpoint needs to include voter photos in the results.

1. Find the **Reveal Votes** resource (POST `/session/{session_code}/reveal`)
2. Update to include voter photos in vote results

**Update the reveal endpoint**:

```javascript
// In the reveal endpoint, when building vote results

var votes = [];
var voteGR = new GlideRecord('x_1326913_sp_point_vote');
voteGR.addQuery('session_story', storyId);
voteGR.addQuery('round', currentRound);
voteGR.query();

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
    
    votes.push({
        voter_name: voterName,
        voter_photo: voterPhoto, // V3: Add photo
        estimate: isPass ? 'pass' : estimate
    });
}

// Include votes in results
results.votes = votes;
```

### Step 3: Create Story Update Endpoint

Create a new endpoint to update story reference fields.

1. In Studio, open your **Scripted REST API**
2. Click **New** under Resources
3. Fill in:
   - **Name**: Update Story Reference
   - **HTTP method**: PATCH
   - **Relative path**: `/story/{story_id}/reference`
4. Add this script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var storyId = request.pathParams.story_id;
    var requestBody = request.body.data;
    
    // Validate input
    if (!storyId || !requestBody) {
        return {
            success: false,
            error: 'Missing required parameters'
        };
    }
    
    // Use the StoryManager Script Include
    var storyManager = new x_1326913_sp_point.SprintPointingStoryManager();
    
    var updatedFields = [];
    var errors = [];
    
    // Process each field in the request
    for (var fieldName in requestBody) {
        var referenceId = requestBody[fieldName];
        
        // Validate field is a reference field
        var validFields = ['assignment_group', 'assigned_to', 'sprint'];
        if (validFields.indexOf(fieldName) === -1) {
            errors.push('Invalid field: ' + fieldName);
            continue;
        }
        
        // Update the field
        var success = storyManager.updateStoryReference(storyId, fieldName, referenceId);
        
        if (success) {
            updatedFields.push(fieldName);
        } else {
            errors.push('Failed to update ' + fieldName);
        }
    }
    
    return {
        success: errors.length === 0,
        updated_fields: updatedFields,
        errors: errors.length > 0 ? errors : undefined
    };

})(request, response);
```

### Step 4: Add Timer State Fields to Session Table

Add timer fields to the session table if they don't exist.

1. Navigate to **System Definition > Tables** in ServiceNow
2. Find table `x_1326913_sp_point_refinement_session`
3. Add these fields if they don't exist:

**Field 1: timer_active**
- Type: True/False
- Column name: timer_active
- Default value: false

**Field 2: timer_remaining**
- Type: Integer
- Column name: timer_remaining
- Default value: 0

**Field 3: timer_total**
- Type: Integer
- Column name: timer_total
- Default value: 0

### Step 5: Update Start Timer Endpoint

Create or update the timer endpoint to store timer state.

1. Create a new REST resource or update existing timer logic
2. **Name**: Start Timer
3. **HTTP method**: POST
4. **Relative path**: `/session/{session_code}/timer/start`
5. Script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var requestBody = request.body.data;
    var seconds = parseInt(requestBody.seconds || '0', 10);
    
    if (seconds <= 0) {
        return {
            success: false,
            error: 'Invalid timer duration'
        };
    }
    
    // Verify moderator
    var currentUser = gs.getUserID();
    var sessionGR = new GlideRecord('x_1326913_sp_point_refinement_session');
    sessionGR.addQuery('session_code', sessionCode);
    sessionGR.query();
    
    if (!sessionGR.next()) {
        return { success: false, error: 'Session not found' };
    }
    
    if (sessionGR.getValue('moderator') != currentUser) {
        return { success: false, error: 'Only moderator can start timer' };
    }
    
    // Update timer state
    sessionGR.setValue('timer_active', true);
    sessionGR.setValue('timer_remaining', seconds);
    sessionGR.setValue('timer_total', seconds);
    sessionGR.update();
    
    return {
        success: true,
        timer_active: true,
        timer_remaining: seconds,
        timer_total: seconds
    };

})(request, response);
```

### Step 6: Update Stop Timer Endpoint

Create endpoint to stop the timer.

1. **Name**: Stop Timer
2. **HTTP method**: POST
3. **Relative path**: `/session/{session_code}/timer/stop`
4. Script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    
    // Verify moderator
    var currentUser = gs.getUserID();
    var sessionGR = new GlideRecord('x_1326913_sp_point_refinement_session');
    sessionGR.addQuery('session_code', sessionCode);
    sessionGR.query();
    
    if (!sessionGR.next()) {
        return { success: false, error: 'Session not found' };
    }
    
    if (sessionGR.getValue('moderator') != currentUser) {
        return { success: false, error: 'Only moderator can stop timer' };
    }
    
    // Clear timer state
    sessionGR.setValue('timer_active', false);
    sessionGR.setValue('timer_remaining', 0);
    sessionGR.update();
    
    return {
        success: true,
        timer_active: false
    };

})(request, response);
```

### Step 7: Add Timer Countdown Logic

Add a scheduled job to decrement timer_remaining every second.

**Option A: Client-side countdown (recommended)**
- Timer countdown happens in client controller
- Server only stores start time and duration
- Polling syncs timer state

**Option B: Server-side countdown**
- Create a scheduled script execution
- Runs every second
- Decrements timer_remaining for active timers
- More accurate but higher server load

For V3, we recommend **Option A** (client-side countdown with server sync), which is already implemented in the client controller.

## Testing

### Test Enhanced Poll Endpoint

```
GET /api/x_1326913_sp_point/sprint_pointing_api/session/YOUR_SESSION_CODE
```

Expected response should include:
```json
{
  "success": true,
  "timer_active": true,
  "timer_remaining": 120,
  "timer_total": 180,
  "participant_count": 5,
  "participants": [
    {
      "user_id": "abc123",
      "name": "John Doe",
      "photo": "photo_sys_id_or_null",
      "has_voted": true
    }
  ]
}
```

### Test Story Update Endpoint

```
PATCH /api/x_1326913_sp_point/sprint_pointing_api/story/STORY_SYS_ID/reference
Body: {
  "assignment_group": "group_sys_id",
  "assigned_to": "user_sys_id",
  "sprint": "sprint_sys_id"
}
```

Expected response:
```json
{
  "success": true,
  "updated_fields": ["assignment_group", "assigned_to", "sprint"]
}
```

### Test Timer Endpoints

Start timer:
```
POST /api/x_1326913_sp_point/sprint_pointing_api/session/YOUR_SESSION_CODE/timer/start
Body: { "seconds": 120 }
```

Stop timer:
```
POST /api/x_1326913_sp_point/sprint_pointing_api/session/YOUR_SESSION_CODE/timer/stop
```

## Summary of New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/story/{id}/reference` | Update story reference fields |
| POST | `/session/{code}/timer/start` | Start timer for session |
| POST | `/session/{code}/timer/stop` | Stop timer for session |

## Updated Endpoints

| Method | Path | V3 Changes |
|--------|------|------------|
| GET | `/session/{code}` | Returns timer_state, participant_count, participant photos, has_voted status |
| POST | `/session/{code}/reveal` | Returns voter photos in vote results |

## Requirements Validated

- 4.3: Timer state in API response ✓
- 6.1: Participant count in API ✓
- 6.3: Participant photos in API ✓
- 8.2: Story reference update endpoint ✓
- 9.1: Vote results include voter data ✓
