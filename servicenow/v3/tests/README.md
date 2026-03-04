# Backend Utilities Test Suite

This directory contains test suites for validating the Sprint Pointing V3 backend utilities.

## Test Files

### backend_utilities_tests.js

Comprehensive test suite for Phase 1 backend utilities (Task 2 checkpoint).

**Tests Covered**:
- SprintPointingPrettyPrinter (7 tests)
- SprintPointingSessionManager (22 tests)
- SprintPointingStoryManager (10 tests)

**Total**: 35+ automated tests

## Running Tests

### In ServiceNow

1. Navigate to **System Definition > Scripts - Background**
2. Copy the contents of `backend_utilities_tests.js`
3. Paste into the Scripts - Background editor
4. Click **Run script**
5. Review test results in the output

### Expected Output

```
========================================
Backend Utilities Test Suite
========================================

--- Test Suite 1: SprintPointingPrettyPrinter ---

✓ PASSED: Test 1.1: format() returns non-null result
✓ PASSED: Test 1.2: Formatted output contains session_id
✓ PASSED: Test 1.3: Formatted output uses 2-space indentation
...

--- Test Suite 2: SprintPointingSessionManager ---

✓ PASSED: Test 2.1: parseSession() handles valid JSON
✓ PASSED: Test 2.2: Parsed session has correct session_id
...

--- Test Suite 3: SprintPointingStoryManager ---

✓ PASSED: Test 3.1: updateStoryReference() returns false for missing story ID
...

========================================
Test Results Summary
========================================
Total Tests: 39
Passed: 39
Failed: 0
Success Rate: 100%
========================================

✓ CHECKPOINT PASSED: All backend utilities tests passed!
  You can proceed to Task 3: Session Creator widget enhancements.
```

## Test Coverage

### SprintPointingPrettyPrinter
- ✓ JSON formatting with 2-space indentation
- ✓ Simple object formatting
- ✓ Complex nested object formatting
- ✓ Valid JSON output
- ✓ Data preservation after formatting

### SprintPointingSessionManager
- ✓ Valid JSON parsing
- ✓ Malformed JSON detection with location
- ✓ Missing required fields validation
- ✓ Empty input handling
- ✓ Timer state type validation
- ✓ Participants array validation
- ✓ Stories array validation
- ✓ Votes array validation
- ✓ Round-trip property: parse(serialize(obj)) ≡ obj
- ✓ Participant count with invalid/empty/null inputs

### SprintPointingStoryManager
- ✓ Missing parameter validation
- ✓ Invalid field name detection
- ✓ Invalid story ID handling
- ✓ Reference field mapping verification
- ✓ Supported fields: assignment_group, assigned_to, sprint

## Manual Verification

Some tests require actual database records. For complete verification:

1. **Session Serialization/Parsing**:
   - Create a test session with stories and votes
   - Run serialization and verify complete JSON output
   - Parse the JSON and verify round-trip property

2. **Participant Count**:
   - Create a session with multiple participants voting
   - Verify count matches actual distinct users

3. **Story Reference Updates**:
   - Update assignment_group with valid sys_user_group sys_id
   - Update assigned_to with valid sys_user sys_id
   - Update sprint with valid rm_sprint sys_id
   - Verify changes persist in rm_story table

See the implementation guide for detailed manual verification scripts.

## Troubleshooting

### Script Include Not Found
- Verify all three Script Includes are installed (Tasks 1.1, 1.3, 1.6)
- Check application scope is set to x_1326913_sp_point
- Ensure API names include scope prefix: `x_1326913_sp_point.ClassName`

### Tests Failing
- Review error messages in test output
- Check ServiceNow system logs for detailed errors
- Verify Script Include code matches implementation files
- Ensure no syntax errors in Script Includes

### Permission Issues
- Verify you have admin or developer role
- Check permissions to modify scoped application
- Ensure access to required tables (rm_story, sys_user, etc.)

## Requirements Validated

This test suite validates the following requirements:
- **15.1**: Session serialization to JSON
- **15.2**: Session parsing from JSON
- **15.3**: Pretty printer JSON formatting with 2-space indentation
- **15.4**: Round-trip property for serialization/parsing
- **15.5**: Parse error messages with location
- **12.5**: Reference field update persistence
- **12.6**: Reference field validation
- **6.1**: Participant count increment on join
- **6.2**: Participant count decrement on leave

## Next Steps

After all tests pass:
1. Mark Task 2 as complete
2. Proceed to Task 3: Session Creator widget enhancements
3. Continue with frontend implementation phases
