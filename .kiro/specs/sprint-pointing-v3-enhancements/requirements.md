# Requirements Document

## Introduction

This document specifies requirements for Version 3 of the Sprint Pointing application, focusing on enhancements and defect fixes to the existing V2 implementation. The scope includes UI improvements, bug fixes, and usability enhancements while preserving the existing architecture and voting workflow. This version does NOT include visual redesign, which is reserved for Version 4.

## Glossary

- **Sprint_Pointing_System**: The ServiceNow scoped application (x_1326913_sp_point) that enables collaborative story point estimation
- **Session_Creator_Page**: The interface where moderators create new pointing sessions and configure sprint selection
- **Live_Session_Page**: The interface where moderators and participants vote on story points in real-time
- **Moderator**: The user who creates and controls a pointing session
- **Participant**: A user who joins a pointing session to vote on story points
- **Timer**: The countdown mechanism that limits voting duration for each story
- **Vote_Reveal**: The action that displays all participant votes after voting concludes
- **Reference_Field**: A ServiceNow field type that links to records in another table with autocomplete functionality
- **Session_Link**: The shareable URL that allows participants to join a pointing session
- **Story_Details_Panel**: The section displaying story metadata (Assignment Group, Assigned To, Sprint, Points, etc.)
- **Vote_Distribution_Chart**: The visual representation showing how many participants voted for each point value
- **Finalize_Button**: The button that commits the final story point value to the story record

## Requirements

### Requirement 1: Sprint Dropdown Numerical Sorting

**User Story:** As a moderator, I want the sprint dropdown sorted numerically, so that I can quickly find the correct sprint without confusion from alphabetical ordering.

#### Acceptance Criteria

1. WHEN the Session_Creator_Page loads the sprint dropdown, THE Sprint_Pointing_System SHALL sort sprint options by extracting the numeric portion and ordering numerically ascending
2. THE Sprint_Pointing_System SHALL display Sprint 1 before Sprint 2, and Sprint 9 before Sprint 10
3. WHEN sprint names contain non-numeric prefixes, THE Sprint_Pointing_System SHALL extract the numeric portion for sorting purposes

### Requirement 2: Session Link Copy Interaction

**User Story:** As a moderator, I want to easily copy the session link, so that I can quickly share it with participants.

#### Acceptance Criteria

1. WHEN a moderator clicks the session link field, THE Sprint_Pointing_System SHALL select all text in the field
2. WHEN a moderator clicks the session link field, THE Sprint_Pointing_System SHALL copy the link to the system clipboard
3. WHEN the link is copied to clipboard, THE Sprint_Pointing_System SHALL display a confirmation message "Link copied!" for 2 seconds
4. THE Sprint_Pointing_System SHALL display a copy icon button on the right side of the session link field
5. WHEN a moderator clicks the copy icon button, THE Sprint_Pointing_System SHALL copy the link to clipboard and display the confirmation message

### Requirement 3: Timer Visibility for All Participants

**User Story:** As a participant, I want to see the voting timer, so that I know how much time remains to cast my vote.

#### Acceptance Criteria

1. WHEN voting begins for a story, THE Sprint_Pointing_System SHALL display the timer to all participants and the moderator
2. THE Sprint_Pointing_System SHALL display the timer in format "Voting Time Remaining MM:SS"
3. THE Sprint_Pointing_System SHALL display a progress bar that decreases as time elapses
4. WHEN the timer updates, THE Sprint_Pointing_System SHALL synchronize the displayed time across all participant sessions within 1 second
5. WHEN the timer reaches zero, THE Sprint_Pointing_System SHALL hide the timer from all participants

### Requirement 4: Timer Layout Spacing Fix

**User Story:** As a user, I want the timer properly positioned, so that it doesn't overlap with other interface elements.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL display elements in order: Voting section header, vertical spacing, Timer display, Progress bar, Voting cards
2. THE Sprint_Pointing_System SHALL maintain minimum 16 pixels vertical spacing between the Voting section header and Timer display
3. THE Sprint_Pointing_System SHALL prevent the Timer display from overlapping any other interface elements

