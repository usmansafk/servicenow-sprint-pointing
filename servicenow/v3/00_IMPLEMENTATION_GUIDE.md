# Sprint Pointing V3 Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing Version 3 enhancements to the Sprint Pointing application on ServiceNow instance https://dev275533.service-now.com/ (scope: x_1326913_sp_point).

V3 focuses on 15 targeted enhancements including UI improvements, real-time updates, data management, and visual presentation while maintaining backward compatibility with V2.

## Prerequisites

- Access to ServiceNow instance: https://dev275533.service-now.com/
- Admin or developer role with permissions to modify scoped application x_1326913_sp_point
- V2 Sprint Pointing application already deployed and functional
- Basic understanding of ServiceNow Script Includes, REST APIs, and Service Portal widgets

## Implementation Order

The implementation is organized into phases:

1. **Backend Utilities** (Tasks 1.x) - Create Script Includes for session management and formatting
2. **Session Creator Widget** (Tasks 3.x) - Enhance sprint dropdown and session link copying
3. **Sprint Pointing App Widget - Timer/Voting** (Tasks 5.x) - Timer visibility, duck icon, layout fixes
4. **Sprint Pointing App Widget - Results/Participants** (Tasks 6.x) - Vote results, participant count, avatars
5. **Sprint Pointing App Widget - Story Details** (Tasks 8.x) - Field reordering, reference fields, scaling
6. **Backend API Endpoints** (Tasks 10.x) - Enhanced polling and story updates
7. **V2 Compatibility** (Tasks 11.x) - Verify backward compatibility
8. **Integration Testing** (Tasks 12.x) - Multi-user and cross-browser testing

## Phase 1: Backend Utilities

### Task 1.1: Create SprintPointingPrettyPrinter Script Include

**Purpose**: Provide utility to format session objects for debugging and logging

**Steps**:

1. Navigate to **System Definition > Script Includes** in ServiceNow
2. Click **New** to create a new Script Include
3. Fill in the following fields:
   - **Name**: `SprintPointingPrettyPrinter`
   - **Application**: `Sprint Pointing System (x_1326913_sp_point)`
   - **API Name**: `x_1326913_sp_point.SprintPointingPrettyPrinter`
   - **Client callable**: Unchecked (server-side only)
   - **Description**: `Format session objects for debugging and logging`
4. Copy the code from `servicenow/v3/script_includes/SprintPointingPrettyPrinter.js` into the **Script** field
5. Click **Submit** to save

**Verification**:

Test the Script Include in Scripts - Background:

```javascript
var printer = new x_1326913_sp_point.SprintPointingPrettyPrinter();
var testSession = {
    session_id: "abc123",
    moderator_id: "user456",
    status: "active",
    participants: [
        { user_id: "user1", user_name: "John Doe" },
        { user_id: "user2", user_name: "Jane Smith" }
    ]
};
var formatted = printer.format(testSession);
gs.info("Formatted session:\n" + formatted);
```

Expected output should show properly formatted JSON with 2-space indentation.

**Requirements Validated**: 15.3

---

### Task 1.3: Create SprintPointingSessionManager Script Include

**Purpose**: Manage session state serialization, parsing, and participant tracking

**Steps**:

1. Navigate to **System Definition > Script Includes** in ServiceNow
2. Click **New** to create a new Script Include
3. Fill in the following fields:
   - **Name**: `SprintPointingSessionManager`
   - **Application**: `Sprint Pointing System (x_1326913_sp_point)`
   - **API Name**: `x_1326913_sp_point.SprintPointingSessionManager`
   - **Client callable**: Unchecked (server-side only)
   - **Description**: `Manage session state serialization, parsing, and participant tracking`
4. Copy the code from `servicenow/v3/script_includes/SprintPointingSessionManager.js` into the **Script** field
5. Click **Submit** to save

**Key Methods**:

- `serializeSession(sessionId)` - Converts a session to JSON string with all metadata, stories, votes, and participants
- `parseSession(jsonString)` - Converts JSON string back to session object with validation and error handling
- `getParticipantCount(sessionId)` - Returns count of distinct users who have voted in the session

**Verification**:

Test the Script Include in Scripts - Background:

```javascript
// Test serialization
var manager = new x_1326913_sp_point.SprintPointingSessionManager();

// Replace 'YOUR_SESSION_ID' with an actual session sys_id from your instance
var sessionId = 'YOUR_SESSION_ID';
var serialized = manager.serializeSession(sessionId);
gs.info("Serialized session:\n" + serialized);

// Test parsing
var parsed = manager.parseSession(serialized);
if (parsed.error) {
    gs.error("Parse error: " + parsed.message);
} else {
    gs.info("Successfully parsed session: " + parsed.session_id);
}

// Test participant count
var count = manager.getParticipantCount(sessionId);
gs.info("Participant count: " + count);

// Test round-trip property: parse(serialize(session)) should equal session
var reserialized = manager.serializeSession(parsed.session_id);
gs.info("Round-trip successful: " + (serialized === reserialized));
```

**Error Handling Tests**:

```javascript
var manager = new x_1326913_sp_point.SprintPointingSessionManager();

// Test invalid session ID
var result1 = manager.serializeSession('invalid_id');
gs.info("Invalid session test:\n" + result1);

// Test malformed JSON
var result2 = manager.parseSession('{ invalid json }');
gs.info("Malformed JSON test: " + JSON.stringify(result2, null, 2));

// Test missing required fields
var result3 = manager.parseSession('{"status": "active"}');
gs.info("Missing fields test: " + JSON.stringify(result3, null, 2));

// Test empty input
var result4 = manager.parseSession('');
gs.info("Empty input test: " + JSON.stringify(result4, null, 2));
```

Expected behaviors:
- Invalid session ID should return error object with "Session not found" message
- Malformed JSON should return error with parse location
- Missing required fields should return validation error specifying which field
- Empty input should return "Invalid input" error

**Requirements Validated**: 15.1, 15.2, 15.4, 15.5, 6.1, 6.2

---

---

### Task 1.6: Create SprintPointingStoryManager Script Include

**Purpose**: Handle story metadata updates for reference fields with validation

**Steps**:

1. Navigate to **System Definition > Script Includes** in ServiceNow
2. Click **New** to create a new Script Include
3. Fill in the following fields:
   - **Name**: `SprintPointingStoryManager`
   - **Application**: `Sprint Pointing System (x_1326913_sp_point)`
   - **API Name**: `x_1326913_sp_point.SprintPointingStoryManager`
   - **Client callable**: Unchecked (server-side only)
   - **Description**: `Handle story metadata updates for reference fields`
4. Copy the code from `servicenow/v3/script_includes/SprintPointingStoryManager.js` into the **Script** field
5. Click **Submit** to save

**Key Method**:

- `updateStoryReference(storyId, fieldName, referenceId)` - Updates a reference field on a story record with validation

**Supported Fields**:
- `assignment_group` - References sys_user_group table
- `assigned_to` - References sys_user table
- `sprint` - References rm_sprint table

**Verification**:

Test the Script Include in Scripts - Background:

```javascript
var manager = new x_1326913_sp_point.SprintPointingStoryManager();

// Replace these with actual sys_ids from your instance
var storyId = 'YOUR_STORY_SYS_ID';
var groupId = 'YOUR_GROUP_SYS_ID';
var userId = 'YOUR_USER_SYS_ID';
var sprintId = 'YOUR_SPRINT_SYS_ID';

// Test updating assignment_group
var result1 = manager.updateStoryReference(storyId, 'assignment_group', groupId);
gs.info("Update assignment_group result: " + result1);

// Test updating assigned_to
var result2 = manager.updateStoryReference(storyId, 'assigned_to', userId);
gs.info("Update assigned_to result: " + result2);

// Test updating sprint
var result3 = manager.updateStoryReference(storyId, 'sprint', sprintId);
gs.info("Update sprint result: " + result3);

// Verify the story was updated
var storyGR = new GlideRecord('rm_story');
if (storyGR.get(storyId)) {
    gs.info("Story assignment_group: " + storyGR.getValue('assignment_group'));
    gs.info("Story assigned_to: " + storyGR.getValue('assigned_to'));
    gs.info("Story sprint: " + storyGR.getValue('sprint'));
}
```

**Validation Tests**:

