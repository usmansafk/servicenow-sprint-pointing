# Step 5: Test the API

Before building the UI, let's make sure the backend works!

---

## Setup: Create Test Data

First, we need some stories to test with.

### Create Test Stories

1. In your ServiceNow instance, type in filter navigator: **Agile Development > Stories**
2. Click **New** to create a story
3. Fill in:
   - **Short description**: Test Story 1 - User Login
   - **Description**: Implement user authentication
   - **Acceptance Criteria**: User can login with email and password
   - **State**: Draft
4. Click **Submit**
5. Note the Story Number (e.g., STORY0001234)
6. Repeat to create 2-3 more test stories

### Get Story sys_ids

1. Open one of your test stories
2. Right-click the header bar → **Copy sys_id**
3. Paste it somewhere (you'll need it for testing)
4. Repeat for other stories

---

## Test Using REST API Explorer

### 1. Open REST API Explorer

1. In filter navigator, type: **System Web Services > REST API Explorer**
2. Click on it

### 2. Test: Create Session

1. In REST API Explorer:
   - **Namespace**: Select `x_sprint_pointing`
   - **API Name**: Select `sprint_pointing`
   - **API Version**: v1
   - **Resource**: POST `/session/create`

2. In the **Request Body**, paste (replace with your story sys_ids):

```json
{
  "session_name": "Test Sprint Refinement",
  "story_ids": [
    "YOUR_STORY_SYS_ID_1",
    "YOUR_STORY_SYS_ID_2",
    "YOUR_STORY_SYS_ID_3"
  ],
  "sprint_id": ""
}
```

3. Click **Send**

4. You should see a response like:

```json
{
  "success": true,
  "session_id": "abc123...",
  "session_code": "XYZ789",
  "session_url": "/sp?id=sprint_pointing&session=XYZ789"
}
```

5. **IMPORTANT**: Copy the `session_code` - you'll need it for other tests!

---

### 3. Test: Get Session State

1. Change Resource to: GET `/session/{session_code}`
2. In the path parameter, enter your session code (e.g., XYZ789)
3. Click **Send**

4. You should see:
   - Session details
   - List of stories with status "pending"
   - Your user as moderator

---

### 4. Test: Start Voting on First Story

We need to manually set a story to "voting" status first.

1. Go to: **Sprint Pointing > Session Story**
2. Open the first story in your session
3. Change:
   - **Status**: Voting
   - **Voting State**: Open
4. Click **Update**

---

### 5. Test: Submit Vote

1. In REST API Explorer, select: POST `/vote/submit`
2. Request body:

```json
{
  "session_code": "YOUR_SESSION_CODE",
  "story_id": "YOUR_SESSION_STORY_SYS_ID",
  "round": 1,
  "estimate": 5,
  "is_pass": false
}
```

3. Click **Send**
4. Should return: `{"success": true, "vote_recorded": true, "votes_count": 1}`

---

### 6. Test: Reveal Votes

1. Select: POST `/session/{session_code}/reveal`
2. Path param: your session code
3. Request body:

```json
{
  "story_id": "YOUR_SESSION_STORY_SYS_ID"
}
```

4. Click **Send**
5. Should show vote results with distribution

---

### 7. Test: Finalize Points

1. Select: POST `/session/{session_code}/finalize`
2. Request body:

```json
{
  "story_id": "YOUR_SESSION_STORY_SYS_ID",
  "final_points": 5
}
```

3. Click **Send**
4. Should return: `{"success": true, "story_updated": true}`

5. **Verify**: Go to your original story in Agile Development
   - The **Story Points** field should now be 5!

---

### 8. Test: Next Story

1. Select: POST `/session/{session_code}/next_story`
2. Click **Send**
3. Should move to the next pending story

---

## Troubleshooting

### If you get errors:

1. **"Session not found"**
   - Check your session code is correct
   - Verify session exists in: Sprint Pointing > Refinement Session

2. **"Story not found"**
   - Make sure you're using the Session Story sys_id, not the rm_story sys_id
   - Check: Sprint Pointing > Session Story

3. **"Only moderator can..."**
   - Make sure you're logged in as the user who created the session

4. **Script errors**
   - Check: System Logs > System Log > Application Logs
   - Look for errors from SprintPointingAPI

---

## Success Criteria

✅ You should be able to:
- Create a session
- Get session state
- Submit a vote
- Reveal votes
- Finalize points (and see them written to the story!)
- Move to next story

---

## Next Step

Once all API tests pass, we'll build the UI!

Proceed to: `06_CREATE_UI.md`

---

## Quick Reference: Your API Base URL

```
https://dev275533.service-now.com/api/x_sprint_pointing/sprint_pointing/v1
```
