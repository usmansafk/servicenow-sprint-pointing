# Implementation Plan: Sprint Pointing V3 Enhancements

## Overview

This implementation plan covers 15 enhancements and defect fixes for the Sprint Pointing application V3. The work is organized into logical phases: backend utilities, Session Creator widget updates, Sprint Pointing App widget updates (frontend and backend), and integration testing. All implementation will be done in JavaScript for ServiceNow platform.

Implementation files will be created in the `servicenow/v3/` folder as implementation guides that can be applied to the ServiceNow instance at https://dev275533.service-now.com/ (scope: x_1326913_sp_point).

## Tasks

- [ ] 1. Create backend utilities and Script Includes
  - [x] 1.1 Create SprintPointingPrettyPrinter Script Include
    - Create new Script Include in servicenow/v3/script_includes/SprintPointingPrettyPrinter.js
    - Implement format() method that takes session object and returns JSON with 2-space indentation
    - _Requirements: 15.3_
  
  - [ ]* 1.2 Write property test for Pretty Printer JSON formatting
    - **Property 29: Pretty Printer JSON Formatting**
    - **Validates: Requirements 15.3**
  
  - [x] 1.3 Create SprintPointingSessionManager Script Include enhancements
    - Create servicenow/v3/script_includes/SprintPointingSessionManager.js with serialization methods
    - Implement serializeSession(sessionId) method that converts session to JSON string
    - Implement parseSession(jsonString) method that converts JSON to session object with error handling
    - Implement getParticipantCount(sessionId) method that queries vote table for distinct users
    - _Requirements: 15.1, 15.2, 15.4, 15.5, 6.1, 6.2_
  
  - [ ]* 1.4 Write property test for session serialization round-trip
    - **Property 28: Session Serialization Round-Trip**
    - **Validates: Requirements 15.1, 15.2, 15.4**
  
  - [ ]* 1.5 Write unit tests for parse error messages
    - Test malformed JSON returns descriptive error with location
    - Test missing required fields returns validation error
    - _Requirements: 15.5_
  
  - [x] 1.6 Create SprintPointingStoryManager Script Include
    - Create servicenow/v3/script_includes/SprintPointingStoryManager.js
    - Implement updateStoryReference(storyId, fieldName, referenceId) method
    - Add validation to verify reference exists in target table (sys_user_group, sys_user, rm_sprint)
    - _Requirements: 12.5, 12.6_
  
  - [ ]* 1.7 Write property test for reference field validation
    - **Property 22: Reference Field Validation**
    - **Validates: Requirements 12.6**
  
  - [ ]* 1.8 Write unit tests for reference field updates
    - Test valid reference updates persist to rm_story table
    - Test invalid reference returns error
    - _Requirements: 12.5_

- [x] 2. Checkpoint - Ensure backend utilities tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Enhance Session Creator widget
  - [x] 3.1 Implement sprint dropdown numerical sorting
    - Create servicenow/v3/widgets/session_creator/client_controller.js with sortSprintsNumerically() method
    - Extract numeric portion from sprint names using regex
    - Sort array by numeric value in ascending order
    - Update sprint dropdown population to use sorted array
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 3.2 Write property test for sprint numerical sorting
    - **Property 1: Sprint Numerical Sorting**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 3.3 Write unit tests for sprint sorting edge cases
    - Test Sprint 1 before Sprint 2
    - Test Sprint 9 before Sprint 10
    - Test sprints with non-numeric prefixes
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 3.4 Implement session link copy functionality
    - Add copySessionLink() method to client controller
    - Implement text selection and clipboard copy using navigator.clipboard API
    - Add toast notification "Link copied!" with 2-second duration
    - Update servicenow/v3/widgets/session_creator/html_template.html to add copy icon button
    - Add click handlers for both link field and copy button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.5 Write property test for session link clipboard copy
    - **Property 2: Session Link Clipboard Copy**
    - **Validates: Requirements 2.1, 2.2, 2.5**
  
  - [ ]* 3.6 Write unit tests for copy button interaction
    - Test copy button exists on right side of field
    - Test clicking link field triggers copy
    - Test confirmation message displays for 2 seconds
    - _Requirements: 2.3, 2.4_