### Requirement 5: Vote Results Display for Participants

**User Story:** As a participant, I want to see the vote results after reveal, so that I understand the voting outcome and consensus.

#### Acceptance Criteria

1. WHEN the moderator triggers Vote_Reveal, THE Sprint_Pointing_System SHALL display the Vote_Distribution_Chart to all participants within 1 second
2. WHEN the moderator triggers Vote_Reveal, THE Sprint_Pointing_System SHALL display individual participant votes to all participants within 1 second
3. WHEN the moderator triggers Vote_Reveal, THE Sprint_Pointing_System SHALL display the final vote result to all participants within 1 second
4. THE Sprint_Pointing_System SHALL display identical vote result information to participants and the moderator
5. IF no consensus is reached, THEN THE Sprint_Pointing_System SHALL display "No consensus" message to all participants

### Requirement 6: Live Participant Count Updates

**User Story:** As a moderator, I want to see the participant count update in real-time, so that I know who has joined the session.

#### Acceptance Criteria

1. WHEN a new user joins the session, THE Sprint_Pointing_System SHALL increment the displayed participant count within 2 seconds
2. WHEN a user leaves the session, THE Sprint_Pointing_System SHALL decrement the displayed participant count within 2 seconds
3. THE Sprint_Pointing_System SHALL display the participant count in format "Participants: N" where N is the current count
4. THE Sprint_Pointing_System SHALL update the participant count using the existing session polling mechanism
5. THE Sprint_Pointing_System SHALL update the participant count without requiring page refresh

### Requirement 7: Participant Avatar Display

**User Story:** As a user, I want to see participant avatars, so that I can quickly identify who voted for each option.

#### Acceptance Criteria

1. WHEN displaying participant names in vote results, THE Sprint_Pointing_System SHALL display an avatar icon to the left of each name
2. IF a participant has a ServiceNow user photo, THEN THE Sprint_Pointing_System SHALL display that photo as the avatar
3. IF a participant does not have a ServiceNow user photo, THEN THE Sprint_Pointing_System SHALL display a fallback avatar containing the user's initials
4. THE Sprint_Pointing_System SHALL generate initials by taking the first character of the first name and first character of the last name
5. THE Sprint_Pointing_System SHALL display avatars with consistent sizing of 32 pixels diameter

### Requirement 8: Duck Icon Vote Option

**User Story:** As a participant, I want a visual duck icon for the pass option, so that the interface is more engaging and memorable.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL display a duck emoji 🐥 in place of the text "Pass" on the pass voting card
2. WHEN a participant clicks the duck icon card, THE Sprint_Pointing_System SHALL record the vote as a pass vote
3. THE Sprint_Pointing_System SHALL maintain identical functionality for the duck icon card as the previous Pass card
4. WHEN displaying vote results, THE Sprint_Pointing_System SHALL show the duck emoji 🐥 for participants who voted pass

### Requirement 9: Finalize Button Visibility Fix

**User Story:** As a moderator, I want the Finalize Points button fully visible, so that I can easily commit the final story point value.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL display the Finalize_Button completely within the visible viewport
2. THE Sprint_Pointing_System SHALL center the Finalize_Button horizontally within its container
3. THE Sprint_Pointing_System SHALL display elements in order: Vote_Distribution_Chart, Individual Votes section, Finalize_Button
4. THE Sprint_Pointing_System SHALL maintain minimum 16 pixels vertical spacing between Individual Votes section and Finalize_Button

### Requirement 10: ServiceNow Portal Header Removal

**User Story:** As a user, I want a full-screen pointing interface, so that I can focus on voting without distractions from the standard portal navigation.

#### Acceptance Criteria

