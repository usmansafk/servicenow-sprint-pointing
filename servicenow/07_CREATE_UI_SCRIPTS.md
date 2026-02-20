# Step 7: Add Widget Scripts

Now we'll add the Client Script (runs in browser) and Server Script (runs on server).

---

## Part A: Client Controller Script

In your widget, find the **Client Controller** section and replace with:

```javascript
function($scope, $http, $interval) {
  var c = this;
  
  // Configuration
  c.apiBase = '/api/x_1326913_sp_point/sprint_pointing_api';
  c.sessionCode = $scope.data.session_code || 'GNHDWS'; // Get from URL or default
  
  // Card values for voting
  c.cardValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 30, 40, 50, 60, 80, 100, 'pass'];
  
  // State
  c.loading = true;
  c.error = null;
  c.sessionData = null;
  c.currentStory = null;
  c.selectedCard = null;
  c.userVoted = false;
  c.voteResults = null;
  c.finalPoints = null;
  
  // Initialize
  c.init = function() {
    c.loadSession();
    
    // Poll for updates every 2 seconds
    c.pollInterval = $interval(function() {
      c.loadSession(true); // Silent reload
    }, 2000);
  };
  
  // Load session data
  c.loadSession = function(silent) {
    if (!silent) {
      c.loading = true;
    }
    
    $http.get(c.apiBase + '/session/' + c.sessionCode)
      .then(function(response) {
        if (response.data.result.success) {
          c.sessionData = response.data.result;
          c.sessionData.session_code = c.sessionCode;
          
          // Set current story (the one being voted on)
          if (c.sessionData.current_story) {
            c.currentStory = c.sessionData.current_story;
            
            // Check if user has voted
            c.checkUserVoted();
          } else {
            // No current story, select first pending
            var firstPending = c.sessionData.stories.find(function(s) {
              return s.status === 'pending';
            });
            if (firstPending) {
              c.currentStory = firstPending;
            }
          }
          
          c.loading = false;
          c.error = null;
        } else {
          c.error = response.data.result.error;
          c.loading = false;
        }
      })
      .catch(function(error) {
        c.error = 'Failed to load session';
        c.loading = false;
      });
  };
  
  // Check if current user has voted
  c.checkUserVoted = function() {
    // This is a simple check - in production you'd track this better
    // For now, we'll check if selectedCard is set
    if (c.selectedCard && c.currentStory.voting_state === 'open') {
      c.userVoted = true;
    } else if (c.currentStory.voting_state !== 'open') {
      c.userVoted = false;
      c.selectedCard = null;
    }
  };
  
  // Select a story from the list
  c.selectStory = function(story) {
    // Find full story data
    var fullStory = c.sessionData.stories.find(function(s) {
      return s.sys_id === story.sys_id;
    });
    if (fullStory) {
      c.currentStory = fullStory;
    }
  };
  
  // Select a card
  c.selectCard = function(card) {
    if (c.currentStory.voting_state === 'open' && !c.userVoted) {
      c.selectedCard = card;
    }
  };
  
  // Submit vote
  c.submitVote = function() {
    if (!c.selectedCard) return;
    
    var voteData = {
      session_code: c.sessionCode,
      story_id: c.currentStory.sys_id,
      round: c.currentStory.round,
      estimate: c.selectedCard === 'pass' ? 0 : c.selectedCard,
      is_pass: c.selectedCard === 'pass'
    };
    
    $http.post(c.apiBase + '/vote/submit', voteData)
      .then(function(response) {
        if (response.data.result.success) {
          c.userVoted = true;
          c.loadSession(true); // Refresh to show updated vote count
        } else {
          alert('Error submitting vote: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to submit vote');
      });
  };
  
  // Reveal votes (moderator only)
  c.revealVotes = function() {
    var revealData = {
      story_id: c.currentStory.sys_id
    };
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/reveal', revealData)
      .then(function(response) {
        if (response.data.result.success) {
          c.voteResults = response.data.result.results;
          c.finalPoints = c.voteResults.suggested_points;
          c.loadSession(true);
        } else {
          alert('Error revealing votes: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to reveal votes');
      });
  };
  
  // Finalize points (moderator only)
  c.finalizePoints = function() {
    if (!c.finalPoints) {
      alert('Please enter final points');
      return;
    }
    
    var finalizeData = {
      story_id: c.currentStory.sys_id,
      final_points: c.finalPoints
    };
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/finalize', finalizeData)
      .then(function(response) {
        if (response.data.result.success) {
          alert('Points finalized! Story ' + response.data.result.story_number + 
                ' updated with ' + response.data.result.points_written + ' points');
          c.voteResults = null;
          c.finalPoints = null;
          c.selectedCard = null;
          c.userVoted = false;
          c.loadSession();
        } else {
          alert('Error finalizing points: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to finalize points');
      });
  };
  
  // Start new round (moderator only)
  c.newRound = function() {
    var roundData = {
      story_id: c.currentStory.sys_id
    };
    
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/new_round', roundData)
      .then(function(response) {
        if (response.data.result.success) {
          c.voteResults = null;
          c.selectedCard = null;
          c.userVoted = false;
          c.loadSession();
        } else {
          alert('Error starting new round: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to start new round');
      });
  };
  
  // Next story (moderator only)
  c.nextStory = function() {
    $http.post(c.apiBase + '/session/' + c.sessionCode + '/next_story', {})
      .then(function(response) {
        if (response.data.result.success) {
          if (response.data.result.session_complete) {
            alert('All stories have been pointed! Session complete.');
          }
          c.voteResults = null;
          c.selectedCard = null;
          c.userVoted = false;
          c.loadSession();
        } else {
          alert('Error moving to next story: ' + response.data.result.error);
        }
      })
      .catch(function(error) {
        alert('Failed to move to next story');
      });
  };
  
  // Cleanup on destroy
  $scope.$on('$destroy', function() {
    if (c.pollInterval) {
      $interval.cancel(c.pollInterval);
    }
  });
  
  // Start the app
  c.init();
}
```