- [x] 4. Checkpoint - Ensure Session Creator enhancements work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Enhance Sprint Pointing App widget - Timer and voting UI
  - [x] 5.1 Implement timer visibility for all participants
    - Update servicenow/v3/widgets/sprint_pointing_app/client_controller.js pollSession() method
    - Add timer_state to poll response handling
    - Implement updateTimerDisplay(remainingSeconds) method with MM:SS formatting
    - Add progress bar calculation and update logic
    - Update servicenow/v3/widgets/sprint_pointing_app/html_template.html to show timer for all users
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 5.2 Write property test for timer display format
    - **Property 3: Timer Display Format**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.3 Write property test for timer progress bar monotonicity
    - **Property 4: Timer Progress Bar Monotonicity**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.4 Write property test for timer synchronization
    - **Property 5: Timer Synchronization**
    - **Validates: Requirements 3.4**
  
  - [x] 5.5 Fix timer layout spacing
    - Update servicenow/v3/widgets/sprint_pointing_app/css_styles.css
    - Add .timer-container with margin-top: 16px for spacing from header
    - Ensure element order: header, timer, progress bar, voting cards
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.6 Write unit tests for timer layout
    - Test minimum 16px spacing between header and timer
    - Test no overlap with other elements
    - _Requirements: 4.2, 4.3_
  
  - [x] 5.7 Implement duck icon vote option
    - Update HTML template to replace "Pass" text with duck emoji 🐥
    - Verify vote recording logic handles duck card as pass vote
    - Update vote results display to show 🐥 for pass votes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 5.8 Write property test for duck card vote recording
    - **Property 17: Duck Card Vote Recording**
    - **Validates: Requirements 8.2**
  
  - [ ]* 5.9 Write unit tests for duck emoji display
    - Test duck emoji displays on pass card
    - Test duck emoji displays in vote results for pass votes
    - _Requirements: 8.1, 8.4_

- [ ] 6. Enhance Sprint Pointing App widget - Vote results and participants
  - [x] 6.1 Implement vote results display for participants
    - Update pollSession() to handle vote_results_for_participants in response
    - Implement displayVoteResults(results) method in client controller
    - Render vote distribution chart for all users
    - Render individual participant votes for all users
    - Display final result or "No consensus" message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 6.2 Write property test for vote results display synchronization
    - **Property 8: Vote Results Display Synchronization**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 6.3 Write property test for vote results consistency
    - **Property 9: Vote Results Consistency**
    - **Validates: Requirements 5.4**
  
  - [ ]* 6.4 Write unit tests for no consensus display
    - Test "No consensus" message displays when no consensus reached
    - _Requirements: 5.5_
  
  - [x] 6.2 Implement live participant count updates
    - Update pollSession() to extract participant_count from response
    - Implement updateParticipantCount(count) method
    - Update HTML template to display "Participants: N" format
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 6.6 Write property test for participant count updates
    - **Property 10: Participant Count Updates**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 6.7 Write unit tests for participant count format
    - Test display shows "Participants: N" format
    - Test updates without page refresh
    - _Requirements: 6.3, 6.5_
  
  - [x] 6.8 Implement participant avatar display
    - Implement getUserAvatar(userId) method in client controller
    - Query sys_user.photo field for avatar URL
    - Generate initials fallback (first char of first name + first char of last name)
    - Update vote results rendering to include avatar for each participant
    - Add CSS for 32px diameter avatar sizing
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 6.9 Write property test for avatar display
    - **Property 13: Avatar Display for All Participants**
    - **Validates: Requirements 7.1**
  
  - [ ]* 6.10 Write property test for initials generation
    - **Property 16: Initials Generation Algorithm**
    - **Validates: Requirements 7.4**
  
  - [ ]* 6.11 Write unit tests for avatar display
    - Test user photo displays when available
    - Test initials fallback when photo not available
    - Test avatar size is 32px diameter
    - _Requirements: 7.2, 7.3, 7.5_

