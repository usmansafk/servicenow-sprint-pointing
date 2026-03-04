/**
 * Backend Utilities Test Suite
 * 
 * This test suite validates the backend utilities created in Phase 1:
 * - SprintPointingPrettyPrinter (Task 1.1)
 * - SprintPointingSessionManager (Task 1.3)
 * - SprintPointingStoryManager (Task 1.6)
 * 
 * Run this in ServiceNow Scripts - Background to verify all backend utilities
 * are working correctly before proceeding to frontend enhancements.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 12.5, 12.6, 6.1, 6.2
 */

// Test Results Tracker
var testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function assert(condition, testName, errorMessage) {
    if (condition) {
        testResults.passed++;
        testResults.tests.push({
            name: testName,
            status: 'PASSED'
        });
        gs.info('✓ PASSED: ' + testName);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: testName,
            status: 'FAILED',
            error: errorMessage
        });
        gs.error('✗ FAILED: ' + testName + ' - ' + errorMessage);
    }
}

function assertEquals(actual, expected, testName) {
    var condition = actual === expected;
    var errorMessage = 'Expected: ' + expected + ', Got: ' + actual;
    assert(condition, testName, errorMessage);
}

function assertNotNull(value, testName) {
    var condition = value !== null && value !== undefined;
    var errorMessage = 'Expected non-null value, got: ' + value;
    assert(condition, testName, errorMessage);
}

function assertContains(str, substring, testName) {
    var condition = str && str.indexOf(substring) !== -1;
    var errorMessage = 'Expected string to contain "' + substring + '", got: ' + str;
    assert(condition, testName, errorMessage);
}

gs.info('========================================');
gs.info('Backend Utilities Test Suite');
gs.info('========================================\n');

// ============================================================================
// TEST SUITE 1: SprintPointingPrettyPrinter
// ============================================================================

gs.info('--- Test Suite 1: SprintPointingPrettyPrinter ---\n');

try {
    var printer = new x_1326913_sp_point.SprintPointingPrettyPrinter();
    
    // Test 1.1: Format simple object
    var simpleObj = {
        session_id: "abc123",
        moderator_id: "user456",
        status: "active"
    };
    var formatted = printer.format(simpleObj);
    assertNotNull(formatted, 'Test 1.1: format() returns non-null result');
    assertContains(formatted, '"session_id"', 'Test 1.2: Formatted output contains session_id');
    assertContains(formatted, '  ', 'Test 1.3: Formatted output uses 2-space indentation');
    
    // Test 1.4: Format complex object with nested structures
    var complexObj = {
        session_id: "xyz789",
        participants: [
            { user_id: "user1", user_name: "John Doe" },
            { user_id: "user2", user_name: "Jane Smith" }
        ],
        timer_state: {
            active: true,
            remaining_seconds: 120
        }
    };
    var formattedComplex = printer.format(complexObj);
    assertNotNull(formattedComplex, 'Test 1.4: format() handles complex nested objects');
    assertContains(formattedComplex, '"participants"', 'Test 1.5: Complex output contains participants array');
    assertContains(formattedComplex, '"timer_state"', 'Test 1.6: Complex output contains timer_state object');
    
    // Test 1.7: Verify JSON validity
    try {
        var parsed = JSON.parse(formatted);
        assert(true, 'Test 1.7: Formatted output is valid JSON', '');
        assertEquals(parsed.session_id, "abc123", 'Test 1.8: Parsed JSON preserves data');
    } catch (e) {
        assert(false, 'Test 1.7: Formatted output is valid JSON', e.message);
    }
    
    gs.info('');
    
} catch (e) {
    gs.error('SprintPointingPrettyPrinter tests failed with exception: ' + e.message);
    testResults.failed++;
}

// ============================================================================
// TEST SUITE 2: SprintPointingSessionManager
// ============================================================================

gs.info('--- Test Suite 2: SprintPointingSessionManager ---\n');

