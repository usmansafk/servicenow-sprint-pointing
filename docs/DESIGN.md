# Sprint Pointing App - Design Document

## A) UX Wireframe & User Flow

### Layout (3-Panel Design)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Sprint Pointing App                    [Session: Sprint 24.2]  [⚙] │
├──────────────┬──────────────────────────┬───────────────────────────┤
│              │                          │                           │
│  LEFT PANEL  │     CENTER PANEL         │      RIGHT PANEL          │
│  Story List  │     Story Details        │      Voting Cards         │
│              │                          │                           │
│ ┌──────────┐ │  Story: STORY0012345     │  ┌─────────────────────┐ │
│ │ STORY001 │ │  Title: User login fix   │  │  Timer: 2:34        │ │
│ │ ✓ 5 pts  │ │                          │  │  Votes: 3/5         │ │
│ └──────────┘ │  Description:            │  └─────────────────────┘ │
│              │  Fix authentication...   │                           │
│ ┌──────────┐ │                          │  Voting Cards:            │
│ │►STORY002 │ │  Acceptance Criteria:    │  ┌───┬───┬───┬───┬───┐  │
│ │ Voting   │ │  - User can login        │  │ 0 │0.5│ 1 │ 2 │ 3 │  │
│ └──────────┘ │  - Session persists      │  └───┴───┴───┴───┴───┘  │
│              │                          │  ┌───┬───┬───┬───┬───┐  │
│ ┌──────────┐ │  Assigned: John Doe      │  │ 5 │ 8 │ 13│ 20│ 30│  │
│ │ STORY003 │ │  State: Ready            │  └───┴───┴───┴───┴───┘  │
│ │ Pending  │ │                          │  ┌───┬───┬───┬───┬───┐  │
│ └──────────┘ │                          │  │ 40│ 50│ 60│ 80│100│  │
│              │                          │  └───┴───┴───┴───┴───┘  │
│              │                          │  ┌─────────┐             │
│              │                          │  │  PASS   │             │
│              │                          │  └─────────┘             │
│              │                          │                           │
│              │                          │  [Moderator Controls]     │
│              │                          │  [Start Timer]            │
│              │                          │  [Stop & Reveal]          │
│              │                          │  [Finalize Points]        │
│              │                          │  [Next Story]             │
└──────────────┴──────────────────────────┴───────────────────────────┘
```

### User Flow

**Moderator Flow:**
1. Create new session → Select sprint/stories → Share session link
2. Start timer for current story
3. Wait for votes (see count, not values)
4. Stop voting & reveal results
5. If consensus: Finalize points → Auto-writes to ServiceNow
6. If no consensus: Discuss → New round
7. Next story → Repeat

**Participant Flow:**
1. Join session via link
2. Read story details in center panel
3. Select point card when ready
4. Wait for reveal
5. See results chart (like BetterVotingPoker donut chart)
6. Participate in discussion if needed
7. Re-vote if new round started

### Key UX Features (Inspired by BetterVotingPoker)
- **Card Selection**: Large, clickable cards with hover effects
- **Anonymous Voting**: Cards show "?" until reveal
- **Results Visualization**: Donut chart showing vote distribution
- **Status Indicators**: 
  - Green checkmark = Pointed
  - Orange arrow = Currently voting
  - Gray = Pending
  - Strikethrough = Skipped
- **Timer**: Countdown timer (optional, moderator controlled)
- **Vote Count**: "3/5 voted" indicator

---

## B) Data Model

### Table 1: Refinement Session (x_[scope]_ref_session)

| Field Name | Type | Description |
|------------|------|-------------|
| sys_id | GUID | Primary key |
| session_name | String(100) | e.g., "Sprint 24.2 Refinement" |
| session_code | String(10) | Short code for joining (e.g., "ABC123") |
| moderator | Reference(sys_user) | User who created/controls session |
| state | Choice | Draft, Active, Completed |
| current_story | Reference(Session Story) | Story being voted on |
| created_on | DateTime | Session creation timestamp |
| started_on | DateTime | When voting began |
| completed_on | DateTime | When session ended |
| sprint | Reference(rm_sprint) | Optional: link to sprint |

**States:**
- `draft` - Session created, not started
- `active` - Voting in progress
- `completed` - Session ended

---

### Table 2: Session Story (x_[scope]_session_story)

| Field Name | Type | Description |
|------------|------|-------------|
| sys_id | GUID | Primary key |
| session | Reference(Refinement Session) | Parent session |
| story | Reference(rm_story) | Link to actual story record |
| order | Integer | Display order in session |
| status | Choice | pending, voting, pointed, skipped |
| final_points | Integer | Agreed-upon points (written back to story) |
| voting_state | Choice | open, closed, revealed |
| current_round | Integer | Round number (for re-votes) |
| voted_on | DateTime | When pointing completed |

**Status Values:**
- `pending` - Not yet voted on
- `voting` - Currently being voted on
- `pointed` - Points finalized
- `skipped` - Team decided to skip

**Voting State:**
- `open` - Accepting votes
- `closed` - Voting stopped, not revealed
- `revealed` - Results shown to all

---

### Table 3: Vote (x_[scope]_vote)

| Field Name | Type | Description |
|------------|------|-------------|
| sys_id | GUID | Primary key |
| session_story | Reference(Session Story) | Which story being voted on |
| round | Integer | Round number (for re-votes) |
| voter | Reference(sys_user) | Who voted |
| estimate | Decimal | Point value selected |
| voted_at | DateTime | When vote was cast |
| is_pass | Boolean | True if user selected "pass" |

---

## C) API Contract

### Base URL
`/api/x_[scope]_sprint_pointing/v1`

### Endpoints

#### 1. Create Session
```
POST /session/create
Request:
{
  "session_name": "Sprint 24.2 Refinement",
  "story_ids": ["story_sys_id_1", "story_sys_id_2"],
  "sprint_id": "sprint_sys_id" // optional
}

