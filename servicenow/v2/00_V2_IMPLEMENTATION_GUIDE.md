# V2 Implementation Guide

## Overview

Version 2 focuses on stability, correctness, and structural UX improvements. No color/design changes yet.

---

## Files in This Folder

| File | Description |
|------|-------------|
| `01_TECHNICAL_ANALYSIS.md` | Root cause analysis and solutions |
| `02_POLLING_HOOK.md` | Smart polling implementation |
| `03_SESSION_CONTEXT.md` | Centralized state management |
| `04_VOTING_LOGIC.md` | Complete voting lifecycle |
| `05_UPDATED_HTML.md` | New HTML template |
| `06_UPDATED_CSS.md` | Structural CSS updates |
| `07_UPDATED_CLIENT.md` | New client controller |
| `08_BACKEND_UPDATES.md` | New API endpoints |

---

## Implementation Order

### Phase 1: Backend Updates (30 min)

1. **Add new REST endpoints** (from `08_BACKEND_UPDATES.md`):
   - POST `/session/{code}/start_voting`
   - GET `/sprints`
   - GET `/sprint/{id}/stories`
   - PATCH `/story/{id}`

2. **Update Script Include**:
   - Add more story fields to `getSessionState()`
   - Add participant vote tracking

3. **Test new endpoints** in REST API Explorer

### Phase 2: Frontend Updates (1-2 hours)

1. **Replace HTML Template** (from `05_UPDATED_HTML.md`):
   - Copy entire HTML
   - Paste into widget HTML Template
   - Save

2. **Replace CSS** (from `06_UPDATED_CSS.md`):
   - Copy entire CSS
   - Paste into widget CSS
   - Save

3. **Replace Client Controller** (from `07_UPDATED_CLIENT.md`):
   - Copy entire JavaScript
   - Paste into widget Client Controller
   - Save

4. **Update Server Script** (from `08_BACKEND_UPDATES.md`):
   - Add sprint/story helper functions

### Phase 3: Testing (30 min)

1. **Test polling**:
   - Open app in browser
   - Watch for flicker (should be gone)
   - Check console for poll logs

2. **Test voting flow**:
   - Create session
   - Select story
   - Start voting (moderator)
   - Submit vote
   - Reveal votes
   - Finalize points
   - Verify story updated

3. **Test role-based rendering**:
   - Open in two browsers (moderator + participant)
   - Verify correct controls shown

4. **Test story details**:
   - Select story
   - Verify all fields display
   - Test inline editing (moderator)

---

## Key Changes Summary

### Flicker Fix
- Smart polling with change detection
- Only updates state when data actually changes
- Stable keys in ng-repeat (`track by story.sys_id`)
- In-place updates instead of full replacement

### State Management
- Centralized state in `c.state` object
- Stories stored in map (not array)
- Controlled mutations through actions
- Computed getters for derived data

### Voting Lifecycle
- Clear state machine (pending → voting → revealed → pointed)
- Role-based rendering logic
- One vote per user per round
- Proper moderator controls

### Story Panel
- Structured metadata grid
- Editable fields (moderator)
- All required fields displayed
- Save changes functionality

### Progress Indicators
- "Story X of Y" in header
- Status badges in story list
- Vote progress (X of Y voted)
- Participant vote status

### Timer
- Moderator-controlled timer
- Progress bar at top
- Countdown display
- Optional auto-reveal

---

## Troubleshooting

### If flicker persists:
1. Check that `track by story.sys_id` is in all ng-repeat
2. Verify polling service is using change detection
3. Check console for excessive re-renders

### If voting doesn't work:
1. Check API base path matches your scope
2. Verify session code is correct
3. Check browser console for errors
4. Check ServiceNow system logs

### If moderator controls don't show:
1. Verify `is_moderator` is returned from API
2. Check `c.isModerator()` returns true
3. Verify you're logged in as session creator

### If story fields are missing:
1. Update Script Include with new fields
2. Check rm_story table has those fields
3. Verify API returns the data

---

## What's NOT in V2

- Color scheme changes
- Typography updates
- Animation polish
- Session creation wizard
- Sprint selector UI
- Donut chart visualization
- Mobile optimization

These are planned for V3 (design phase).

---

## Quick Test Checklist

- [ ] Page loads without flicker
- [ ] Story list is stable (no jumping)
- [ ] Selecting story shows details
- [ ] Moderator can start voting
- [ ] Participants see voting cards
- [ ] Vote submission works
- [ ] Vote count updates
- [ ] Reveal shows results
- [ ] Finalize writes to story
- [ ] Next story advances correctly
- [ ] Progress indicator updates
- [ ] Timer works (moderator)

---

## Next Steps After V2

Once V2 is stable:
1. Gather feedback on workflow
2. Identify remaining bugs
3. Plan V3 design phase
4. Choose color scheme
5. Add animations and polish
