# Step 2: Create Custom Tables

You'll create 3 tables. Follow these instructions for each table.

---

## Table 1: Refinement Session

### Instructions:
1. In Studio, click **Create Application File**
2. Filter by: **Data Model**
3. Select: **Table**
4. Fill in:
   - **Label**: Refinement Session
   - **Name**: (auto-fills as `x_sprint_pointing_refinement_session`)
   - **Add module to menu**: Yes
   - **Create new menu**: Sprint Pointing
5. Click **Create**

### Add Fields:
After the table is created, add these fields by clicking **New** in the Columns tab:

| Column Label | Column Name | Type | Max Length | Reference | Choices |
|--------------|-------------|------|------------|-----------|---------|
| Session Name | session_name | String | 100 | - | - |
| Session Code | session_code | String | 10 | - | - |
| Moderator | moderator | Reference | - | User [sys_user] | - |
| State | state | Choice | - | - | draft, active, completed |
| Current Story | current_story | Reference | - | Session Story [x_sprint_pointing_session_story] | - |
| Started On | started_on | Date/Time | - | - | - |
| Completed On | completed_on | Date/Time | - | - | - |
| Sprint | sprint | Reference | - | Sprint [rm_sprint] | - |

**For the State field (Choice type):**
- Click on the field after creating it
- Scroll to **Choices** section
- Add 3 choices:
  - Value: `draft`, Label: `Draft`, Sequence: 100
  - Value: `active`, Label: `Active`, Sequence: 200
  - Value: `completed`, Label: `Completed`, Sequence: 300

**Make Session Code Unique:**
1. Click on the `session_code` field
2. Check the box: **Unique**
3. Click **Update**

---

## Table 2: Session Story

### Instructions:
1. In Studio, click **Create Application File**
2. Select: **Table**
3. Fill in:
   - **Label**: Session Story
   - **Name**: (auto-fills as `x_sprint_pointing_session_story`)
   - **Add module to menu**: Yes
   - **Use existing menu**: Sprint Pointing
4. Click **Create**

### Add Fields:

| Column Label | Column Name | Type | Max Length | Reference | Choices |
|--------------|-------------|------|------------|-----------|---------|
| Session | session | Reference | - | Refinement Session [x_sprint_pointing_refinement_session] | - |
| Story | story | Reference | - | Story [rm_story] | - |
| Order | order | Integer | - | - | - |
| Status | status | Choice | - | - | pending, voting, pointed, skipped |
| Final Points | final_points | Decimal | - | - | - |
| Voting State | voting_state | Choice | - | - | open, closed, revealed |
| Current Round | current_round | Integer | - | - | - |
| Voted On | voted_on | Date/Time | - | - | - |

**For the Status field (Choice type):**
Add choices:
- Value: `pending`, Label: `Pending`, Sequence: 100
- Value: `voting`, Label: `Voting`, Sequence: 200
- Value: `pointed`, Label: `Pointed`, Sequence: 300
- Value: `skipped`, Label: `Skipped`, Sequence: 400

**For the Voting State field (Choice type):**
Add choices:
- Value: `open`, Label: `Open`, Sequence: 100
- Value: `closed`, Label: `Closed`, Sequence: 200
- Value: `revealed`, Label: `Revealed`, Sequence: 300

**Set Default Values:**
1. Click on `current_round` field → Default value: `1`
2. Click on `status` field → Default value: `pending`

---

## Table 3: Vote

### Instructions:
1. In Studio, click **Create Application File**
2. Select: **Table**
3. Fill in:
   - **Label**: Vote
   - **Name**: (auto-fills as `x_sprint_pointing_vote`)
   - **Add module to menu**: Yes
   - **Use existing menu**: Sprint Pointing
4. Click **Create**

### Add Fields:

| Column Label | Column Name | Type | Max Length | Reference |
|--------------|-------------|------|------------|-----------|
| Session Story | session_story | Reference | - | Session Story [x_sprint_pointing_session_story] |
| Round | round | Integer | - | - |
| Voter | voter | Reference | - | User [sys_user] |
| Estimate | estimate | Decimal | - | - |
| Voted At | voted_at | Date/Time | - | - |
| Is Pass | is_pass | True/False | - | - |

**Set Default Values:**
1. Click on `round` field → Default value: `1`
2. Click on `is_pass` field → Default value: `false`

---

## Verify Your Tables

1. In Studio, look at the left sidebar under **Data Model > Tables**
2. You should see:
   - Refinement Session
   - Session Story
   - Vote

3. Click on each table and verify all fields are present

---

## Next Step

Once all 3 tables are created with all fields, proceed to: `03_CREATE_SCRIPT_INCLUDE.md`
