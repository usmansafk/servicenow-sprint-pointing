# Fix Script Include - Update Table Names

## The Problem
Your scope is `x_1326913_sp_point` but the code has `x_sprint_pointing`

## The Fix

1. In Studio, open your **Script Include: SprintPointingAPI**

2. Find these 3 lines at the top of the `initialize` function (around line 3-5):

```javascript
this.sessionTable = 'x_sprint_pointing_refinement_session';
this.sessionStoryTable = 'x_sprint_pointing_session_story';
this.voteTable = 'x_sprint_pointing_vote';
```

3. Replace them with:

```javascript
this.sessionTable = 'x_1326913_sp_point_refinement_session';
this.sessionStoryTable = 'x_1326913_sp_point_session_story';
this.voteTable = 'x_1326913_sp_point_vote';
```

4. Click **Save** (Ctrl+S or Cmd+S)

## Verify Table Names

To make sure these are correct:

1. In Studio, look at your **Tables** in the left sidebar
2. Click on each table and check the **Name** field (not Label)
3. The names should be:
   - `x_1326913_sp_point_refinement_session`
   - `x_1326913_sp_point_session_story`
   - `x_1326913_sp_point_vote`

If they're different, update the Script Include to match exactly.

## Test Again

Now go back to REST API Explorer and try creating a session again!

Your API base path is:
```
/api/x_1326913_sp_point/sprint_pointing_api
```