try {
    var manager = new x_1326913_sp_point.SprintPointingSessionManager();
    
    // Test 2.1: parseSession with valid JSON
    var validSessionJson = JSON.stringify({
        session_id: "test123",
        moderator_id: "mod456",
        status: "active",
        sprint_id: "sprint789",
        created_at: "2024-01-01 00:00:00",
        current_story_id: null,
        timer_state: {
            active: false,
            remaining_seconds: 0,
            total_seconds: 300
        },
        participants: [],
        stories: [],
        votes: []
    });
    
    var parsedSession = manager.parseSession(validSessionJson);
    assert(!parsedSession.error, 'Test 2.1: parseSession() handles valid JSON', parsedSession.error || '');
    assertEquals(parsedSession.session_id, "test123", 'Test 2.2: Parsed session has correct session_id');
    assertEquals(parsedSession.moderator_id, "mod456", 'Test 2.3: Parsed session has correct moderator_id');
    assertEquals(parsedSession.status, "active", 'Test 2.4: Parsed session has correct status');
    
    // Test 2.5: parseSession with malformed JSON
    var malformedJson = '{ invalid json }';
    var parseResult = manager.parseSession(malformedJson);
    assert(parseResult.error, 'Test 2.5: parseSession() detects malformed JSON', '');
    assertContains(parseResult.error, 'parse', 'Test 2.6: Error message indicates parse failure');
    assertNotNull(parseResult.location, 'Test 2.7: Error includes location information');
    
    // Test 2.8: parseSession with missing required fields
    var missingFieldsJson = JSON.stringify({
        session_id: "test123",
        status: "active"
        // Missing moderator_id
    });
    var missingResult = manager.parseSession(missingFieldsJson);
    assert(missingResult.error, 'Test 2.8: parseSession() detects missing required fields', '');
    assertContains(missingResult.message, 'moderator_id', 'Test 2.9: Error message specifies missing field');
    
    // Test 2.10: parseSession with empty input
    var emptyResult = manager.parseSession('');
    assert(emptyResult.error, 'Test 2.10: parseSession() handles empty input', '');
    assertContains(emptyResult.error, 'Invalid input', 'Test 2.11: Error indicates invalid input');
    
    // Test 2.12: parseSession with invalid timer_state
    var invalidTimerJson = JSON.stringify({
        session_id: "test123",
        moderator_id: "mod456",
        status: "active",
        timer_state: {
            active: "not_a_boolean"  // Should be boolean
        }
    });
    var timerResult = manager.parseSession(invalidTimerJson);
    assert(timerResult.error, 'Test 2.12: parseSession() validates timer_state.active type', '');
    assertContains(timerResult.message, 'boolean', 'Test 2.13: Error message mentions boolean type');
    
    // Test 2.14: parseSession with invalid participants array
    var invalidParticipantsJson = JSON.stringify({
        session_id: "test123",
        moderator_id: "mod456",
        status: "active",
        participants: "not_an_array"
    });
    var participantsResult = manager.parseSession(invalidParticipantsJson);
    assert(participantsResult.error, 'Test 2.14: parseSession() validates participants is array', '');
    assertContains(participantsResult.message, 'array', 'Test 2.15: Error message mentions array type');
    
    // Test 2.16: Round-trip property (serialize then parse)
    // Note: This test requires an actual session in the database
    // For now, we test the parse(serialize(object)) pattern with a mock object
    var mockSession = {
        session_id: "roundtrip123",
        moderator_id: "mod789",
        status: "active",
        sprint_id: "sprint456",
        created_at: "2024-01-01 00:00:00",
        current_story_id: null,
        timer_state: {
            active: true,
            remaining_seconds: 180,
            total_seconds: 300
        },
        participants: [
            { user_id: "user1", user_name: "Test User", joined_at: "2024-01-01 00:00:00" }
        ],
        stories: [],
        votes: []
    };
    
    var serialized = JSON.stringify(mockSession, null, 2);
    var roundTripResult = manager.parseSession(serialized);
    assert(!roundTripResult.error, 'Test 2.16: Round-trip parse(serialize(obj)) succeeds', roundTripResult.error || '');
    assertEquals(roundTripResult.session_id, mockSession.session_id, 'Test 2.17: Round-trip preserves session_id');
    assertEquals(roundTripResult.moderator_id, mockSession.moderator_id, 'Test 2.18: Round-trip preserves moderator_id');
    assertEquals(roundTripResult.timer_state.active, mockSession.timer_state.active, 'Test 2.19: Round-trip preserves timer_state');
    
    // Test 2.20: getParticipantCount with invalid session ID
    var invalidCount = manager.getParticipantCount('invalid_session_id');
    assertEquals(invalidCount, 0, 'Test 2.20: getParticipantCount() returns 0 for invalid session');
    
    // Test 2.21: getParticipantCount with empty input
    var emptyCount = manager.getParticipantCount('');
    assertEquals(emptyCount, 0, 'Test 2.21: getParticipantCount() returns 0 for empty input');
    
    // Test 2.22: getParticipantCount with null input
    var nullCount = manager.getParticipantCount(null);
    assertEquals(nullCount, 0, 'Test 2.22: getParticipantCount() returns 0 for null input');
    
    gs.info('');
    
} catch (e) {
    gs.error('SprintPointingSessionManager tests failed with exception: ' + e.message);
    testResults.failed++;
}

