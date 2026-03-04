/**
 * SprintPointingPrettyPrinter
 * 
 * Purpose: Format session objects for debugging and logging
 * Scope: x_1326913_sp_point
 * 
 * This Script Include provides utility methods to format session objects
 * into human-readable JSON with proper indentation for debugging purposes.
 * 
 * Requirements: 15.3
 */

var SprintPointingPrettyPrinter = Class.create();
SprintPointingPrettyPrinter.prototype = {
    initialize: function() {
    },

    /**
     * Format a session object into pretty-printed JSON
     * 
     * @param {Object} sessionObject - The session object to format
     * @returns {String} Formatted JSON string with 2-space indentation
     * 
     * Example usage:
     *   var printer = new SprintPointingPrettyPrinter();
     *   var sessionObj = { session_id: "123", moderator_id: "456" };
     *   var formatted = printer.format(sessionObj);
     *   gs.info(formatted);
     */
    format: function(sessionObject) {
        try {
            // Use JSON.stringify with 2-space indentation
            return JSON.stringify(sessionObject, null, 2);
        } catch (e) {
            // If formatting fails, return error message
            return JSON.stringify({
                error: "Failed to format session object",
                message: e.message
            }, null, 2);
        }
    },

    type: 'SprintPointingPrettyPrinter'
};
