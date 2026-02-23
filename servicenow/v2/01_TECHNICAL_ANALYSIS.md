# V2 Technical Analysis & Solutions

## A) What's Causing the Flicker

### Root Cause Analysis

The flicker happens because:

1. **Full State Replacement on Every Poll**
   ```javascript
   // CURRENT (BAD): Replaces entire state every 2 seconds
   c.sessionData = response.data.result;
   ```
   This triggers a complete re-render of all components, even when data hasn't changed.

2. **No Reference Stability**
   - Every poll creates new object references
   - Angular's digest cycle sees "new" objects and re-renders
   - Story list items lose their identity between renders

3. **Missing Change Detection**
   - No comparison between old and new data
   - UI updates even when nothing changed

4. **Unstable Keys**
   - If using `ng-repeat` without `track by`, Angular recreates DOM elements

### The Fix

1. **Deep Compare Before Update**
   ```javascript
   // Only update if data actually changed
   if (!angular.equals(c.sessionData, newData)) {
     c.sessionData = newData;
   }
   ```

2. **Granular Updates**
   ```javascript
   // Update only changed properties
   if (c.sessionData.current_story?.votes_count !== newData.current_story?.votes_count) {
     c.sessionData.current_story.votes_count = newData.current_story.votes_count;
   }
   ```

3. **Stable Keys in ng-repeat**
   ```html
   <!-- Use track by sys_id for stable DOM elements -->
   <div ng-repeat="story in c.sessionData.stories track by story.sys_id">
   ```

4. **Debounced Polling**
   - Don't start new poll until previous completes
   - Skip poll if tab is not visible

---

## B) Improved State Architecture

### Current Architecture (Problematic)

```
Widget
├── c.sessionData (replaced every 2 sec)
├── c.currentStory (derived, unstable)
├── c.selectedCard (local)
├── c.userVoted (local)
└── c.voteResults (local)
```

### Proposed Architecture

```
SessionContext (Top-Level State)
├── session: {
│     id, code, name, state, moderator_id
│   }
├── stories: Map<sys_id, StoryData>  // Stable references
├── currentStoryId: string
├── votes: Map<story_id, VoteData[]>
├── participants: Map<user_id, ParticipantData>
├── ui: {
│     selectedCard, userVoted, showResults, timerState
│   }
└── meta: {
│     isModerator, currentUserId, lastPollTime
│   }

Actions (Mutations)
├── updateSession(partialData)
├── updateStory(storyId, partialData)
├── setCurrentStory(storyId)
├── submitVote(storyId, estimate)
├── revealVotes(storyId)
├── finalizePoints(storyId, points)
├── nextStory()
└── resetVotingState()
```

### State Update Strategy

```javascript
// Immutable updates with change detection
function updateSessionState(currentState, newData) {
  const changes = {};
  
  // Check session-level changes
  if (newData.state !== currentState.session.state) {
    changes.session = { ...currentState.session, state: newData.state };
  }
  
  // Check story changes (only update changed stories)
  const storyChanges = {};
  newData.stories.forEach(story => {
    const existing = currentState.stories.get(story.sys_id);
    if (!existing || !shallowEqual(existing, story)) {
      storyChanges[story.sys_id] = story;
    }
  });
  
  if (Object.keys(storyChanges).length > 0) {
    changes.stories = new Map([...currentState.stories, ...Object.entries(storyChanges)]);
  }
  
  // Return null if no changes (prevents re-render)
  return Object.keys(changes).length > 0 ? { ...currentState, ...changes } : null;
}
```

---

## C) Corrected Voting Lifecycle

### State Machine