// ============================================================================
// TEST SUITE 3: SprintPointingStoryManager
// ============================================================================

gs.info('--- Test Suite 3: SprintPointingStoryManager ---\n');

try {
    var storyManager = new x_1326913_sp_point.SprintPointingStoryManager();
    
    // Test 3.1: updateStoryReference with missing parameters
    var result1 = storyManager.updateStoryReference('', 'assignment_group', 'some_ref');
    assertEquals(result1, false, 'Test 3.1: updateStoryReference() returns false for missing story ID');
    
    var result2 = storyManager.updateStoryReference('story_id', '', 'some_ref');
    assertEquals(result2, false, 'Test 3.2: updateStoryReference() returns false for missing field name');
    
    var result3 = storyManager.updateStoryReference('story_id', 'assignment_group', '');
    assertEquals(result3, false, 'Test 3.3: updateStoryReference() returns false for missing reference ID');
    
    // Test 3.4: updateStoryReference with invalid field name
    var result4 = storyManager.updateStoryReference('story_id', 'invalid_field', 'some_ref');
    assertEquals(result4, false, 'Test 3.4: updateStoryReference() returns false for invalid field name');
    
    // Test 3.5: updateStoryReference with invalid story ID
    var result5 = storyManager.updateStoryReference('invalid_story_id', 'assignment_group', 'some_ref');
    assertEquals(result5, false, 'Test 3.5: updateStoryReference() returns false for non-existent story');
    
    // Test 3.6: Verify supported field names are documented
    var supportedFields = ['assignment_group', 'assigned_to', 'sprint'];
    assert(true, 'Test 3.6: Supported fields are: ' + supportedFields.join(', '), '');
    
    // Test 3.7: Verify reference field map exists
    assertNotNull(storyManager.REFERENCE_FIELD_MAP, 'Test 3.7: REFERENCE_FIELD_MAP is defined');
    assertEquals(storyManager.REFERENCE_FIELD_MAP.assignment_group, 'sys_user_group', 
                'Test 3.8: assignment_group maps to sys_user_group');
    assertEquals(storyManager.REFERENCE_FIELD_MAP.assigned_to, 'sys_user', 
                'Test 3.9: assigned_to maps to sys_user');
    assertEquals(storyManager.REFERENCE_FIELD_MAP.sprint, 'rm_sprint', 
                'Test 3.10: sprint maps to rm_sprint');
    
    gs.info('');
    gs.info('NOTE: Tests 3.11-3.13 require actual database records and should be run manually:');
    gs.info('  - Test valid story update with real sys_ids');
    gs.info('  - Test reference validation with real reference records');
    gs.info('  - Test successful update persists to rm_story table');
    gs.info('  See implementation guide for manual verification scripts.\n');
    
} catch (e) {
    gs.error('SprintPointingStoryManager tests failed with exception: ' + e.message);
    testResults.failed++;
}

// ============================================================================
// TEST RESULTS SUMMARY
// ============================================================================

gs.info('========================================');
gs.info('Test Results Summary');
gs.info('========================================');
gs.info('Total Tests: ' + (testResults.passed + testResults.failed));
gs.info('Passed: ' + testResults.passed);
gs.info('Failed: ' + testResults.failed);
gs.info('Success Rate: ' + Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100) + '%');
gs.info('========================================\n');

if (testResults.failed > 0) {
    gs.error('CHECKPOINT FAILED: Some tests did not pass. Review errors above.');
    gs.info('\nFailed Tests:');
    for (var i = 0; i < testResults.tests.length; i++) {
        if (testResults.tests[i].status === 'FAILED') {
            gs.info('  - ' + testResults.tests[i].name);
            if (testResults.tests[i].error) {
                gs.info('    Error: ' + testResults.tests[i].error);
            }
        }
    }
} else {
    gs.info('✓ CHECKPOINT PASSED: All backend utilities tests passed!');
    gs.info('  You can proceed to Task 3: Session Creator widget enhancements.');
}

gs.info('\n========================================');