Response:
{
  "success": true,
  "session_id": "abc123def456",
  "session_code": "ABC123",
  "session_url": "/sprint_pointing?session=ABC123"
}
```

#### 2. Get Session State
```
GET /session/{session_code}

Response:
{
  "session_id": "abc123",
  "session_name": "Sprint 24.2",
  "state": "active",
  "moderator_id": "user123",
  "is_moderator": true,
  "current_story": {
    "sys_id": "story123",
    "number": "STORY0012345",
    "short_description": "User login fix",
    "description": "Fix authentication...",
    "acceptance_criteria": "- User can login\n- Session persists",
    "assigned_to": "John Doe",
    "state": "Ready",
    "current_points": null,
    "voting_state": "open",
    "round": 1,
    "timer_started_at": "2026-02-19T10:30:00Z",
    "votes_count": 3,
    "total_participants": 5
  },
  "stories": [
    {
      "sys_id": "story123",
      "number": "STORY001",
      "short_description": "...",
      "status": "pointed",
      "final_points": 5,
      "order": 1
    },
    {
      "sys_id": "story124",
      "number": "STORY002",
      "short_description": "...",
      "status": "voting",
      "order": 2
    }
  ],
  "participants": [
    {"user_id": "user1", "name": "John Doe", "has_voted": true},
    {"user_id": "user2", "name": "Jane Smith", "has_voted": false}
  ]
}
```

#### 3. Submit Vote
```
POST /vote/submit
Request:
{
  "session_code": "ABC123",
  "story_id": "story123",
  "round": 1,
  "estimate": 5,
  "is_pass": false
}

Response:
{
  "success": true,
  "vote_recorded": true,
  "votes_count": 4,
  "total_participants": 5
}
```

#### 4. Start Timer (Moderator Only)
```
POST /session/{session_code}/start_timer
Request:
{
  "duration_seconds": 180 // 3 minutes
}

Response:
{
  "success": true,
  "timer_started_at": "2026-02-19T10:30:00Z",
  "timer_ends_at": "2026-02-19T10:33:00Z"
}
```

#### 5. Stop Voting & Reveal (Moderator Only)
```
POST /session/{session_code}/reveal
Request: {}

Response:
{
  "success": true,
  "voting_state": "revealed",
  "results": {
    "votes": [
      {"voter_name": "John Doe", "estimate": 5},
      {"voter_name": "Jane Smith", "estimate": 3},
      {"voter_name": "Bob Wilson", "estimate": 5},
      {"voter_name": "Alice Brown", "estimate": 5},
      {"voter_name": "Charlie Davis", "estimate": "pass"}
    ],
    "distribution": {
      "3": 1,
      "5": 3,
      "pass": 1
    },
    "suggested_points": 5,
    "has_consensus": true
  }
}
```

#### 6. Finalize Points (Moderator Only)
```
POST /session/{session_code}/finalize
Request:
{
  "story_id": "story123",
  "final_points": 5
}

Response:
{
  "success": true,
  "story_updated": true,
  "story_number": "STORY0012345",
  "points_written": 5
}
```

#### 7. New Round (Moderator Only)
```
POST /session/{session_code}/new_round
Request:
{
  "story_id": "story123"
}

Response:
{
  "success": true,
  "round": 2,
  "voting_state": "open",
  "votes_cleared": true
}
```

#### 8. Next Story (Moderator Only)
```
POST /session/{session_code}/next_story
Request: {}

Response:
{
  "success": true,
  "previous_story": "STORY0012345",
  "current_story": {
    "sys_id": "story124",
    "number": "STORY0012346",
    "short_description": "..."
  }
}
```

---

## D) State Machine

### Session States
```
Draft → Active → Completed
```

### Story Voting States
```
pending → voting (open) → voting (closed) → voting (revealed) → pointed
                ↑______________|
                (new round)
