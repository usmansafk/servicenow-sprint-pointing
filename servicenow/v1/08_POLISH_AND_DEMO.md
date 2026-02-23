# Step 8: Polish & Demo Preparation

Now let's add final touches and prepare for your presentation!

---

## Part A: Create a Session Creation Page (Optional but Recommended)

Right now you need to create sessions via REST API. Let's make it easier with a simple form.

### 1. Create Session Creator Widget

1. In Studio, create a new **Widget**
2. Name: **Session Creator**
3. Widget ID: `session_creator`

### 2. HTML Template

```html
<div class="session-creator">
  <h2>Create New Refinement Session</h2>
  
  <div class="form-group">
    <label>Session Name</label>
    <input type="text" 
           class="form-control" 
           ng-model="c.sessionName"
           placeholder="e.g., Sprint 24.2 Refinement">
  </div>
  
  <div class="form-group">
    <label>Select Stories</label>
    <p class="help-text">Enter story numbers separated by commas</p>
    <input type="text" 
           class="form-control" 
           ng-model="c.storyNumbers"
           placeholder="e.g., STRY0010002, STRY0297300">
  </div>
  
  <button class="btn btn-primary btn-lg" 
          ng-click="c.createSession()"
          ng-disabled="!c.sessionName || !c.storyNumbers">
    Create Session
  </button>
  
  <div ng-if="c.createdSession" class="success-message">
    <h3>Session Created!</h3>
    <p><strong>Session Code:</strong> {{c.createdSession.session_code}}</p>
    <p><strong>Share this link:</strong></p>
    <input type="text" 
           class="form-control" 
           value="{{c.sessionUrl}}"
           readonly
           ng-click="$event.target.select()">
    <a ng-href="{{c.sessionUrl}}" class="btn btn-success btn-lg" target="_blank">
      Open Session
    </a>
  </div>
</div>
```

### 3. Client Controller

```javascript
function($scope, $http) {
  var c = this;
  
  c.apiBase = '/api/x_1326913_sp_point/sprint_pointing_api';
  c.sessionName = '';
  c.storyNumbers = '';
  c.createdSession = null;
  c.sessionUrl = '';
  
  c.createSession = function() {
    // First, get story sys_ids from numbers
    c.getStoryIds(c.storyNumbers.split(',').map(function(s) { return s.trim(); }));
  };
  
  c.getStoryIds = function(storyNumbers) {
    // Call server to get sys_ids
    $scope.server.get({
      action: 'getStoryIds',
      storyNumbers: storyNumbers
    }).then(function(response) {
      if (response.data.story_ids && response.data.story_ids.length > 0) {
        c.createSessionWithIds(response.data.story_ids);
      } else {
        alert('No stories found with those numbers');
      }
    });
  };
  
  c.createSessionWithIds = function(storyIds) {
    var sessionData = {
      session_name: c.sessionName,
      story_ids: storyIds,
      sprint_id: ''
    };
    
    $http.post(c.apiBase + '/session/create', sessionData)
      .then(function(response) {
        if (response.data.result.success) {
          c.createdSession = response.data.result;
          c.sessionUrl = window.location.origin + '/sp?id=sprint_pointing&session=' + 
                         c.createdSession.session_code;
        } else {
          alert('Error creating session: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to create session');
      });
  };
}
```

### 4. Server Script

```javascript
(function() {
  if (input && input.action === 'getStoryIds') {
    var storyNumbers = input.storyNumbers;
    var storyIds = [];
    
    for (var i = 0; i < storyNumbers.length; i++) {
      var storyGR = new GlideRecord('rm_story');
      storyGR.addQuery('number', storyNumbers[i]);
      storyGR.query();
      
      if (storyGR.next()) {
        storyIds.push(storyGR.getUniqueValue());
      }
    }
    
    data.story_ids = storyIds;
  }
})();
```

### 5. CSS

```css
.session-creator {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.session-creator h2 {
  margin-top: 0;
  color: #2c3e50;
}

.help-text {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
}

.success-message {
  margin-top: 30px;
  padding: 20px;
  background: #d4edda;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.success-message h3 {
  color: #155724;
  margin-top: 0;
}

.success-message input {
  margin: 15px 0;
}

.success-message .btn {
  margin-top: 10px;
}
```

### 6. Create a Page for Session Creator

1. Create new **Page** in Studio
2. Page ID: `create_session`
3. Add the **Session Creator** widget to it
4. Save

Now you can go to: `https://dev275533.service-now.com/sp?id=create_session`

---

## Part B: Demo Preparation Checklist

### 1. Create Demo Data

Create a realistic demo session:

1. Go to your session creator page
2. Create a session with 4-5 stories
3. Use real-looking story descriptions
4. Name it something like "Sprint 24.2 Planning"

### 2. Test Multi-User Experience

1. Open the session in 2-3 different browsers (or incognito windows)
2. Log in as different users in each
3. Test the voting flow:
   - Each user votes
   - Moderator reveals
   - Moderator finalizes
   - Move to next story

### 3. Take Screenshots

Capture these key moments:
- Session creation page
- Main voting interface (3-panel layout)
- Voting cards selection
- Results after reveal
- Story updated with points in ServiceNow

### 4. Record a Demo Video (Optional)

Use screen recording to show:
- Creating a session (15 seconds)
- Voting process (30 seconds)
- Reveal and finalize (20 seconds)
- Showing updated story in ServiceNow (15 seconds)

Total: ~90 seconds

---

## Part C: Known Issues & Improvements

### Quick Fixes

1. **Session Code in URL**: Currently hardcoded. Make sure to pass it via URL parameter.

2. **Better Error Handling**: Add try-catch and user-friendly error messages.

3. **Loading States**: Add spinners when submitting votes or finalizing.

### Future Enhancements (Mention in Presentation)

1. **AI-Suggested Points (v2)**:
   - Analyze historical data
   - Suggest points based on similar stories
   - Learn from team's pointing patterns

2. **Real-time Updates**:
   - Replace polling with WebSockets
   - Instant updates when votes come in

3. **Mobile Responsive**:
   - Optimize for tablets and phones
   - Touch-friendly card selection

4. **Analytics Dashboard**:
   - Team velocity tracking
   - Pointing accuracy over time
   - Time saved vs. BetterVotingPoker

5. **Integration Features**:
   - Slack notifications when session starts
   - Calendar integration
   - Export session results

---

## Part D: Final Testing Checklist

Before your presentation:

- [ ] Create a fresh demo session with good data
- [ ] Test in Chrome, Firefox, and Safari
- [ ] Verify all moderator controls work
- [ ] Confirm points write back to stories
- [ ] Test with 2+ users simultaneously
- [ ] Screenshots saved and ready
- [ ] PowerPoint complete
- [ ] Demo script practiced (under 5 minutes)
- [ ] Backup plan if live demo fails (screenshots/video)

---

## You're Ready!

You've built a complete, working application that solves a real problem. The combination of:
- Solid backend (tested API)
- Modern UI (3-panel layout)
- Real-time updates (polling)
- Automatic integration (points write-back)

...makes this a strong competition entry. Good luck! 🏆
