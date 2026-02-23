# Step 4: Create REST API

Now we'll expose the Script Include functions via REST API endpoints.

---

## Instructions

1. In Studio, click **Create Application File**
2. Filter by: **Web Services**
3. Select: **Scripted REST API**
4. Fill in:
   - **Name**: Sprint Pointing API
   - **API ID**: sprint_pointing (will become `x_sprint_pointing`)
   - **Description**: REST API for Sprint Pointing application
5. Click **Submit**

---

## Create API Resources (Endpoints)

You'll create 7 REST resources. For each one:

### Resource 1: Create Session

1. Click **New** under Resources
2. Fill in:
   - **Name**: Create Session
   - **HTTP method**: POST
   - **Relative path**: `/session/create`
3. Click **Submit**
4. In the **Script** field, paste this code:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var requestBody = request.body.data;
    var api = new SprintPointingAPI();
    
    var result = api.createSession(
        requestBody.session_name,
        requestBody.story_ids,
        requestBody.sprint_id
    );
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 2: Get Session State

1. Click **New** under Resources
2. Fill in:
   - **Name**: Get Session State
   - **HTTP method**: GET
   - **Relative path**: `/session/{session_code}`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var api = new SprintPointingAPI();
    
    var result = api.getSessionState(sessionCode);
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 3: Submit Vote

1. Click **New** under Resources
2. Fill in:
   - **Name**: Submit Vote
   - **HTTP method**: POST
   - **Relative path**: `/vote/submit`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var requestBody = request.body.data;
    var api = new SprintPointingAPI();
    
    var result = api.submitVote(
        requestBody.session_code,
        requestBody.story_id,
        requestBody.round,
        requestBody.estimate,
        requestBody.is_pass
    );
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 4: Reveal Votes

1. Click **New** under Resources
2. Fill in:
   - **Name**: Reveal Votes
   - **HTTP method**: POST
   - **Relative path**: `/session/{session_code}/reveal`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var requestBody = request.body.data;
    var api = new SprintPointingAPI();
    
    var result = api.revealVotes(sessionCode, requestBody.story_id);
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 5: Finalize Points

1. Click **New** under Resources
2. Fill in:
   - **Name**: Finalize Points
   - **HTTP method**: POST
   - **Relative path**: `/session/{session_code}/finalize`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var requestBody = request.body.data;
    var api = new SprintPointingAPI();
    
    var result = api.finalizePoints(
        sessionCode,
        requestBody.story_id,
        requestBody.final_points
    );
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 6: New Round

1. Click **New** under Resources
2. Fill in:
   - **Name**: New Round
   - **HTTP method**: POST
   - **Relative path**: `/session/{session_code}/new_round`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var requestBody = request.body.data;
    var api = new SprintPointingAPI();
    
    var result = api.newRound(sessionCode, requestBody.story_id);
    
    return result;

})(request, response);
```

5. Click **Update**

---

### Resource 7: Next Story

1. Click **New** under Resources
2. Fill in:
   - **Name**: Next Story
   - **HTTP method**: POST
   - **Relative path**: `/session/{session_code}/next_story`
3. Click **Submit**
4. In the **Script** field, paste:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var sessionCode = request.pathParams.session_code;
    var api = new SprintPointingAPI();
    
    var result = api.nextStory(sessionCode);
    
    return result;

})(request, response);
```

5. Click **Update**

---

## Verify Your API

1. In Studio, look at your Scripted REST API
2. You should see 7 resources listed
3. Note the base path: `/api/x_sprint_pointing/sprint_pointing/v1`

---

## Next Step

Now let's test the API! Proceed to: `05_TEST_API.md`
