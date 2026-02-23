# Backend Updates (v2)

## New API Endpoints Needed

Add these resources to your Scripted REST API.

---

## 1. Start Voting Endpoint

### Create REST Resource

1. In Studio, open your **Scripted REST API**
2. Click **New** under Resources
3. Fill in:
   - **Name**: Start Voting
   - **HTTP method**: POST
   - **Relative path**: `/session/{session_code}/start_voting`
4. Add this script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var requestBody = request.body.data;
    var storyId = requestBody.story_id;
    
    // Verify moderator
    var currentUser = gs.getUserID();
    var sessionGR = new GlideRecord('x_1326913_sp_point_refinement_session');
    sessionGR.addQuery('session_code', sessionCode);
    sessionGR.query();
    
    if (!sessionGR.next()) {
        return { success: false, error: 'Session not found' };
    }
    
    if (sessionGR.getValue('moderator') != currentUser) {
        return { success: false, error: 'Only moderator can start voting' };
    }
    
    // Update session story
    var storyGR = new GlideRecord('x_1326913_sp_point_session_story');
    if (!storyGR.get(storyId)) {
        return { success: false, error: 'Story not found' };
    }
    
    storyGR.setValue('status', 'voting');
    storyGR.setValue('voting_state', 'open');
    storyGR.setValue('current_round', 1);
    storyGR.update();
    
    // Update session's current story
    sessionGR.setValue('current_story', storyId);
    sessionGR.setValue('state', 'active');
    sessionGR.update();
    
    return {
        success: true,
        story_id: storyId,
        status: 'voting',
        voting_state: 'open'
    };

})(request, response);
```

---

## 2. Get Sprints Endpoint

### Create REST Resource

1. **Name**: Get Sprints
2. **HTTP method**: GET
3. **Relative path**: `/sprints`
4. Script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sprints = [];
    
    var sprintGR = new GlideRecord('rm_sprint');
    sprintGR.addQuery('state', '!=', 'closed'); // Only active/planning sprints
    sprintGR.orderByDesc('start_date');
    sprintGR.setLimit(20);
    sprintGR.query();
    
    while (sprintGR.next()) {
        sprints.push({
            sys_id: sprintGR.getUniqueValue(),
            name: sprintGR.getValue('short_description') || sprintGR.getValue('number'),
            number: sprintGR.getValue('number'),
            start_date: sprintGR.getValue('start_date'),
            end_date: sprintGR.getValue('end_date'),
            state: sprintGR.getValue('state')
        });
    }
    
    return {
        success: true,
        sprints: sprints
    };

})(request, response);
```

---

## 3. Get Sprint Stories Endpoint

### Create REST Resource

1. **Name**: Get Sprint Stories
2. **HTTP method**: GET
3. **Relative path**: `/sprint/{sprint_id}/stories`
4. Script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sprintId = request.pathParams.sprint_id;
    var stories = [];
    
    var storyGR = new GlideRecord('rm_story');
    storyGR.addQuery('sprint', sprintId);
    storyGR.orderBy('order');
    storyGR.query();
    
    while (storyGR.next()) {
        stories.push({
            sys_id: storyGR.getUniqueValue(),
            number: storyGR.getValue('number'),
            short_description: storyGR.getValue('short_description'),
            description: storyGR.getValue('description'),
            acceptance_criteria: storyGR.getValue('acceptance_criteria'),
            story_points: storyGR.getValue('story_points'),
            state: storyGR.getValue('state'),
            assigned_to: storyGR.getDisplayValue('assigned_to'),
            assignment_group: storyGR.getDisplayValue('assignment_group')
        });
    }
    
    return {
        success: true,
        sprint_id: sprintId,
        stories: stories
    };

})(request, response);
```

---

## 4. Update Story Endpoint

### Create REST Resource

1. **Name**: Update Story
2. **HTTP method**: PATCH
3. **Relative path**: `/story/{story_id}`
4. Script:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var storyId = request.pathParams.story_id;
    var updates = request.body.data;
    
    // Get the session story to find the actual rm_story
    var sessionStoryGR = new GlideRecord('x_1326913_sp_point_session_story');
    if (!sessionStoryGR.get(storyId)) {
        return { success: false, error: 'Session story not found' };
    }
    
    var rmStoryId = sessionStoryGR.getValue('story');
    
    // Update the actual story
    var storyGR = new GlideRecord('rm_story');
    if (!storyGR.get(rmStoryId)) {
        return { success: false, error: 'Story not found' };
    }
    
    // Allowed fields to update
    var allowedFields = ['short_description', 'description', 'acceptance_criteria', 'assigned_to', 'assignment_group'];
    
    for (var field in updates) {
        if (allowedFields.indexOf(field) !== -1) {
            storyGR.setValue(field, updates[field]);
        }
    }
    
    storyGR.update();
    
    return {
        success: true,
        story_id: storyId,
        updated_fields: Object.keys(updates)
    };

})(request, response);
```