---

## Part B: Server Script

In your widget, find the **Server Script** section and replace with:

```javascript
(function() {
  // Get session code from URL parameter
  var sessionCode = $sp.getParameter('session');
  
  if (sessionCode) {
    data.session_code = sessionCode;
  } else {
    // Default for testing - replace with your actual session code
    data.session_code = 'GNHDWS';
  }
  
  // You can add more server-side logic here if needed
  // For now, we're just passing the session code to the client
})();
```

---

## Part C: Save and Test

1. Click **Save** in the widget editor
2. Click **Update** to save all changes

---

## Part D: Test the UI

### Option 1: Test in Service Portal

1. Open a new browser tab
2. Go to: `https://dev275533.service-now.com/sp?id=sprint_pointing&session=GNHDWS`
   - Replace `GNHDWS` with your actual session code from testing

3. You should see:
   - Header with session info
   - Left panel with your 3 stories
   - Center panel with story details
   - Right panel with voting cards

### Option 2: Test in Widget Preview

1. In Studio, with your widget open
2. Click the **Preview** button (eye icon)
3. This opens the widget in a test page

---

## Expected Behavior

✅ **What should work:**
- Session loads and displays stories
- Click a story to view details
- See voting cards (if you're not the moderator, you can still vote)
- Auto-refresh every 2 seconds
- Moderator controls visible if you're the moderator

✅ **Test the flow:**
1. Open the page
2. Click on a story
3. Select a card value
4. Click "Submit Vote"
5. Should show "Your vote: X" and "Waiting for others..."
6. If you're moderator, click "Stop & Reveal Votes"
7. Should show results with suggested points
8. Enter final points and click "Finalize Points"
9. Should update the story and show success message

---

## Troubleshooting

### If the page is blank:
1. Check browser console (F12) for JavaScript errors
2. Verify the API base path in Client Controller matches your scope
3. Check that session code exists

### If API calls fail:
1. Verify the API base path: `/api/x_1326913_sp_point/sprint_pointing_api`
2. Check that your session code is valid
3. Look at Network tab in browser dev tools to see actual API responses

### If styling looks wrong:
1. Make sure you saved the CSS
2. Try clearing browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that the widget is using the correct CSS

---

## Next Step

Once the UI is working, proceed to: `08_POLISH_AND_DEMO.md`
