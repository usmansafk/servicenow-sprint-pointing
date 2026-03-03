# V2 Quick Reference - Where to Make Changes

## Backend Changes (ServiceNow Studio)

### 1. Script Include: SprintPointingAPI

**Location**: Studio > Server Development > Script Includes > SprintPointingAPI

**Changes to make**:

#### Change A: Add more story fields
**Find**: The `getSessionState` function, look for this section:
```javascript
var rmStoryGR = new GlideRecord('rm_story');
if (rmStoryGR.get(storyGR.getValue('story'))) {
    storyData.number = rmStoryGR.getValue('number');
    storyData.short_description = rmStoryGR.getValue('short_description');
    // ... existing fields ...
```

**Add after existing fields**:
```javascript
    // Additional fields for v2
    storyData.assignment_group = rmStoryGR.getDisplayValue('assignment_group');
    storyData.assigned_to = rmStoryGR.getDisplayValue('assigned_to');
    storyData.opened = rmStoryGR.getValue('sys_created_on');
    storyData.opened_by = rmStoryGR.getDisplayValue('sys_created_by');
    storyData.sprint = rmStoryGR.getDisplayValue('sprint');
    storyData.priority = rmStoryGR.getDisplayValue('priority');
}
```

#### Change B: Add participant vote tracking
**Find**: End of `getSessionState` function, just before `return result;`

**Add this code block**:
```javascript
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
    
    result.participants.forEach(function(p) {
        p.has_voted = voterIds.indexOf(p.user_id) !== -1;
    });
}
```

---

### 2. Scripted REST API: Sprint Pointing API

**Location**: Studio > Web Services > Scripted REST API > Sprint Pointing API

**Add 4 new resources** (click "New" under Resources for each):

#### Resource 1: Start Voting
- Name: `Start Voting`
- HTTP method: `POST`
- Relative path: `/session/{session_code}/start_voting`
- Script: See `08_BACKEND_UPDATES.md` section 1

#### Resource 2: Get Sprints
- Name: `Get Sprints`
- HTTP method: `GET`
- Relative path: `/sprints`
- Script: See `08_BACKEND_UPDATES.md` section 2

#### Resource 3: Get Sprint Stories
- Name: `Get Sprint Stories`
- HTTP method: `GET`
- Relative path: `/sprint/{sprint_id}/stories`
- Script: See `08_BACKEND_UPDATES.md` section 3

#### Resource 4: Update Story
- Name: `Update Story`
- HTTP method: `PATCH`
- Relative path: `/story/{story_id}`
- Script: See `08_BACKEND_UPDATES.md` section 4

---

## Frontend Changes (Widget: Sprint Pointing App)

**Location**: Studio > Service Portal > Widgets > Sprint Pointing App

### 1. HTML Template

**Action**: REPLACE entire HTML Template
**Source**: Copy from `05_UPDATED_HTML.md`
**Size**: ~400 lines

### 2. CSS

**Action**: REPLACE entire CSS
**Source**: Copy from `06_UPDATED_CSS.md`
**Size**: ~600 lines

### 3. Client Controller

**Action**: REPLACE entire Client Controller
**Source**: Copy from `07_UPDATED_CLIENT.md`
**Size**: ~400 lines

### 4. Server Script

**Action**: REPLACE entire Server Script
**Source**: Copy from `08_BACKEND_UPDATES.md` section 7
**Size**: ~60 lines

---

## Implementation Checklist

### Backend (30 minutes)
- [ ] Open SprintPointingAPI Script Include
- [ ] Add story fields (Change A)
- [ ] Add participant tracking (Change B)
- [ ] Save Script Include
- [ ] Open Scripted REST API
- [ ] Create "Start Voting" resource
- [ ] Create "Get Sprints" resource
- [ ] Create "Get Sprint Stories" resource
- [ ] Create "Update Story" resource
- [ ] Test new endpoints in REST API Explorer

### Frontend (30 minutes)
- [ ] Open Sprint Pointing App widget
- [ ] Replace HTML Template
- [ ] Replace CSS
- [ ] Replace Client Controller
- [ ] Replace Server Script
- [ ] Save widget
- [ ] Test in browser

### Testing (30 minutes)
- [ ] Open app in browser
- [ ] Verify no flicker
- [ ] Test story selection
- [ ] Test voting flow
- [ ] Test moderator controls
- [ ] Test with 2+ users

---

## File Reference

| What to Change | Where to Find Code |
|----------------|-------------------|
| Script Include updates | `08_BACKEND_UPDATES.md` sections 5-6 |
| New REST endpoints | `08_BACKEND_UPDATES.md` sections 1-4 |
| HTML Template | `05_UPDATED_HTML.md` |
| CSS | `06_UPDATED_CSS.md` |
| Client Controller | `07_UPDATED_CLIENT.md` |
| Server Script | `08_BACKEND_UPDATES.md` section 7 |

---

## Common Questions

**Q: Do I need to update the database tables?**
A: No, the v1 tables are fine. No schema changes needed.

**Q: Will this break my v1 implementation?**
A: No, but you should test in a separate session first.

**Q: Can I implement backend and frontend separately?**
A: Yes! Do backend first, test the APIs, then do frontend.

**Q: What if I get errors?**
A: Check:
1. Table names match your scope (`x_1326913_sp_point`)
2. API base path is correct in Client Controller
3. Session code is valid
4. Browser console for JavaScript errors
5. ServiceNow system logs for backend errors

**Q: How do I test just the backend changes?**
A: Use REST API Explorer to test each new endpoint before updating the UI.

---

## Quick Test Commands

### Test Start Voting
```bash
POST /api/x_1326913_sp_point/sprint_pointing_api/session/YOUR_SESSION_CODE/start_voting
Body: { "story_id": "YOUR_SESSION_STORY_SYS_ID" }
```

### Test Get Sprints
```bash
GET /api/x_1326913_sp_point/sprint_pointing_api/sprints
```

### Test Get Sprint Stories
```bash
GET /api/x_1326913_sp_point/sprint_pointing_api/sprint/YOUR_SPRINT_SYS_ID/stories
```