```

### State Transitions

**Session Level:**
- `Draft → Active`: Moderator starts session
- `Active → Completed`: Moderator ends session or all stories pointed

**Story Level:**
- `pending → voting`: Story selected by moderator
- `voting (open) → voting (closed)`: Moderator stops voting
- `voting (closed) → voting (revealed)`: Moderator reveals results
- `voting (revealed) → pointed`: Moderator finalizes points
- `voting (revealed) → voting (open)`: Moderator starts new round
- `voting → skipped`: Moderator skips story

---

## E) Front-End Component Map

### React Component Structure

```
<SprintPointingApp>
  ├── <SessionHeader>
  │     ├── Session name
  │     ├── Session code
  │     └── Settings button
  │
  ├── <ThreePanelLayout>
  │     │
  │     ├── <LeftPanel: StoryList>
  │     │     ├── <StoryListItem> (repeated)
  │     │     │     ├── Story number
  │     │     │     ├── Status icon
  │     │     │     └── Points (if pointed)
  │     │     └── Session controls (moderator)
  │     │
  │     ├── <CenterPanel: StoryDetails>
  │     │     ├── Story number
  │     │     ├── Short description
  │     │     ├── Description
  │     │     ├── Acceptance criteria
  │     │     ├── Assigned to
  │     │     └── Current state
  │     │
  │     └── <RightPanel: VotingArea>
  │           ├── <VotingStatus>
  │           │     ├── Timer display
  │           │     └── Vote count
  │           │
  │           ├── <VotingCards> (if voting open)
  │           │     └── <Card> (repeated for each value)
  │           │
  │           ├── <ResultsChart> (if revealed)
  │           │     ├── Donut chart
  │           │     └── Vote list
  │           │
  │           └── <ModeratorControls> (if moderator)
  │                 ├── Start Timer button
  │                 ├── Stop & Reveal button
  │                 ├── New Round button
  │                 ├── Finalize Points button
  │                 └── Next Story button
```

### API Integration Points

Each component calls backend APIs:

- `<StoryList>` → GET `/session/{code}` (poll every 2 seconds)
- `<StoryDetails>` → Uses data from session state
- `<VotingCards>` → POST `/vote/submit` on card click
- `<ResultsChart>` → Uses data from reveal response
- `<ModeratorControls>` → POST to various moderator endpoints

---

## F) Build Plan - Phases

### Phase 0: Setup ✓
- [x] Create project structure
- [ ] Connect to ServiceNow PDI
- [ ] Set up GitHub repo
- [ ] Initialize Git

### Phase 1: Backend Foundation (Week 1)
**ServiceNow Artifacts to Create:**
1. Create Scoped Application: `Sprint Pointing` (scope: `sprint_pointing`)
2. Create 3 custom tables (with fields from data model)
3. Create Script Include: `SprintPointingAPI`
4. Create Scripted REST API: `/api/x_sprint_pointing/v1`
5. Implement endpoints: create, get session, submit vote
6. Test with REST API Explorer

### Phase 2: Basic UI (Week 1-2)
**ServiceNow Artifacts:**
1. Create Service Portal Page: `sprint_pointing`
2. Create Widget: `Sprint Pointing App`
3. Build 3-panel layout (HTML/CSS)
4. Implement polling (AngularJS client script)
5. Connect to backend APIs
6. Test basic flow: create session → view stories

### Phase 3: Voting Logic (Week 2)
**Features:**
1. Implement card selection UI
2. Submit vote functionality
3. Anonymous voting (hide values until reveal)
4. Moderator controls (reveal, finalize)
5. Results visualization (donut chart)
6. Auto-write points back to story

### Phase 4: Polish & Demo Prep (Week 3)
**Features:**
1. Timer functionality
2. New round / next story
3. UI polish (animations, loading states)
4. Error handling
5. Session management (join by code)
6. Create demo data
7. Practice presentation

### Phase 5: Future Enhancements (Post-MVP)
- AI-suggested points based on historical data
- Story complexity analysis
- Team velocity tracking
- Mobile responsive design
- WebSocket for real-time updates (replace polling)

---

## Configuration Questions

To proceed with implementation, I need:

1. **Story Table Name**: What table stores your backlog stories?
   - Common options: `rm_story` (Agile Development), `pm_story`, custom table?

2. **Points Field Name**: What field stores story points?
   - Common: `story_points`, `effort`, `points`?

3. **Sprint Table** (if applicable): Do you use sprints?
   - Table name: `rm_sprint`?

4. **Scope Name**: What should we name the scoped app?
   - Suggestion: `sprint_pointing` or `x_sprint_pointing`

5. **PDI Instance URL**: What's your ServiceNow instance URL?
   - Format: `https://devXXXXX.service-now.com`