```javascript
var manager = new x_1326913_sp_point.SprintPointingStoryManager();

// Test invalid story ID
var result1 = manager.updateStoryReference('invalid_id', 'assignment_group', 'some_group');
gs.info("Invalid story test: " + result1); // Should return false

// Test invalid field name
var result2 = manager.updateStoryReference('valid_story_id', 'invalid_field', 'some_ref');
gs.info("Invalid field test: " + result2); // Should return false

// Test invalid reference ID
var result3 = manager.updateStoryReference('valid_story_id', 'assignment_group', 'invalid_ref');
gs.info("Invalid reference test: " + result3); // Should return false

// Test missing parameters
var result4 = manager.updateStoryReference('', 'assignment_group', 'some_ref');
gs.info("Missing parameters test: " + result4); // Should return false
```

Expected behaviors:
- Valid updates should return `true` and update the story record
- Invalid story ID should return `false` with error message "Story not found"
- Invalid field name should return `false` with error message listing supported fields
- Invalid reference ID should return `false` with error message "Reference not found"
- Missing parameters should return `false` with error message "Missing required parameters"

**Requirements Validated**: 12.5, 12.6

---

## Task 2: Checkpoint - Backend Utilities Tests

**Purpose**: Verify all backend utilities are working correctly before proceeding to frontend enhancements

After completing Tasks 1.1, 1.3, and 1.6, run the comprehensive test suite to validate the backend utilities.

**Steps**:

1. Navigate to **System Definition > Scripts - Background** in ServiceNow
2. Copy the entire contents of `servicenow/v3/tests/backend_utilities_tests.js`
3. Paste into the Scripts - Background editor
4. Click **Run script**
5. Review the test results in the output

**Expected Results**:

The test suite will run approximately 35+ automated tests covering:

- **SprintPointingPrettyPrinter Tests** (7 tests):
  - JSON formatting with 2-space indentation
  - Handling simple and complex objects
  - Valid JSON output
  - Data preservation

- **SprintPointingSessionManager Tests** (22 tests):
  - Valid JSON parsing
  - Malformed JSON detection
  - Missing required fields validation
  - Empty input handling
  - Timer state validation
  - Array type validation
  - Round-trip property (parse → serialize → parse)
  - Participant count with invalid inputs

- **SprintPointingStoryManager Tests** (10 tests):
  - Missing parameter validation
  - Invalid field name detection
  - Invalid story ID handling
  - Reference field mapping verification
  - Supported fields documentation

**Success Criteria**:

All automated tests should pass with output:
```
✓ CHECKPOINT PASSED: All backend utilities tests passed!
  You can proceed to Task 3: Session Creator widget enhancements.
```

**Manual Verification** (Optional):

Some tests require actual database records. If you want to verify with real data:

1. Create a test session in your ServiceNow instance
2. Use the verification scripts from Tasks 1.1, 1.3, and 1.6 above
3. Replace placeholder sys_ids with actual values from your instance
4. Verify:
   - Session serialization produces complete JSON
   - Participant count returns accurate numbers
   - Story reference updates persist to database

**Troubleshooting**:

If tests fail:
- Verify all three Script Includes are properly installed (Tasks 1.1, 1.3, 1.6)
- Check that the application scope is set to x_1326913_sp_point
- Review the error messages in the test output for specific failures
- Ensure the Script Include API names include the scope prefix

**Requirements Validated**: 15.1, 15.2, 15.3, 15.4, 15.5, 12.5, 12.6, 6.1, 6.2

---

## Phase 2: Session Creator Widget Enhancements

### Task 3.1: Implement Sprint Dropdown Numerical Sorting

**Purpose**: Sort sprint dropdown numerically so Sprint 1 appears before Sprint 2, and Sprint 9 before Sprint 10

**Steps**:

1. Navigate to **Service Portal > Widgets** in ServiceNow
2. Find and open the **Session Creator** widget
3. Click on the **Client Controller** tab
4. Replace the entire client controller code with the contents of `servicenow/v3/widgets/session_creator/client_controller.js`
5. Click **Save** to save the widget

**Key Changes**:

The V3 client controller adds two new methods:

- `sortSprintsNumerically(sprints)` - Sorts sprint array by extracted numeric value
- `extractNumericValue(name)` - Extracts the last numeric value from sprint name

The sorting is automatically applied in the `loadSprints()` method after fetching sprints from the API.

**Algorithm**:

1. Extract the last numeric value from each sprint name (e.g., "Q4 Sprint 15" → 15)
2. Sort by numeric value in ascending order
3. Sprints without numbers are placed at the end, sorted alphabetically

**Verification**:

1. Navigate to **Sprint Pointing > Create Session** in ServiceNow
2. Open the sprint dropdown
3. Verify the sprints are sorted numerically:
   - Sprint 1 should appear before Sprint 2
   - Sprint 9 should appear before Sprint 10
   - Sprint 10 should appear before Sprint 15
   - Sprints without numbers (e.g., "Backlog") should appear at the end

**Test Cases**:

Create test sprints with these names to verify sorting:
- "Sprint 1", "Sprint 2", "Sprint 9", "Sprint 10", "Sprint 15"
- "Q4 Sprint 1", "Q4 Sprint 2", "Q4 Sprint 3"
- "Backlog", "Current", "Sprint 5"

Expected order:
1. Sprint 1
2. Sprint 2
3. Sprint 5
4. Sprint 9
5. Sprint 10
6. Sprint 15
7. Q4 Sprint 1
8. Q4 Sprint 2
9. Q4 Sprint 3
10. Backlog
11. Current

**Unit Tests**:

Unit tests are provided in `servicenow/v3/tests/session_creator_tests.js` and can be run locally:

```bash
node servicenow/v3/tests/run_session_creator_tests.js
```

Expected output:
```
✓ Sprint 1 before Sprint 2 (Requirement 1.1)
✓ Sprint 9 before Sprint 10 (Requirement 1.2)
✓ Handle non-numeric prefixes (Requirement 1.3)
✓ All tests passed!
```

**Detailed Implementation Guide**:

For more details, see `servicenow/v3/widgets/session_creator/IMPLEMENTATION_GUIDE.md`

**Requirements Validated**: 1.1, 1.2, 1.3

---

## Next Steps

After completing Task 3.1, proceed to:
- Task 3.4: Implement session link copy functionality (Tasks 3.4-3.6)
- Phase 3: Sprint Pointing App Widget - Timer and Voting UI (Tasks 5.x)

Additional implementation guides will be created as development progresses.

## Troubleshooting

### Script Include Not Found
- Verify the application scope is set to x_1326913_sp_point
- Check that the API name includes the scope prefix: `x_1326913_sp_point.SprintPointingPrettyPrinter` or `x_1326913_sp_point.SprintPointingSessionManager`

### JSON Formatting Errors
- Ensure the input object is a valid JavaScript object
- Check for circular references in the session object
- The format() method includes error handling and will return an error message if formatting fails

### Session Serialization Issues
- Verify the session ID exists in the x_1326913_sp_point_refinement_session table
- Check that related tables (session_story, vote, rm_story) are accessible
- Ensure the session has proper relationships to stories and votes
- If timer fields are missing, they will default to safe values (false, 0)

### Parse Validation Errors
- Check that JSON includes required fields: session_id, moderator_id, status
- Verify timer_state.active is a boolean if timer_state is present
- Ensure participants, stories, and votes are arrays if present
- The error object will include a "location" field indicating where validation failed

### Participant Count Returns Zero
- Verify votes exist in the x_1326913_sp_point_vote table for the session
- Check that the 'user' field is populated in vote records
- Ensure the session ID matches exactly (case-sensitive)
- The method uses GlideAggregate with COUNT DISTINCT, which requires proper database indexing

### Story Reference Update Fails
- Verify the story exists in the rm_story table
- Check that the field name is one of: assignment_group, assigned_to, sprint
- Ensure the reference ID exists in the target table (sys_user_group, sys_user, or rm_sprint)
- Verify you have write permissions to the rm_story table
- Check the system logs for detailed error messages

### Reference Validation Errors
- For assignment_group: Verify the group exists in sys_user_group table
- For assigned_to: Verify the user exists in sys_user table and is active
- For sprint: Verify the sprint exists in rm_sprint table
- The validation uses GlideRecord.get() which requires exact sys_id match

## References

- Design Document: `.kiro/specs/sprint-pointing-v3-enhancements/design.md`
- Requirements Document: `.kiro/specs/sprint-pointing-v3-enhancements/requirements.md`
- Tasks Document: `.kiro/specs/sprint-pointing-v3-enhancements/tasks.md`