1. WHEN the Live_Session_Page loads, THE Sprint_Pointing_System SHALL hide the default ServiceNow Service Portal navigation bar
2. THE Sprint_Pointing_System SHALL display only the Sprint Pointing interface elements on the Live_Session_Page
3. THE Sprint_Pointing_System SHALL utilize the full browser viewport height for the pointing interface

### Requirement 11: Story Details Field Reordering

**User Story:** As a user, I want Sprint displayed before Points in story details, so that the field order matches my workflow priority.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL display Story_Details_Panel fields in order: Assignment Group, Assigned To, Sprint, Points, Opened, Opened By
2. THE Sprint_Pointing_System SHALL display the Sprint field immediately after the Assigned To field
3. THE Sprint_Pointing_System SHALL display the Points field immediately after the Sprint field

### Requirement 12: Editable Story Reference Fields

**User Story:** As a moderator, I want to edit Assignment Group, Assigned To, and Sprint using native ServiceNow fields, so that I can update story metadata during the pointing session with proper validation.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL render the Assignment Group field as a ServiceNow Reference_Field linked to the sys_user_group table
2. THE Sprint_Pointing_System SHALL render the Assigned To field as a ServiceNow Reference_Field linked to the sys_user table
3. THE Sprint_Pointing_System SHALL render the Sprint field as a ServiceNow Reference_Field linked to the rm_sprint table
4. WHEN a moderator types in a Reference_Field, THE Sprint_Pointing_System SHALL display autocomplete suggestions within 500 milliseconds
5. WHEN a moderator selects a value from autocomplete, THE Sprint_Pointing_System SHALL update the story record with the selected reference
6. THE Sprint_Pointing_System SHALL prevent free text entry in Reference_Field inputs that do not match valid table records

### Requirement 13: Interface Scale Enhancement

**User Story:** As a user, I want larger interface elements, so that the application is more readable during team meetings and presentations.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL increase the base font size from 16 pixels to 19 pixels
2. THE Sprint_Pointing_System SHALL increase voting card dimensions by 20 percent from current size
3. THE Sprint_Pointing_System SHALL increase spacing between interface components by 20 percent from current spacing
4. THE Sprint_Pointing_System SHALL maintain proportional scaling across all Live_Session_Page elements
5. THE Sprint_Pointing_System SHALL ensure all interface elements remain within the viewport after scaling

### Requirement 14: Preserve Existing Voting Workflow

**User Story:** As a system administrator, I want V3 enhancements to maintain V2 functionality, so that existing voting workflows continue to operate without disruption.

#### Acceptance Criteria

1. THE Sprint_Pointing_System SHALL maintain the V2 voting workflow sequence: story selection, voting, reveal, finalize
2. THE Sprint_Pointing_System SHALL maintain compatibility with existing V2 backend API endpoints
3. THE Sprint_Pointing_System SHALL maintain the existing session polling mechanism for real-time updates
4. THE Sprint_Pointing_System SHALL write story points to the rm_story table using the existing V2 logic
5. WHEN V3 enhancements are deployed, THE Sprint_Pointing_System SHALL support concurrent sessions created in V2 and V3 without conflicts

### Requirement 15: Sprint Pointing Parser and Serializer

**User Story:** As a developer, I want to parse and serialize session state, so that sessions can be persisted and restored reliably.

#### Acceptance Criteria

1. WHEN session state is saved, THE Sprint_Pointing_System SHALL serialize the session object to JSON format
2. WHEN session state is loaded, THE Sprint_Pointing_System SHALL parse JSON into a valid session object
3. THE Pretty_Printer SHALL format session objects into valid JSON with 2-space indentation
4. FOR ALL valid session objects, THE Sprint_Pointing_System SHALL satisfy the round-trip property: parse(serialize(session)) produces an equivalent session object
5. IF JSON parsing fails, THEN THE Sprint_Pointing_System SHALL return a descriptive error message indicating the parse failure location
