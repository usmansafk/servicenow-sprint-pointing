# Sprint Pointing V3 - Quick Reference Guide

This guide provides a complete implementation checklist and testing guide for V3 enhancements.

## Implementation Checklist

### Phase 1: Backend Utilities ✓ COMPLETED

- [x] **Task 1.1**: Create SprintPointingPrettyPrinter Script Include
- [x] **Task 1.3**: Create SprintPointingSessionManager Script Include  
- [x] **Task 1.6**: Create SprintPointingStoryManager Script Include
- [x] **Task 2**: Run backend utilities test suite

**Files**: 
- `servicenow/v3/script_includes/SprintPointingPrettyPrinter.js`
- `servicenow/v3/script_includes/SprintPointingSessionManager.js`
- `servicenow/v3/script_includes/SprintPointingStoryManager.js`
- `servicenow/v3/tests/backend_utilities_tests.js`

### Phase 2: Session Creator Widget ✓ COMPLETED

- [x] **Task 3.1**: Implement sprint dropdown numerical sorting
- [x] **Task 3.4-3.6**: Implement session link copy functionality

**Files**:
- `servicenow/v3/widgets/session_creator/client_controller.js`
- `servicenow/v3/03_SESSION_CREATOR_LINK_COPY.md`

### Phase 3: Sprint Pointing App Widget - Frontend

- [ ] **Task 4**: Update HTML template with V3 enhancements
- [ ] **Task 5**: Update CSS with 20% scale increase and fixes
- [ ] **Task 6**: Update client controller with V3 logic

**Files**:
- `servicenow/v3/04_SPRINT_POINTING_HTML_V3.md`
- `servicenow/v3/05_SPRINT_POINTING_CSS_V3.md`
- `servicenow/v3/06_SPRINT_POINTING_CLIENT_V3.md`

### Phase 4: Backend API Updates

- [ ] **Task 7**: Update backend API endpoints for V3 features

**Files**:
- `servicenow/v3/07_BACKEND_API_UPDATES_V3.md`

## Implementation Order

Follow this order for smooth implementation:

1. **Backend Utilities** (Already completed)
   - SprintPointingPrettyPrinter
   - SprintPointingSessionManager
   - SprintPointingStoryManager

2. **Session Creator** (Already completed)
   - Sprint dropdown sorting
   - Link copy functionality

3. **Backend API** (Do this next)
   - Update GET /session endpoint
   - Update POST /reveal endpoint
   - Create PATCH /story/reference endpoint
   - Add timer endpoints
   - Add timer fields to session table

4. **Sprint Pointing App - HTML**
   - Copy HTML from `04_SPRINT_POINTING_HTML_V3.md`
   - Paste into widget HTML Template tab

5. **Sprint Pointing App - CSS**
   - Copy CSS from `05_SPRINT_POINTING_CSS_V3.md`
   - Paste into widget CSS - SCSS tab

6. **Sprint Pointing App - Client Controller**
   - Copy JavaScript from `06_SPRINT_POINTING_CLIENT_V3.md`
   - Paste into widget Client Controller tab

## V3 Features Summary

### 1. Session Creator Enhancements
- ✅ Sprint dropdown sorts numerically (Sprint 1 before Sprint 10)
- ✅ Click session link field → auto-select text
- ✅ Click copy icon → copy to clipboard
- ✅ "Link copied!" toast notification

### 2. Timer Enhancements
- ⏱️ Timer visible to all participants (not just moderator)
- ⏱️ Timer displayed in header with clock icon
- ⏱️ Timer synced across all participants via polling
- ⏱️ 16px spacing between timer and participant count

### 3. Voting Card Enhancements
- 🐥 Pass card shows duck emoji instead of "pass" text
- 📏 Cards scaled 20% larger (96x144px)
- 📏 Base font size increased to 19px

### 4. Participant Enhancements
- 👤 Participant avatars with photos
- 👤 Initials fallback when no photo available
- 👤 32px diameter circular avatars
- 👤 Live participant count updates