```
Story States:
┌─────────┐    moderator     ┌─────────┐    moderator    ┌──────────┐
│ PENDING │ ──────────────▶  │ VOTING  │ ─────────────▶  │ REVEALED │
└─────────┘   startVoting    └─────────┘    reveal       └──────────┘
                                  │                            │
                                  │ (new round)                │ finalize
                                  ◀────────────────────────────┤
                                                               ▼
                                                         ┌─────────┐
                                                         │ POINTED │
                                                         └─────────┘

Voting Sub-States (within VOTING):
┌──────────────┐
│ voting_state │
├──────────────┤
│ open         │ ← Participants can vote
│ closed       │ ← Voting stopped, not revealed
│ revealed     │ ← Results visible
└──────────────┘
```

### Complete Voting Flow

```javascript
// 1. MODERATOR: Start voting on a story
async function startVoting(storyId) {
  // Update story status to 'voting', voting_state to 'open'
  await api.post('/session/{code}/start_voting', { story_id: storyId });
  
  // UI: Show voting cards to all participants
  // UI: Show "Stop Voting" button to moderator
}

// 2. PARTICIPANT: Select and submit vote
async function submitVote(storyId, estimate, isPass = false) {
  // Validate: voting must be open
  if (currentStory.voting_state !== 'open') {
    throw new Error('Voting is not open');
  }
  
  // Submit vote (backend handles one-per-user-per-round)
  const result = await api.post('/vote/submit', {
    session_code: sessionCode,
    story_id: storyId,
    round: currentStory.round,
    estimate: estimate,
    is_pass: isPass
  });
  
  // UI: Show "Vote submitted" state
  // UI: Update vote count
  setUserVoted(true);
  setSelectedCard(estimate);
}

// 3. MODERATOR: Reveal votes
async function revealVotes(storyId) {
  const result = await api.post('/session/{code}/reveal', { story_id: storyId });
  
  // Result contains:
  // - votes: [{ voter_name, voter_id, estimate }]
  // - distribution: { "5": 3, "3": 2, "8": 1 }
  // - suggested_points: 5
  // - has_consensus: true/false
  
  // UI: Show donut chart
  // UI: Show individual votes
  // UI: Show "Finalize" and "New Round" buttons
  setVoteResults(result.results);
}

// 4. MODERATOR: Finalize points
async function finalizePoints(storyId, finalPoints) {
  const result = await api.post('/session/{code}/finalize', {
    story_id: storyId,
    final_points: finalPoints
  });
  
  // Backend: Updates session_story.final_points
  // Backend: Updates session_story.status = 'pointed'
  // Backend: Updates rm_story.story_points = finalPoints
  
  // UI: Show success message
  // UI: Update story in list with points
  // UI: Enable "Next Story" button
  resetVotingState();
}

// 5. MODERATOR: Move to next story
async function nextStory() {
  const result = await api.post('/session/{code}/next_story');
  
  // Backend: Finds next pending story
  // Backend: Sets it to 'voting' status
  
  // UI: Update current story
  // UI: Reset voting state
  // UI: Show voting cards
  setCurrentStoryId(result.current_story.sys_id);
  resetVotingState();
}

// 6. MODERATOR: Start new round (if no consensus)
async function newRound(storyId) {
  const result = await api.post('/session/{code}/new_round', { story_id: storyId });
  
  // Backend: Increments round number
  // Backend: Resets voting_state to 'open'
  // (Previous votes preserved for history)
  
  // UI: Clear vote results
  // UI: Show voting cards again
  resetVotingState();
}

// Helper: Reset UI voting state
function resetVotingState() {
  setSelectedCard(null);
  setUserVoted(false);
  setVoteResults(null);
  setFinalPoints(null);
}
```

### Role-Based Rendering Logic

