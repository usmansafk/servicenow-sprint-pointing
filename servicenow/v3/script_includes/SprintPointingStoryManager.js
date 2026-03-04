/**
 * SprintPointingStoryManager
 * 
 * Purpose: Handle story metadata updates for reference fields
 * Scope: x_1326913_sp_point
 * 
 * This Script Include provides methods to update story reference fields
 * (Assignment Group, Assigned To, Sprint) with proper validation to ensure
 * the referenced records exist in their target tables.
 * 
 * Requirements: 12.5, 12.6
 */

var SprintPointingStoryManager = Class.create();
SprintPointingStoryManager.prototype = {
    initialize: function() {
        this.STORY_TABLE = 'rm_story';
        
        // Map field names to their target tables for validation
        this.REFERENCE_FIELD_MAP = {
            'assignment_group': 'sys_user_group',
            'assigned_to': 'sys_user',
            'sprint': 'rm_sprint'
        };
    },

    /**
     * Update a reference field on a story record
     * 
     * @param {String} storyId - The sys_id of the story to update
     * @param {String} fieldName - The name of the reference field to update
     *                             (assignment_group, assigned_to, or sprint)
     * @param {String} referenceId - The sys_id of the reference record
     * @returns {Boolean} true if update successful, false otherwise
     * 
     * This method validates that:
     * 1. The story exists in the rm_story table
     * 2. The field name is a valid reference field
     * 3. The reference record exists in the target table
     * 
     * Example usage:
     *   var manager = new SprintPointingStoryManager();
     *   var success = manager.updateStoryReference(
     *       'story_sys_id',
     *       'assignment_group',
     *       'group_sys_id'
     *   );
     *   if (success) {
     *       gs.info("Story updated successfully");
     *   } else {
     *       gs.error("Story update failed");
     *   }
     */
    updateStoryReference: function(storyId, fieldName, referenceId) {
        try {
            // Validate input parameters
            if (!storyId || !fieldName || !referenceId) {
                gs.error("SprintPointingStoryManager: Missing required parameters");
                return false;
            }

            // Validate field name is a supported reference field
            var targetTable = this.REFERENCE_FIELD_MAP[fieldName];
            if (!targetTable) {
                gs.error("SprintPointingStoryManager: Invalid field name '" + fieldName + "'. " +
                        "Supported fields: assignment_group, assigned_to, sprint");
                return false;
            }

            // Validate story exists
            var storyGR = new GlideRecord(this.STORY_TABLE);
            if (!storyGR.get(storyId)) {
                gs.error("SprintPointingStoryManager: Story not found with ID: " + storyId);
                return false;
            }

            // Validate reference exists in target table
            if (!this._validateReference(referenceId, targetTable)) {
                gs.error("SprintPointingStoryManager: Reference not found in table '" + 
                        targetTable + "' with ID: " + referenceId);
                return false;
            }

            // Update the story record
            storyGR.setValue(fieldName, referenceId);
            storyGR.update();

            gs.info("SprintPointingStoryManager: Successfully updated story " + storyId + 
                   " field '" + fieldName + "' to reference " + referenceId);
            return true;

        } catch (e) {
            gs.error("SprintPointingStoryManager: Error updating story reference: " + e.message);
            return false;
        }
    },

    /**
     * Validate that a reference exists in the target table (internal helper)
     * 
     * @param {String} referenceId - The sys_id to validate
     * @param {String} targetTable - The table name to check
     * @returns {Boolean} true if reference exists, false otherwise
     */
    _validateReference: function(referenceId, targetTable) {
        try {
            var gr = new GlideRecord(targetTable);
            return gr.get(referenceId);
        } catch (e) {
            gs.error("SprintPointingStoryManager: Error validating reference: " + e.message);
            return false;
        }
    },

    type: 'SprintPointingStoryManager'
};