### 5. Story Details Enhancements
- 📋 Sprint field moved before Points in metadata grid
- 📋 Reference fields editable (Assignment Group, Assigned To, Sprint)
- 📋 Field updates persist to database

### 6. Results Enhancements
- 📊 Vote results visible to all participants (not just moderator)
- 📊 Individual votes show voter avatars
- 📊 Distribution chart shows duck emoji for Pass votes

### 7. UI/UX Enhancements
- 🎨 20% scale increase across entire app
- 🎨 Finalize button fully visible (not cut off)
- 🎨 Portal header removed (#sp-nav-bar hidden)
- 🎨 Improved spacing and layout

## Testing Guide

### Test 1: Session Creator

**Sprint Dropdown Sorting**
1. Navigate to Sprint Pointing > Create Session
2. Open sprint dropdown
3. Verify sprints are sorted numerically:
   - Sprint 1 before Sprint 2
   - Sprint 9 before Sprint 10
   - Sprint 10 before Sprint 15

**Link Copy**
1. Create a new session
2. Click the session link field → verify text auto-selects
3. Click the copy icon → verify "Link copied!" toast appears
4. Paste link in new tab → verify it opens the session

### Test 2: Timer (Multi-User)

**Setup**: Open session in 2 browser windows (moderator + participant)

1. Moderator: Click "1 min" timer button
2. Both users: Verify timer appears in header with clock icon
3. Both users: Verify timer counts down in sync
4. Both users: Verify timer bar shows progress
5. Verify 16px spacing between timer and participant count

### Test 3: Voting Cards

1. Start voting on a story
2. Verify Pass card shows 🐥 duck emoji
3. Measure card size in browser dev tools → should be 96x144px
4. Verify base font size is 19px (check in dev tools)

### Test 4: Participant Avatars

**Setup**: Have 3+ users join session

1. Submit votes from different users
2. In "Vote Submitted" view, verify participant list shows:
   - Avatars with photos (if available)
   - Initials fallback (if no photo)
   - 32px diameter circular avatars
   - Check mark for users who voted
3. Verify participant count updates live as users vote

### Test 5: Story Details

1. Select a story
2. Verify Sprint field appears before Points in metadata grid
3. As moderator, click edit icon on Assignment Group
4. Enter a group name → blur field
5. Verify update persists (refresh page and check)
6. Repeat for Assigned To and Sprint fields

### Test 6: Vote Results

**Setup**: Reveal votes after voting round

1. As moderator, click "Stop & Reveal"
2. As participant, verify you can see:
   - Suggested points
   - Vote distribution chart
   - Individual votes with voter names and avatars
3. Verify duck emoji shows for Pass votes in distribution
4. Verify voter avatars show in individual votes list

### Test 7: UI Scaling

1. Measure various elements in browser dev tools:
   - Base font: 19px
   - Vote cards: 96x144px
   - Header padding: 14px 24px
   - Story list padding: 14px
2. Verify Finalize button is fully visible (not cut off)
3. Verify portal header is hidden

### Test 8: Cross-Browser

Test in multiple browsers:
- Chrome
- Firefox
- Safari
- Edge

Verify:
- Timer syncs correctly
- Avatars display properly
- Duck emoji renders correctly
- Link copy works (requires HTTPS or localhost)

### Test 9: Mobile Responsive

1. Open session on mobile device or resize browser to mobile width
2. Verify responsive layout:
   - Story list becomes horizontal scroll
   - Panels stack vertically
   - Cards remain usable
   - Timer and participant count visible

## Troubleshooting

### Sprint Dropdown Not Sorting
- Verify client controller was updated with `sortSprintsNumerically()` method
- Check browser console for JavaScript errors
- Clear browser cache and reload

### Link Copy Not Working
- Verify you're on HTTPS or localhost (clipboard API requires secure context)
- Check browser console for errors
- Try different browser

### Timer Not Syncing
- Verify backend API returns timer_state fields
- Check polling is working (network tab in dev tools)
- Verify timer fields exist in session table

### Avatars Not Showing
- Verify backend API returns photo field in participants array
- Check user records have photos uploaded
- Verify `getInitials()` method exists in client controller

### Duck Emoji Not Showing
- Verify HTML uses `ng-if="card === 'pass'"` condition
- Check CSS has `.card-pass` class with font-size: 48px
- Try different browser (emoji support varies)

### Finalize Button Cut Off
- Verify CSS has `.input-group-btn .btn` with padding: 10px 18px
- Check for conflicting CSS rules
- Inspect element in dev tools

### Reference Fields Not Updating
- Verify PATCH /story/reference endpoint exists
- Check SprintPointingStoryManager Script Include is installed
- Verify user has write permissions to rm_story table
- Check browser console and server logs for errors

## Performance Considerations

### Polling Frequency
- Default: 2 seconds
- Adjust in client controller: `PollingService.start(callback, 2000)`
- Lower = more responsive, higher server load
- Higher = less responsive, lower server load

### Timer Accuracy
- Client-side countdown with server sync
- Syncs on each poll (every 2 seconds)
- Acceptable drift: ±2 seconds

### Avatar Loading
- Photos loaded from ServiceNow user records
- Cached by browser
- Initials generated client-side (no server load)

## Rollback Plan

If V3 has issues, you can rollback to V2:

1. **Session Creator**: Restore V2 client controller from `servicenow/v2/10_SESSION_CREATOR.md`
2. **Sprint Pointing App**: Restore V2 files from:
   - HTML: `servicenow/v2/05_UPDATED_HTML.md`
   - CSS: `servicenow/v2/06_UPDATED_CSS.md`
   - Client: `servicenow/v2/07_UPDATED_CLIENT.md`
3. **Backend**: V3 backend changes are backward compatible with V2 frontend

## Support

For issues or questions:
1. Check this Quick Reference guide
2. Review implementation files in `servicenow/v3/` folder
3. Check ServiceNow system logs for backend errors
4. Check browser console for frontend errors

## Requirements Mapping

| Requirement | Feature | File |
|-------------|---------|------|
| 1.1, 1.2, 1.3 | Sprint dropdown sorting | 03_SESSION_CREATOR_LINK_COPY.md |
| 2.1-2.5 | Link copy functionality | 03_SESSION_CREATOR_LINK_COPY.md |
| 3.1 | Duck emoji for Pass | 04_SPRINT_POINTING_HTML_V3.md |
| 4.1-4.3 | Timer visible to all | 04_SPRINT_POINTING_HTML_V3.md, 06_SPRINT_POINTING_CLIENT_V3.md |
| 6.1-6.3 | Participant avatars | 04_SPRINT_POINTING_HTML_V3.md, 06_SPRINT_POINTING_CLIENT_V3.md |
| 7.1-7.2 | 20% scale increase | 05_SPRINT_POINTING_CSS_V3.md |
| 8.1-8.2 | Story field reordering | 04_SPRINT_POINTING_HTML_V3.md |
| 9.1 | Vote results visible | 04_SPRINT_POINTING_HTML_V3.md, 06_SPRINT_POINTING_CLIENT_V3.md |
| 10.1 | Finalize button fix | 05_SPRINT_POINTING_CSS_V3.md |
| 11.1 | Portal header removal | 05_SPRINT_POINTING_CSS_V3.md |
| 12.5-12.6 | Reference field updates | 07_BACKEND_API_UPDATES_V3.md |
| 15.1-15.5 | Backend utilities | Script Includes |

## Next Steps

After completing V3 implementation:

1. Run full test suite (see Testing Guide above)
2. Conduct user acceptance testing with real users
3. Monitor performance and error logs
4. Gather feedback for future enhancements
5. Document any custom configurations or workarounds

## Version History

- **V1**: Initial implementation with basic voting
- **V2**: Enhanced UI, polling, voting workflow
- **V3**: Timer sync, avatars, scaling, reference fields (current)