```javascript
// Determine what to show based on role and state
function getVotingPanelContent(session, currentStory, isModerator, userVoted) {
  if (!currentStory) {
    return { type: 'NO_STORY', message: 'Select a story to begin' };
  }
  
  const { status, voting_state } = currentStory;
  
  // Story not yet being voted on
  if (status === 'pending') {
    if (isModerator) {
      return { type: 'START_VOTING_PROMPT' };
    }
    return { type: 'WAITING', message: 'Waiting for moderator to start voting' };
  }
  
  // Voting in progress
  if (status === 'voting') {
    if (voting_state === 'open') {
      if (userVoted) {
        return { type: 'VOTE_SUBMITTED', showModeratorControls: isModerator };
      }
      return { type: 'SHOW_CARDS' };
    }
    
    if (voting_state === 'revealed') {
      return { type: 'SHOW_RESULTS', showModeratorControls: isModerator };
    }
  }
  
  // Story already pointed
  if (status === 'pointed') {
    return { 
      type: 'POINTED', 
      points: currentStory.final_points,
      showNextButton: isModerator 
    };
  }
  
  return { type: 'UNKNOWN' };
}
```

---

## D) Updated API Interaction Structure

### New Endpoints Needed

```javascript
// Add these to your Scripted REST API

// 1. Start voting on a story (new endpoint)
POST /session/{session_code}/start_voting
Request: { story_id: string }
Response: { success: true, story: StoryData }

// 2. Get stories by sprint (new endpoint)
GET /sprint/{sprint_id}/stories
Response: { 
  success: true, 
  stories: [{ sys_id, number, short_description, story_points, state }] 
}

// 3. Get available sprints (new endpoint)
GET /sprints
Response: { 
  success: true, 
  sprints: [{ sys_id, name, start_date, end_date, state }] 
}

// 4. Update story details (new endpoint)
PATCH /story/{story_id}
Request: { field_name: value, ... }
Response: { success: true, story: StoryData }
```

### API Service Layer

```javascript
// Centralized API service
var SprintPointingService = {
  baseUrl: '/api/x_1326913_sp_point/sprint_pointing_api',
  
  // Session operations
  createSession: function(name, storyIds, sprintId) {
    return this._post('/session/create', { session_name: name, story_ids: storyIds, sprint_id: sprintId });
  },
  
  getSession: function(sessionCode) {
    return this._get('/session/' + sessionCode);
  },
  
  // Voting operations
  startVoting: function(sessionCode, storyId) {
    return this._post('/session/' + sessionCode + '/start_voting', { story_id: storyId });
  },
  
  submitVote: function(sessionCode, storyId, round, estimate, isPass) {
    return this._post('/vote/submit', {
      session_code: sessionCode,
      story_id: storyId,
      round: round,
      estimate: estimate,
      is_pass: isPass
    });
  },
  
  revealVotes: function(sessionCode, storyId) {
    return this._post('/session/' + sessionCode + '/reveal', { story_id: storyId });
  },
  
  finalizePoints: function(sessionCode, storyId, points) {
    return this._post('/session/' + sessionCode + '/finalize', { story_id: storyId, final_points: points });
  },
  
  newRound: function(sessionCode, storyId) {
    return this._post('/session/' + sessionCode + '/new_round', { story_id: storyId });
  },
  
  nextStory: function(sessionCode) {
    return this._post('/session/' + sessionCode + '/next_story', {});
  },
  
  // Sprint operations
  getSprints: function() {
    return this._get('/sprints');
  },
  
  getSprintStories: function(sprintId) {
    return this._get('/sprint/' + sprintId + '/stories');
  },
  
  // Story operations
  updateStory: function(storyId, updates) {
    return this._patch('/story/' + storyId, updates);
  },
  
  // HTTP helpers
  _get: function(path) {
    return $http.get(this.baseUrl + path).then(this._handleResponse);
  },
  
  _post: function(path, data) {
    return $http.post(this.baseUrl + path, data).then(this._handleResponse);
  },
  
  _patch: function(path, data) {
    return $http.patch(this.baseUrl + path, data).then(this._handleResponse);
  },
  
  _handleResponse: function(response) {
    if (response.data.result && response.data.result.success) {
      return response.data.result;
    }
    throw new Error(response.data.result?.error || 'API request failed');
  }
};
```

---

## E) Improved Layout Structure

### Component Breakdown

