# Step 3: Create Script Include (Business Logic)

## Instructions

1. In Studio, click **Create Application File**
2. Filter by: **Server Development**
3. Select: **Script Include**
4. Fill in:
   - **Name**: SprintPointingAPI
   - **API Name**: (auto-fills)
   - **Client callable**: Check this box ✓
   - **Description**: Business logic for Sprint Pointing application
5. Click **Create**

6. Replace ALL the code in the editor with the code below

7. Click **Save** (Ctrl+S or Cmd+S)

---

## Code to Copy/Paste

```javascript
var SprintPointingAPI = Class.create();
SprintPointingAPI.prototype = {
    initialize: function() {
        this.sessionTable = 'x_sprint_pointing_refinement_session';
        this.sessionStoryTable = 'x_sprint_pointing_session_story';
        this.voteTable = 'x_sprint_pointing_vote';
    },

    // Generate random 6-character session code
    _generateSessionCode: function() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
        var code = '';
        for (var i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Create a new refinement session
    createSession: function(sessionName, storyIds, sprintId) {
        try {
            var currentUser = gs.getUserID();
            
            // Create session record
            var sessionGR = new GlideRecord(this.sessionTable);
            sessionGR.initialize();
            sessionGR.setValue('session_name', sessionName);
            sessionGR.setValue('session_code', this._generateSessionCode());
            sessionGR.setValue('moderator', currentUser);
            sessionGR.setValue('state', 'draft');
            if (sprintId) {
                sessionGR.setValue('sprint', sprintId);
            }
            var sessionId = sessionGR.insert();

            if (!sessionId) {
                return {success: false, error: 'Failed to create session'};
            }

            // Add stories to session
            var order = 1;
            for (var i = 0; i < storyIds.length; i++) {
                var storyGR = new GlideRecord(this.sessionStoryTable);
                storyGR.initialize();
                storyGR.setValue('session', sessionId);
                storyGR.setValue('story', storyIds[i]);
                storyGR.setValue('order', order++);
                storyGR.setValue('status', 'pending');
                storyGR.insert();
            }

            // Get session code for response
            sessionGR.get(sessionId);
            var sessionCode = sessionGR.getValue('session_code');

            return {
                success: true,
                session_id: sessionId,
                session_code: sessionCode,
                session_url: '/sp?id=sprint_pointing&session=' + sessionCode
            };

        } catch (e) {
            gs.error('Error creating session: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Get session state and all related data
    getSessionState: function(sessionCode) {
        try {
            var currentUser = gs.getUserID();
            
            // Get session
            var sessionGR = new GlideRecord(this.sessionTable);
            sessionGR.addQuery('session_code', sessionCode);
            sessionGR.query();
            
            if (!sessionGR.next()) {
                return {success: false, error: 'Session not found'};
            }

            var sessionId = sessionGR.getUniqueValue();
            var isModerator = (sessionGR.getValue('moderator') == currentUser);
            
            var result = {
                success: true,
                session_id: sessionId,
                session_name: sessionGR.getValue('session_name'),
                state: sessionGR.getValue('state'),
                moderator_id: sessionGR.getValue('moderator'),
                is_moderator: isModerator,
                stories: [],
                participants: [],
                current_story: null
            };

            // Get all stories in session
            var storyGR = new GlideRecord(this.sessionStoryTable);
            storyGR.addQuery('session', sessionId);
            storyGR.orderBy('order');
            storyGR.query();

            while (storyGR.next()) {
                var storyData = {
                    sys_id: storyGR.getUniqueValue(),
                    order: storyGR.getValue('order'),
                    status: storyGR.getValue('status'),
                    final_points: storyGR.getValue('final_points'),
                    voting_state: storyGR.getValue('voting_state'),
                    round: storyGR.getValue('current_round')
                };

                // Get story details from rm_story
                var rmStoryGR = new GlideRecord('rm_story');
                if (rmStoryGR.get(storyGR.getValue('story'))) {
                    storyData.number = rmStoryGR.getValue('number');
                    storyData.short_description = rmStoryGR.getValue('short_description');
                    storyData.description = rmStoryGR.getValue('description');
                    storyData.acceptance_criteria = rmStoryGR.getValue('acceptance_criteria');
                    storyData.state = rmStoryGR.getValue('state');
                    storyData.current_points = rmStoryGR.getValue('story_points');
                    
                    // Get assigned user name
                    if (rmStoryGR.getValue('assigned_to')) {
                        var userGR = new GlideRecord('sys_user');
                        if (userGR.get(rmStoryGR.getValue('assigned_to'))) {
                            storyData.assigned_to = userGR.getValue('name');
                        }
                    }
                }

                // If this is the current story being voted on
                if (storyGR.getValue('status') == 'voting') {
                    // Count votes for this story
                    var voteCount = new GlideAggregate(this.voteTable);
                    voteCount.addQuery('session_story', storyGR.getUniqueValue());
                    voteCount.addQuery('round', storyGR.getValue('current_round'));
                    voteCount.addAggregate('COUNT');
                    voteCount.query();
                    
                    storyData.votes_count = 0;
                    if (voteCount.next()) {
                        storyData.votes_count = parseInt(voteCount.getAggregate('COUNT'));
                    }

                    result.current_story = storyData;
                }

                result.stories.push(storyData);
            }

            // Get participants (users who have voted in this session)
            var participantGR = new GlideAggregate(this.voteTable);
            participantGR.addQuery('session_story.session', sessionId);
            participantGR.groupBy('voter');
            participantGR.query();

            while (participantGR.next()) {
                var voterId = participantGR.getValue('voter');
                var userGR = new GlideRecord('sys_user');
                if (userGR.get(voterId)) {
                    result.participants.push({
                        user_id: voterId,
                        name: userGR.getValue('name')
                    });
                }
            }

            return result;

        } catch (e) {
            gs.error('Error getting session state: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Submit a vote
    submitVote: function(sessionCode, storyId, round, estimate, isPass) {
        try {
            var currentUser = gs.getUserID();

            // Verify session exists and get session story
            var sessionStoryGR = new GlideRecord(this.sessionStoryTable);
            sessionStoryGR.addQuery('sys_id', storyId);
            sessionStoryGR.addQuery('session.session_code', sessionCode);
            sessionStoryGR.query();

            if (!sessionStoryGR.next()) {
                return {success: false, error: 'Story not found in session'};
            }

            // Check if voting is open
            if (sessionStoryGR.getValue('voting_state') != 'open') {
                return {success: false, error: 'Voting is not open for this story'};
            }

            // Check if user already voted in this round
            var existingVote = new GlideRecord(this.voteTable);
            existingVote.addQuery('session_story', storyId);
            existingVote.addQuery('round', round);
            existingVote.addQuery('voter', currentUser);
            existingVote.query();

            if (existingVote.next()) {
                // Update existing vote
                existingVote.setValue('estimate', estimate);
                existingVote.setValue('is_pass', isPass);
                existingVote.setValue('voted_at', new GlideDateTime());
                existingVote.update();
            } else {
                // Create new vote
                var voteGR = new GlideRecord(this.voteTable);
                voteGR.initialize();
                voteGR.setValue('session_story', storyId);
                voteGR.setValue('round', round);
                voteGR.setValue('voter', currentUser);
                voteGR.setValue('estimate', estimate);
                voteGR.setValue('is_pass', isPass);
                voteGR.setValue('voted_at', new GlideDateTime());
                voteGR.insert();
            }

            // Count total votes
            var voteCount = new GlideAggregate(this.voteTable);
            voteCount.addQuery('session_story', storyId);
            voteCount.addQuery('round', round);
            voteCount.addAggregate('COUNT');
            voteCount.query();
            
            var totalVotes = 0;
            if (voteCount.next()) {
                totalVotes = parseInt(voteCount.getAggregate('COUNT'));
            }

            return {
                success: true,
                vote_recorded: true,
                votes_count: totalVotes
            };

        } catch (e) {
            gs.error('Error submitting vote: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Reveal votes (moderator only)
    revealVotes: function(sessionCode, storyId) {
        try {
            if (!this._isModerator(sessionCode)) {
                return {success: false, error: 'Only moderator can reveal votes'};
            }

            var sessionStoryGR = new GlideRecord(this.sessionStoryTable);
            if (!sessionStoryGR.get(storyId)) {
                return {success: false, error: 'Story not found'};
            }

            // Update voting state
            sessionStoryGR.setValue('voting_state', 'revealed');
            sessionStoryGR.update();

            // Get all votes
            var voteGR = new GlideRecord(this.voteTable);
            voteGR.addQuery('session_story', storyId);
            voteGR.addQuery('round', sessionStoryGR.getValue('current_round'));
            voteGR.query();

            var votes = [];
            var distribution = {};
            var numericVotes = [];

            while (voteGR.next()) {
                var estimate = voteGR.getValue('estimate');
                var isPass = voteGR.getValue('is_pass') == 'true';
                
                // Get voter name
                var voterName = 'Unknown';
                var userGR = new GlideRecord('sys_user');
                if (userGR.get(voteGR.getValue('voter'))) {
                    voterName = userGR.getValue('name');
                }

                var voteValue = isPass ? 'pass' : estimate;
                votes.push({
                    voter_name: voterName,
                    estimate: voteValue
                });

                // Build distribution
                if (!distribution[voteValue]) {
                    distribution[voteValue] = 0;
                }
                distribution[voteValue]++;

                // Collect numeric votes for consensus calculation
                if (!isPass) {
                    numericVotes.push(parseFloat(estimate));
                }
            }

            // Calculate suggested points (majority vote)
            var suggestedPoints = null;
            var hasConsensus = false;

            if (numericVotes.length > 0) {
                // Find most common vote
                var voteCounts = {};
                var maxCount = 0;
                var mostCommon = null;

                for (var i = 0; i < numericVotes.length; i++) {
                    var vote = numericVotes[i];
                    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
                    if (voteCounts[vote] > maxCount) {
                        maxCount = voteCounts[vote];
                        mostCommon = vote;
                    }
                }

                suggestedPoints = mostCommon;
                
                // Check if majority (>50%)
                hasConsensus = (maxCount / numericVotes.length) > 0.5;
            }

            return {
                success: true,
                voting_state: 'revealed',
                results: {
                    votes: votes,
                    distribution: distribution,
                    suggested_points: suggestedPoints,
                    has_consensus: hasConsensus
                }
            };

        } catch (e) {
            gs.error('Error revealing votes: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Finalize points and write back to story (moderator only)
    finalizePoints: function(sessionCode, storyId, finalPoints) {
        try {
            if (!this._isModerator(sessionCode)) {
                return {success: false, error: 'Only moderator can finalize points'};
            }

            var sessionStoryGR = new GlideRecord(this.sessionStoryTable);
            if (!sessionStoryGR.get(storyId)) {
                return {success: false, error: 'Story not found'};
            }

            // Update session story
            sessionStoryGR.setValue('final_points', finalPoints);
            sessionStoryGR.setValue('status', 'pointed');
            sessionStoryGR.setValue('voted_on', new GlideDateTime());
            sessionStoryGR.update();

            // Write points back to actual story
            var rmStoryGR = new GlideRecord('rm_story');
            if (rmStoryGR.get(sessionStoryGR.getValue('story'))) {
                rmStoryGR.setValue('story_points', finalPoints);
                rmStoryGR.update();

                return {
                    success: true,
                    story_updated: true,
                    story_number: rmStoryGR.getValue('number'),
                    points_written: finalPoints
                };
            } else {
                return {success: false, error: 'Could not update story'};
            }

        } catch (e) {
            gs.error('Error finalizing points: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Start new round (moderator only)
    newRound: function(sessionCode, storyId) {
        try {
            if (!this._isModerator(sessionCode)) {
                return {success: false, error: 'Only moderator can start new round'};
            }

            var sessionStoryGR = new GlideRecord(this.sessionStoryTable);
            if (!sessionStoryGR.get(storyId)) {
                return {success: false, error: 'Story not found'};
            }

            // Increment round and reset voting state
            var newRound = parseInt(sessionStoryGR.getValue('current_round')) + 1;
            sessionStoryGR.setValue('current_round', newRound);
            sessionStoryGR.setValue('voting_state', 'open');
            sessionStoryGR.update();

            return {
                success: true,
                round: newRound,
                voting_state: 'open',
                votes_cleared: true
            };

        } catch (e) {
            gs.error('Error starting new round: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Move to next story (moderator only)
    nextStory: function(sessionCode) {
        try {
            if (!this._isModerator(sessionCode)) {
                return {success: false, error: 'Only moderator can advance stories'};
            }

            // Get session
            var sessionGR = new GlideRecord(this.sessionTable);
            sessionGR.addQuery('session_code', sessionCode);
            sessionGR.query();
            
            if (!sessionGR.next()) {
                return {success: false, error: 'Session not found'};
            }

            var sessionId = sessionGR.getUniqueValue();

            // Find current story and mark as complete if needed
            var currentStoryGR = new GlideRecord(this.sessionStoryTable);
            currentStoryGR.addQuery('session', sessionId);
            currentStoryGR.addQuery('status', 'voting');
            currentStoryGR.query();
            
            var previousStoryNumber = null;
            if (currentStoryGR.next()) {
                // Mark as pointed if not already
                if (currentStoryGR.getValue('status') == 'voting') {
                    currentStoryGR.setValue('status', 'pending'); // Reset if not finalized
                }
                currentStoryGR.update();

                // Get story number
                var rmStoryGR = new GlideRecord('rm_story');
                if (rmStoryGR.get(currentStoryGR.getValue('story'))) {
                    previousStoryNumber = rmStoryGR.getValue('number');
                }
            }

            // Find next pending story
            var nextStoryGR = new GlideRecord(this.sessionStoryTable);
            nextStoryGR.addQuery('session', sessionId);
            nextStoryGR.addQuery('status', 'pending');
            nextStoryGR.orderBy('order');
            nextStoryGR.setLimit(1);
            nextStoryGR.query();

            if (nextStoryGR.next()) {
                // Set as voting
                nextStoryGR.setValue('status', 'voting');
                nextStoryGR.setValue('voting_state', 'open');
                nextStoryGR.setValue('current_round', 1);
                nextStoryGR.update();

                // Get story details
                var nextRmStoryGR = new GlideRecord('rm_story');
                var storyData = {};
                if (nextRmStoryGR.get(nextStoryGR.getValue('story'))) {
                    storyData = {
                        sys_id: nextStoryGR.getUniqueValue(),
                        number: nextRmStoryGR.getValue('number'),
                        short_description: nextRmStoryGR.getValue('short_description')
                    };
                }

                return {
                    success: true,
                    previous_story: previousStoryNumber,
                    current_story: storyData
                };
            } else {
                // No more stories - complete session
                sessionGR.setValue('state', 'completed');
                sessionGR.setValue('completed_on', new GlideDateTime());
                sessionGR.update();

                return {
                    success: true,
                    session_complete: true,
                    message: 'All stories have been pointed'
                };
            }

        } catch (e) {
            gs.error('Error moving to next story: ' + e.message);
            return {success: false, error: e.message};
        }
    },

    // Helper: Check if current user is moderator
    _isModerator: function(sessionCode) {
        var currentUser = gs.getUserID();
        var sessionGR = new GlideRecord(this.sessionTable);
        sessionGR.addQuery('session_code', sessionCode);
        sessionGR.query();
        
        if (sessionGR.next()) {
            return (sessionGR.getValue('moderator') == currentUser);
        }
        return false;
    },

    type: 'SprintPointingAPI'
};
```

---

## What This Code Does

This Script Include contains all the business logic:
- Create sessions
- Get session state (for polling)
- Submit votes
- Reveal votes with consensus calculation
- Finalize points and write back to rm_story
- Start new rounds
- Advance to next story
- Moderator permission checks

---

## Next Step

Once saved, proceed to: `04_CREATE_REST_API.md`
