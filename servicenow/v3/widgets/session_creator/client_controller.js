/**
 * Session Creator Widget - Client Controller
 * V3 Enhancement: Sprint Dropdown Numerical Sorting
 * 
 * This file contains the client-side controller for the Session Creator widget
 * with V3 enhancements for numerical sprint sorting.
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

function($scope, $http) {
  var c = this;
  
  // Configuration
  c.apiBase = '/api/x_1326913_sp_point/sprint_pointing_api';
  
  // State
  c.sessionName = '';
  c.selectedSprint = '';
  c.sprints = [];
  c.stories = [];
  c.createdSession = null;
  c.sessionUrl = '';
  c.loading = false;
  c.loadingSprints = false;
  c.loadingStories = false;
  c.error = null;
  c.toastMessage = '';
  c.toastVisible = false;
  
  /**
   * V3 Enhancement: Sort sprints numerically by extracting numeric portion
   * 
   * This method implements numerical sorting for sprint names to ensure
   * Sprint 1 appears before Sprint 2, and Sprint 9 before Sprint 10.
   * 
   * Algorithm:
   * 1. Extract numeric portion from sprint name using regex
   * 2. Sort by numeric value in ascending order
   * 3. Handle sprints without numbers by placing them at the end
   * 
   * @param {Array} sprints - Array of sprint objects with name property
   * @returns {Array} - Sorted array of sprint objects
   * 
   * Requirements: 1.1, 1.2, 1.3
   */
  c.sortSprintsNumerically = function(sprints) {
    if (!sprints || !Array.isArray(sprints)) {
      return [];
    }
    
    // Create a copy to avoid mutating the original array
    var sortedSprints = sprints.slice();
    
    sortedSprints.sort(function(a, b) {
      // Extract numeric portion from sprint names
      // Matches one or more digits in the string
      var numA = c.extractNumericValue(a.name);
      var numB = c.extractNumericValue(b.name);
      
      // If both have numbers, sort numerically
      if (numA !== null && numB !== null) {
        return numA - numB;
      }
      
      // If only one has a number, prioritize the one with a number
      if (numA !== null) return -1;
      if (numB !== null) return 1;
      
      // If neither has a number, sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    return sortedSprints;
  };
  
  /**
   * Extract numeric value from sprint name
   * 
   * Looks for the last occurrence of a number in the string, which is typically
   * the sprint number (e.g., "Q4 Sprint 10" -> 10, "Sprint 24" -> 24)
   * 
   * @param {String} name - Sprint name (e.g., "Sprint 10", "Release 2.5")
   * @returns {Number|null} - Extracted numeric value or null if no number found
   */
  c.extractNumericValue = function(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }
    
    // Match all occurrences of one or more digits
    var matches = name.match(/\d+/g);
    
    if (matches && matches.length > 0) {
      // Use the last number found (typically the sprint number)
      return parseInt(matches[matches.length - 1], 10);
    }
    
    return null;
  };
  
  // Initialize
  c.init = function() {
    c.loadSprints();
  };
  
  // Load available sprints
  c.loadSprints = function() {
    c.loadingSprints = true;
    
    $http.get(c.apiBase + '/sprints')
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          // V3 Enhancement: Apply numerical sorting to sprints
          c.sprints = c.sortSprintsNumerically(response.data.result.sprints);
        } else {
          c.error = 'Failed to load sprints';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to connect to server';
      })
      .finally(function() {
        c.loadingSprints = false;
      });
  };
  
  // When sprint is selected, load its stories
  c.onSprintSelected = function() {
    if (!c.selectedSprint) {
      c.stories = [];
      return;
    }
    
    c.loadingStories = true;
    c.stories = [];
    
    $http.get(c.apiBase + '/sprint/' + c.selectedSprint + '/stories')
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.stories = response.data.result.stories;
          
          // Auto-generate session name if empty
          if (!c.sessionName) {
            var sprint = c.sprints.find(function(s) { 
              return s.sys_id === c.selectedSprint; 
            });
            if (sprint) {
              c.sessionName = sprint.name + ' Refinement';
            }
          }
        } else {
          c.error = 'Failed to load stories';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to load stories';
      })
      .finally(function() {
        c.loadingStories = false;
      });
  };
  
  // Check if can create session
  c.canCreate = function() {
    return c.sessionName && 
           c.selectedSprint && 
           c.stories.length > 0 && 
           !c.loading &&
           !c.createdSession;
  };
  
  // Create session
  c.createSession = function() {
    if (!c.canCreate()) return;
    
    c.loading = true;
    c.error = null;
    
    // Extract story sys_ids
    var storyIds = c.stories.map(function(s) { return s.sys_id; });
    
    var sessionData = {
      session_name: c.sessionName,
      story_ids: storyIds,
      sprint_id: c.selectedSprint
    };
    
    $http.post(c.apiBase + '/session/create', sessionData)
      .then(function(response) {
        if (response.data.result && response.data.result.success) {
          c.createdSession = response.data.result;
          c.sessionUrl = window.location.origin + 
                         '/sp?id=sprint_pointing&session=' + 
                         c.createdSession.session_code;
        } else {
          c.error = response.data.result?.error || 'Failed to create session';
        }
      })
      .catch(function(error) {
        c.error = 'Failed to create session';
      })
      .finally(function() {
        c.loading = false;
      });
  };
  
  /**
   * V3 Enhancement: Copy session link to clipboard with visual feedback
   * 
   * This method implements the session link copy functionality with:
   * 1. Text selection in the link field
   * 2. Clipboard copy using navigator.clipboard API
   * 3. Toast notification "Link copied!" for 2 seconds
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  c.copySessionLink = function() {
    if (!c.sessionUrl) {
      return;
    }
    
    // Select the text in the link field
    var linkField = document.getElementById('session-link-field');
    if (linkField) {
      linkField.select();
    }
    
    // Copy to clipboard using navigator.clipboard API
    navigator.clipboard.writeText(c.sessionUrl)
      .then(function() {
        // Show toast notification "Link copied!" for 2 seconds
        c.showToast('Link copied!', 2000);
      })
      .catch(function(error) {
        console.error('Failed to copy link:', error);
        c.showToast('Failed to copy link', 2000);
      });
  };
  
  /**
   * Show toast notification
   * 
   * @param {String} message - Message to display
   * @param {Number} duration - Duration in milliseconds
   */
  c.showToast = function(message, duration) {
    c.toastMessage = message;
    c.toastVisible = true;
    
    // Hide toast after duration
    setTimeout(function() {
      $scope.$apply(function() {
        c.toastVisible = false;
      });
    }, duration);
  };
  
  // Copy session code to clipboard (legacy method)
  c.copyCode = function() {
    if (c.createdSession) {
      navigator.clipboard.writeText(c.createdSession.session_code);
      c.showToast('Code copied!', 2000);
    }
  };
  
  // Reset form
  c.reset = function() {
    c.sessionName = '';
    c.selectedSprint = '';
    c.stories = [];
    c.createdSession = null;
    c.sessionUrl = '';
    c.error = null;
  };
  
  // Dismiss error
  c.dismissError = function() {
    c.error = null;
  };
  
  // Start
  c.init();
}