---

## 5. Update Script Include - Add More Story Fields

Update your `SprintPointingAPI` Script Include to return more story fields.

Find the `getSessionState` function and update the story data section:

```javascript
// In getSessionState(), update the story data retrieval:

// Get story details from rm_story
var rmStoryGR = new GlideRecord('rm_story');
if (rmStoryGR.get(storyGR.getValue('story'))) {
    storyData.number = rmStoryGR.getValue('number');
    storyData.short_description = rmStoryGR.getValue('short_description');
    storyData.description = rmStoryGR.getValue('description');
    storyData.acceptance_criteria = rmStoryGR.getValue('acceptance_criteria');
    storyData.state = rmStoryGR.getDisplayValue('state');
    storyData.current_points = rmStoryGR.getValue('story_points');
    storyData.type = rmStoryGR.getDisplayValue('type');
    
    // Additional fields for v2
    storyData.assignment_group = rmStoryGR.getDisplayValue('assignment_group');
    storyData.assigned_to = rmStoryGR.getDisplayValue('assigned_to');
    storyData.opened = rmStoryGR.getValue('sys_created_on');
    storyData.opened_by = rmStoryGR.getDisplayValue('sys_created_by');
    storyData.sprint = rmStoryGR.getDisplayValue('sprint');
    storyData.priority = rmStoryGR.getDisplayValue('priority');
}
```

---

## 6. Update Participant Tracking

Update the `getSessionState` function to track who has voted:

```javascript
// After getting participants, check who has voted for current story
if (result.current_story) {
    var currentStoryId = result.current_story.sys_id;
    var currentRound = result.current_story.round || 1;
    
    // Get votes for current story/round
    var voteGR = new GlideRecord('x_1326913_sp_point_vote');
    voteGR.addQuery('session_story', currentStoryId);
    voteGR.addQuery('round', currentRound);
    voteGR.query();
    
    var voterIds = [];
    while (voteGR.next()) {
        voterIds.push(voteGR.getValue('voter'));
    }
    
    // Update participant has_voted status
    result.participants.forEach(function(p) {
        p.has_voted = voterIds.indexOf(p.user_id) !== -1;
    });
}
```

---

## 7. Server Script Update

Update your widget's Server Script to handle sprint selection:

```javascript
(function() {
    // Get session code from URL parameter
    var sessionCode = $sp.getParameter('session');
    
    if (sessionCode) {
        data.session_code = sessionCode;
    }
    
    // Handle server-side actions
    if (input && input.action) {
        switch (input.action) {
            case 'getSprints':
                data.sprints = getSprints();
                break;
                
            case 'getSprintStories':
                data.stories = getSprintStories(input.sprint_id);
                break;
                
            case 'createSession':
                data.session = createSession(input.name, input.story_ids, input.sprint_id);
                break;
        }
    }
    
    function getSprints() {
        var sprints = [];
        var gr = new GlideRecord('rm_sprint');
        gr.addQuery('state', '!=', 'closed');
        gr.orderByDesc('start_date');
        gr.setLimit(20);
        gr.query();
        
        while (gr.next()) {
            sprints.push({
                sys_id: gr.getUniqueValue(),
                name: gr.getValue('short_description') || gr.getValue('number'),
                state: gr.getValue('state')
            });
        }
        return sprints;
    }
    
    function getSprintStories(sprintId) {
        var stories = [];
        var gr = new GlideRecord('rm_story');
        gr.addQuery('sprint', sprintId);
        gr.orderBy('order');
        gr.query();
        
        while (gr.next()) {
            stories.push({
                sys_id: gr.getUniqueValue(),
                number: gr.getValue('number'),
                short_description: gr.getValue('short_description'),
                story_points: gr.getValue('story_points')
            });
        }
        return stories;
    }
    
    function createSession(name, storyIds, sprintId) {
        var api = new x_1326913_sp_point.SprintPointingAPI();
        return api.createSession(name, storyIds, sprintId);
    }
})();
```

---

## Summary of New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/session/{code}/start_voting` | Start voting on a story |
| GET | `/sprints` | Get available sprints |
| GET | `/sprint/{id}/stories` | Get stories in a sprint |
| PATCH | `/story/{id}` | Update story fields |

## Updated Endpoints

| Method | Path | Changes |
|--------|------|---------|
| GET | `/session/{code}` | Returns more story fields, participant vote status |

---

## Testing the New Endpoints

### Test Start Voting
```
POST /api/x_1326913_sp_point/sprint_pointing_api/session/GNHDWS/start_voting
Body: { "story_id": "your_session_story_sys_id" }
```

### Test Get Sprints
```
GET /api/x_1326913_sp_point/sprint_pointing_api/sprints
```

### Test Get Sprint Stories
```
GET /api/x_1326913_sp_point/sprint_pointing_api/sprint/your_sprint_sys_id/stories
```
