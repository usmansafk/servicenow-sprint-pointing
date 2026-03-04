/**
 * SprintPointingSessionManager
 * 
 * Purpose: Manage session state serialization, parsing, and participant tracking
 * Scope: x_1326913_sp_point
 * 
 * This Script Include provides methods to serialize sessions to JSON,
 * parse JSON back to session objects, and track participant counts.
 * 
 * Requirements: 15.1, 15.2, 15.4, 15.5, 6.1, 6.2
 */

var SprintPointingSessionManager = Class.create();
SprintPointingSessionManager.prototype = {
    initialize: function() {
        this.SESSION_TABLE = 'x_1326913_sp_point_refinement_session';
        this.SESSION_STORY_TABLE = 'x_1326913_sp_point_session_story';
        this.VOTE_TABLE = 'x_1326913_sp_point_vote';
        this.STORY_TABLE = 'rm_story';
    },

    /**
     * Serialize a session to JSON string
     * 
     * @param {String} sessionId - The sys_id of the session to serialize
     * @returns {String} JSON string representation of the session
     * 
     * The serialized session includes:
     * - Session metadata (id, moderator, sprint, created_at, status)
     * - Stories in the session with full details
     * - All votes cast in the session
     * - Participant information
     * 
     * Example usage:
     *   var manager = new SprintPointingSessionManager();
     *   var jsonString = manager.serializeSession('abc123');
     */
    serializeSession: function(sessionId) {
        try {
            // Validate input
            if (!sessionId) {
                return JSON.stringify({
                    error: "Invalid input",
                    message: "Session ID is required"
                });
            }

            // Query session record
            var sessionGR = new GlideRecord(this.SESSION_TABLE);
            if (!sessionGR.get(sessionId)) {
                return JSON.stringify({
                    error: "Session not found",
                    message: "No session found with ID: " + sessionId
                });
            }

            // Build session object
            var sessionObject = {
                session_id: sessionGR.getUniqueValue(),
                moderator_id: sessionGR.getValue('moderator'),
                sprint_id: sessionGR.getValue('sprint'),
                created_at: sessionGR.getValue('sys_created_on'),
                status: sessionGR.getValue('status') || 'active',
                current_story_id: sessionGR.getValue('current_story') || null,
                timer_state: {
                    active: sessionGR.getValue('timer_active') === 'true',
                    remaining_seconds: parseInt(sessionGR.getValue('timer_remaining') || '0', 10),
                    total_seconds: parseInt(sessionGR.getValue('timer_total') || '0', 10)
                },
                participants: this._getParticipants(sessionId),
                stories: this._getSessionStories(sessionId),
                votes: this._getSessionVotes(sessionId)
            };

            // Serialize to JSON
            return JSON.stringify(sessionObject, null, 2);

        } catch (e) {
            return JSON.stringify({
                error: "Serialization failed",
                message: e.message,
                stack: e.stack
            }, null, 2);
        }
    },

    /**
     * Parse a JSON string to a session object
     * 
     * @param {String} jsonString - JSON string to parse
     * @returns {Object} Parsed session object or error object
     * 
     * Validates the JSON structure and returns either:
     * - A valid session object with all required fields
     * - An error object with descriptive message and location
     * 
     * Example usage:
     *   var manager = new SprintPointingSessionManager();
     *   var sessionObj = manager.parseSession(jsonString);
     *   if (sessionObj.error) {
     *       gs.error("Parse failed: " + sessionObj.message);
     *   }
     */
    parseSession: function(jsonString) {
        try {
            // Validate input
            if (!jsonString || typeof jsonString !== 'string') {
                return {
                    error: "Invalid input",
                    message: "JSON string is required",
                    location: "input validation"
                };
            }

            // Parse JSON
            var sessionObject;
            try {
                sessionObject = JSON.parse(jsonString);
            } catch (parseError) {
                return {
                    error: "JSON parse error",
                    message: parseError.message,
                    location: "JSON.parse() at position " + (parseError.message.match(/position (\d+)/) || ['', 'unknown'])[1]
                };
            }

            // Validate required fields
            var requiredFields = ['session_id', 'moderator_id', 'status'];
            for (var i = 0; i < requiredFields.length; i++) {
                var field = requiredFields[i];
                if (!sessionObject[field]) {
                    return {
                        error: "Validation error",
                        message: "Missing required field: " + field,
                        location: "field validation"
                    };
                }
            }

            // Validate timer_state structure if present
            if (sessionObject.timer_state) {
                if (typeof sessionObject.timer_state.active !== 'boolean') {
                    return {
                        error: "Validation error",
                        message: "timer_state.active must be a boolean",
                        location: "timer_state validation"
                    };
                }
            }

            // Validate arrays if present
            if (sessionObject.participants && !Array.isArray(sessionObject.participants)) {
                return {
                    error: "Validation error",
                    message: "participants must be an array",
                    location: "participants validation"
                };
            }

            if (sessionObject.stories && !Array.isArray(sessionObject.stories)) {
                return {
                    error: "Validation error",
                    message: "stories must be an array",
                    location: "stories validation"
                };
            }

            if (sessionObject.votes && !Array.isArray(sessionObject.votes)) {
                return {
                    error: "Validation error",
                    message: "votes must be an array",
                    location: "votes validation"
                };
            }

            // Return valid session object
            return sessionObject;

        } catch (e) {
            return {
                error: "Parse failed",
                message: e.message,
                location: "exception handler",
                stack: e.stack
            };
        }
    },

    /**
     * Get the count of active participants in a session
     * 
     * @param {String} sessionId - The sys_id of the session
     * @returns {Number} Count of distinct users who have voted in the session
     * 
     * Queries the vote table for distinct user_id values where the
     * session_id matches the provided sessionId.
     * 
     * Example usage:
     *   var manager = new SprintPointingSessionManager();
     *   var count = manager.getParticipantCount('abc123');
     *   gs.info("Participant count: " + count);
     */
    getParticipantCount: function(sessionId) {
        try {
            // Validate input
            if (!sessionId) {
                return 0;
            }

            // Query for distinct users who have voted
            var voteGR = new GlideAggregate(this.VOTE_TABLE);
            voteGR.addQuery('session', sessionId);
            voteGR.addAggregate('COUNT', 'DISTINCT', 'user');
            voteGR.query();

            if (voteGR.next()) {
                var count = parseInt(voteGR.getAggregate('COUNT', 'DISTINCT', 'user') || '0', 10);
                return count;
            }

            return 0;

        } catch (e) {
            gs.error("Error getting participant count: " + e.message);
            return 0;
        }
    },

    /**
     * Get participants for a session (internal helper)
     * 
     * @param {String} sessionId - The sys_id of the session
     * @returns {Array} Array of participant objects
     */
    _getParticipants: function(sessionId) {
        var participants = [];
        
        // Query distinct users from vote table
        var voteGR = new GlideRecord(this.VOTE_TABLE);
        voteGR.addQuery('session', sessionId);
        voteGR.query();

        var userIds = {};
        while (voteGR.next()) {
            var userId = voteGR.getValue('user');
            if (userId && !userIds[userId]) {
                userIds[userId] = true;
                
                // Get user details
                var userGR = new GlideRecord('sys_user');
                if (userGR.get(userId)) {
                    participants.push({
                        user_id: userId,
                        user_name: userGR.getValue('name'),
                        joined_at: voteGR.getValue('sys_created_on')
                    });
                }
            }
        }

        return participants;
    },

    /**
     * Get stories for a session (internal helper)
     * 
     * @param {String} sessionId - The sys_id of the session
     * @returns {Array} Array of story objects with details
     */
    _getSessionStories: function(sessionId) {
        var stories = [];

        // Query session stories
        var sessionStoryGR = new GlideRecord(this.SESSION_STORY_TABLE);
        sessionStoryGR.addQuery('session', sessionId);
        sessionStoryGR.query();

        while (sessionStoryGR.next()) {
            var storyId = sessionStoryGR.getValue('story');
            
            // Get story details from rm_story table
            var storyGR = new GlideRecord(this.STORY_TABLE);
            if (storyGR.get(storyId)) {
                stories.push({
                    story_id: storyId,
                    story_number: storyGR.getValue('number'),
                    short_description: storyGR.getValue('short_description'),
                    assignment_group: storyGR.getValue('assignment_group'),
                    assigned_to: storyGR.getValue('assigned_to'),
                    sprint: storyGR.getValue('sprint'),
                    points: parseInt(storyGR.getValue('story_points') || '0', 10) || null,
                    opened: storyGR.getValue('opened_at'),
                    opened_by: storyGR.getValue('opened_by')
                });
            }
        }

        return stories;
    },

    /**
     * Get votes for a session (internal helper)
     * 
     * @param {String} sessionId - The sys_id of the session
     * @returns {Array} Array of vote objects
     */
    _getSessionVotes: function(sessionId) {
        var votes = [];

        // Query votes
        var voteGR = new GlideRecord(this.VOTE_TABLE);
        voteGR.addQuery('session', sessionId);
        voteGR.query();

        while (voteGR.next()) {
            votes.push({
                vote_id: voteGR.getUniqueValue(),
                story_id: voteGR.getValue('story'),
                user_id: voteGR.getValue('user'),
                vote_value: voteGR.getValue('vote_value'),
                voted_at: voteGR.getValue('sys_created_on')
            });
        }

        return votes;
    },

    type: 'SprintPointingSessionManager'
};