- [x] 7. Checkpoint - Ensure vote results and participant features work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Enhance Sprint Pointing App widget - Story details and layout
  - [x] 8.1 Fix finalize button visibility
    - Update CSS to add .finalize-button with margin-top: 16px and text-align: center
    - Ensure button is fully visible in viewport
    - Verify element order: chart, votes, finalize button
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 8.2 Write unit tests for finalize button layout
    - Test button fully visible in viewport
    - Test minimum 16px spacing from votes section
    - Test horizontal centering
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [x] 8.3 Remove ServiceNow portal header
    - Update CSS to add #sp-nav-bar { display: none; }
    - Verify full viewport height utilization
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 8.4 Write unit tests for portal header removal
    - Test portal header is hidden
    - Test full viewport height used
    - _Requirements: 10.1, 10.3_
  
  - [x] 8.5 Reorder story details fields
    - Update HTML template to display fields in order: Assignment Group, Assigned To, Sprint, Points, Opened, Opened By
    - Move Sprint field before Points field
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ]* 8.6 Write unit tests for field ordering
    - Test Sprint displays immediately after Assigned To
    - Test Points displays immediately after Sprint
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 8.7 Implement editable story reference fields
    - Implement initializeReferenceFields() method in client controller
    - Configure Assignment Group as reference to sys_user_group table
    - Configure Assigned To as reference to sys_user table
    - Configure Sprint as reference to rm_sprint table
    - Add autocomplete functionality with 500ms response time
    - Wire up field changes to call updateStoryReference API endpoint
    - Update HTML template to use ServiceNow reference field widgets
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 8.8 Write property test for reference field autocomplete timing
    - **Property 20: Reference Field Autocomplete Timing**
    - **Validates: Requirements 12.4**
  
  - [ ]* 8.9 Write property test for reference field update persistence
    - **Property 21: Reference Field Update Persistence**
    - **Validates: Requirements 12.5**
  
  - [ ]* 8.10 Write unit tests for reference field configuration
    - Test Assignment Group links to sys_user_group
    - Test Assigned To links to sys_user
    - Test Sprint links to rm_sprint
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 8.11 Implement interface scale enhancement
    - Update CSS base font size from 16px to 19px
    - Increase voting card dimensions by 20% (width: 96px, height: 144px)
    - Increase spacing between components by 20%
    - Verify proportional scaling across all elements
    - Verify all elements remain within viewport after scaling
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 8.12 Write property test for proportional interface scaling
    - **Property 23: Proportional Interface Scaling**
    - **Validates: Requirements 13.4**
  
  - [ ]* 8.13 Write property test for scaled elements viewport containment
    - **Property 24: Scaled Elements Viewport Containment**
    - **Validates: Requirements 13.5**
  
  - [ ]* 8.14 Write unit tests for specific scale values
    - Test base font size is 19px
    - Test voting cards are 96px x 144px
    - Test spacing increased by 20%
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 9. Checkpoint - Ensure story details and layout enhancements work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Enhance backend API endpoints
  - [x] 10.1 Enhance session poll endpoint
    - Update servicenow/v3/api/session_poll.js REST endpoint
    - Add participant_count to response using getParticipantCount()
    - Add timer_state to response with active, remaining_seconds, total_seconds
    - Add vote_results_for_participants to response when votes revealed
    - _Requirements: 3.1, 3.4, 5.1, 6.1_
  
  - [ ]* 10.2 Write unit tests for enhanced poll response
    - Test participant_count included in response
    - Test timer_state included when timer active
    - Test vote_results included after reveal
    - _Requirements: 3.1, 5.1, 6.1_
  
  - [x] 10.3 Create story update reference endpoint
    - Create servicenow/v3/api/story_update_reference.js REST endpoint
    - Accept POST with { story_id, field_name, reference_id }
    - Call SprintPointingStoryManager.updateStoryReference()
    - Return { success, error_message } response
    - _Requirements: 12.5, 12.6_
  
  - [ ]* 10.4 Write unit tests for story update endpoint
    - Test valid reference updates return success
    - Test invalid reference returns error
    - _Requirements: 12.5, 12.6_

- [ ] 11. Ensure V2 compatibility and preservation
  - [x] 11.1 Verify V2 voting workflow preservation
    - Document that V3 maintains sequence: story selection, voting, reveal, finalize
    - Verify no changes to core voting logic
    - Verify session polling mechanism unchanged
    - Verify story points write to rm_story table using V2 logic
    - _Requirements: 14.1, 14.3, 14.4_
  
  - [ ]* 11.2 Write property test for V2 API compatibility
    - **Property 25: V2 API Compatibility**
    - **Validates: Requirements 14.2**
  
  - [ ]* 11.3 Write property test for story points persistence
    - **Property 26: Story Points Persistence**
    - **Validates: Requirements 14.4**
  
  - [ ]* 11.4 Write property test for V2/V3 session concurrency
    - **Property 27: V2/V3 Session Concurrency**
    - **Validates: Requirements 14.5**
  
  - [ ]* 11.5 Write integration tests for V2/V3 compatibility
    - Test V2 session can be polled by V3 code
    - Test V3 session can be polled by V2 code
    - Test concurrent V2 and V3 sessions have no conflicts
    - _Requirements: 14.2, 14.5_

- [ ] 12. Final checkpoint - Integration testing
  - [x] 12.1 Test multi-user scenarios
    - Test timer synchronization with 3+ simultaneous users
    - Test participant count updates with users joining/leaving
    - Test vote results display to all participants after reveal
    - _Requirements: 3.4, 5.1, 6.1_
  
  - [x] 12.2 Test reference field integration
    - Test Assignment Group autocomplete from sys_user_group
    - Test Assigned To autocomplete from sys_user
    - Test Sprint autocomplete from rm_sprint
    - Test reference updates persist to rm_story
    - _Requirements: 12.1, 12.2, 12.3, 12.5_
  
  - [x] 12.3 Visual verification checklist
    - Verify interface elements 20% larger than V2
    - Verify timer properly positioned without overlap
    - Verify finalize button fully visible
    - Verify duck emoji displays on pass card
    - Verify avatars display for all participants
    - Verify portal header hidden
    - Verify story fields in correct order
    - _Requirements: 4.3, 8.1, 9.1, 10.1, 11.1, 13.1, 13.2_
  
  - [x] 12.4 Cross-browser compatibility testing
    - Test all features in Chrome
    - Test all features in Firefox
    - Test all features in Safari
    - Test all features in Edge
    - _Requirements: All_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation files go in servicenow/v3/ folder as guides for ServiceNow instance
- ServiceNow instance: https://dev275533.service-now.com/
- Scope: x_1326913_sp_point
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Integration tests verify multi-user scenarios and V2/V3 compatibility
- Checkpoints ensure incremental validation at logical breaks