```
SprintPointingApp
├── SessionHeader
│   ├── SessionInfo (name, code, copy button)
│   ├── TimerBar (progress bar, countdown)
│   ├── ParticipantAvatars (who's in session)
│   └── SessionControls (settings, leave)
│
├── ThreePanelLayout
│   ├── LeftPanel: StoryListPanel
│   │   ├── ProgressIndicator ("Story 3 of 8")
│   │   ├── StoryList
│   │   │   └── StoryListItem (for each story)
│   │   │       ├── StatusBadge (pending/voting/pointed)
│   │   │       ├── StoryNumber
│   │   │       ├── StoryTitle
│   │   │       └── PointsBadge (if pointed)
│   │   └── SessionActions (moderator: end session)
│   │
│   ├── CenterPanel: StoryDetailPanel
│   │   ├── StoryHeader
│   │   │   ├── StoryNumber
│   │   │   ├── TypeBadge
│   │   │   └── StateBadge
│   │   ├── StoryMetadata
│   │   │   ├── AssignmentGroup (editable)
│   │   │   ├── AssignedTo (editable)
│   │   │   ├── Points (display)
│   │   │   ├── Opened (display)
│   │   │   └── OpenedBy (display)
│   │   ├── StoryDescription (editable)
│   │   ├── AcceptanceCriteria (editable)
│   │   └── SaveButton (if changes made)
│   │
│   └── RightPanel: VotingPanel
│       ├── VotingStatus
│       │   ├── RoundIndicator ("Round 1")
│       │   ├── VoteProgress ("3 of 5 voted")
│       │   └── ParticipantVoteStatus
│       │
│       ├── VotingCards (when voting open)
│       │   └── VoteCard (for each value)
│       │
│       ├── VoteSubmitted (after user votes)
│       │   ├── SelectedCardDisplay
│       │   └── WaitingMessage
│       │
│       ├── VoteResults (when revealed)
│       │   ├── DonutChart
│       │   ├── VoteDistribution
│       │   ├── IndividualVotes
│       │   └── SuggestedPoints
│       │
│       └── ModeratorControls
│           ├── StartVotingButton (when pending)
│           ├── RevealButton (when voting open)
│           ├── FinalizeSection (when revealed)
│           │   ├── PointsInput
│           │   └── FinalizeButton
│           ├── NewRoundButton (when revealed)
│           └── NextStoryButton (when pointed)
│
└── Modals
    ├── CreateSessionModal
    │   ├── SessionNameInput
    │   ├── SprintSelector (dropdown)
    │   ├── StorySelector (auto-populated)
    │   └── CreateButton
    │
    └── JoinSessionModal
        ├── SessionCodeInput
        └── JoinButton
```

### Story Detail Panel - Field Layout

```
┌─────────────────────────────────────────────────────────────┐
│  STRY0010002                    [Enhancement] [Ready]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Assignment Group    │  │ Assigned To         │          │
│  │ [Development Team▼] │  │ [John Doe      ▼]  │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Points              │  │ Opened              │          │
│  │ 5                   │  │ Feb 15, 2026        │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────┐                                   │
│  │ Opened By           │                                   │
│  │ Jane Smith          │                                   │
│  └─────────────────────┘                                   │
│                                                             │
│  Description                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Implement user authentication with OAuth 2.0        │   │
│  │ integration for single sign-on capability.          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Acceptance Criteria                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - User can login with SSO                           │   │
│  │ - Session persists for 24 hours                     │   │
│  │ - Logout clears all tokens                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Save Changes]  (only visible if edits made)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## F) Code Skeleton Examples

See the following files for implementation:
- `02_POLLING_HOOK.md` - Smart polling with change detection
- `03_SESSION_CONTEXT.md` - Centralized state management
- `04_VOTING_LOGIC.md` - Complete voting lifecycle
- `05_UPDATED_HTML.md` - New HTML template
- `06_UPDATED_CSS.md` - Structural CSS updates
- `07_UPDATED_CLIENT.md` - New client controller
- `08_BACKEND_UPDATES.md` - New API endpoints
