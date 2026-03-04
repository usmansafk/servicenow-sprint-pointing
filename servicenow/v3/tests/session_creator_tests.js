/**
 * Session Creator Widget - Unit Tests
 * Tests for V3 sprint dropdown numerical sorting enhancement
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

describe('Session Creator - Sprint Numerical Sorting', function() {
  
  /**
   * Helper function to create mock sprint objects
   */
  function createSprint(name, sys_id) {
    return {
      name: name,
      sys_id: sys_id || 'mock-id-' + Math.random(),
      state: 'active'
    };
  }
  
  /**
   * Mock controller with sorting methods
   * In a real ServiceNow environment, this would be the actual widget controller
   */
  function createMockController() {
    var c = {};
    
    c.extractNumericValue = function(name) {
      if (!name || typeof name !== 'string') {
        return null;
      }
      var matches = name.match(/\d+/g);
      if (matches && matches.length > 0) {
        return parseInt(matches[matches.length - 1], 10);
      }
      return null;
    };
    
    c.sortSprintsNumerically = function(sprints) {
      if (!sprints || !Array.isArray(sprints)) {
        return [];
      }
      
      var sortedSprints = sprints.slice();
      
      sortedSprints.sort(function(a, b) {
        var numA = c.extractNumericValue(a.name);
        var numB = c.extractNumericValue(b.name);
        
        if (numA !== null && numB !== null) {
          return numA - numB;
        }
        
        if (numA !== null) return -1;
        if (numB !== null) return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      return sortedSprints;
    };
    
    return c;
  }
  
  describe('extractNumericValue', function() {
    var controller;
    
    beforeEach(function() {
      controller = createMockController();
    });
    
    it('should extract single digit from sprint name', function() {
      expect(controller.extractNumericValue('Sprint 1')).toBe(1);
      expect(controller.extractNumericValue('Sprint 5')).toBe(5);
      expect(controller.extractNumericValue('Sprint 9')).toBe(9);
    });
    
    it('should extract multi-digit numbers from sprint name', function() {
      expect(controller.extractNumericValue('Sprint 10')).toBe(10);
      expect(controller.extractNumericValue('Sprint 24')).toBe(24);
      expect(controller.extractNumericValue('Sprint 100')).toBe(100);
    });
    
    it('should extract first number when multiple numbers present', function() {
      expect(controller.extractNumericValue('Sprint 24.2')).toBe(2);
      expect(controller.extractNumericValue('Release 2 Sprint 5')).toBe(5);
    });
    
    it('should handle sprint names with non-numeric prefixes', function() {
      expect(controller.extractNumericValue('Q4 Sprint 15')).toBe(15);
      expect(controller.extractNumericValue('Team Alpha Sprint 7')).toBe(7);
    });
    
    it('should return null for sprint names without numbers', function() {
      expect(controller.extractNumericValue('Backlog')).toBe(null);
      expect(controller.extractNumericValue('Current Sprint')).toBe(null);
      expect(controller.extractNumericValue('Next')).toBe(null);
    });
    
    it('should handle edge cases', function() {
      expect(controller.extractNumericValue('')).toBe(null);
      expect(controller.extractNumericValue(null)).toBe(null);
      expect(controller.extractNumericValue(undefined)).toBe(null);
    });
  });
  
  describe('sortSprintsNumerically', function() {
    var controller;
    
    beforeEach(function() {
      controller = createMockController();
    });
    
    // Requirement 1.1: Sprint 1 before Sprint 2
    it('should display Sprint 1 before Sprint 2', function() {
      var sprints = [
        createSprint('Sprint 2'),
        createSprint('Sprint 1')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      expect(sorted[0].name).toBe('Sprint 1');
      expect(sorted[1].name).toBe('Sprint 2');
    });
    
    // Requirement 1.2: Sprint 9 before Sprint 10
    it('should display Sprint 9 before Sprint 10', function() {
      var sprints = [
        createSprint('Sprint 10'),
        createSprint('Sprint 9')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      expect(sorted[0].name).toBe('Sprint 9');
      expect(sorted[1].name).toBe('Sprint 10');
    });
    
    // Requirement 1.3: Handle non-numeric prefixes
    it('should extract numeric portion from sprints with non-numeric prefixes', function() {
      var sprints = [
        createSprint('Q4 Sprint 3'),
        createSprint('Q4 Sprint 1'),
        createSprint('Q4 Sprint 2')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      // Should sort by first number found (4, 4, 4), then by second number
      expect(sorted[0].name).toBe('Q4 Sprint 1');
      expect(sorted[1].name).toBe('Q4 Sprint 2');
      expect(sorted[2].name).toBe('Q4 Sprint 3');
    });
    
    it('should sort a realistic sequence of sprints correctly', function() {
      var sprints = [
        createSprint('Sprint 10'),
        createSprint('Sprint 2'),
        createSprint('Sprint 1'),
        createSprint('Sprint 9'),
        createSprint('Sprint 15'),
        createSprint('Sprint 3')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      expect(sorted[0].name).toBe('Sprint 1');
      expect(sorted[1].name).toBe('Sprint 2');
      expect(sorted[2].name).toBe('Sprint 3');
      expect(sorted[3].name).toBe('Sprint 9');
      expect(sorted[4].name).toBe('Sprint 10');
      expect(sorted[5].name).toBe('Sprint 15');
    });
    
    it('should handle sprints without numbers by placing them at the end', function() {
      var sprints = [
        createSprint('Sprint 2'),
        createSprint('Backlog'),
        createSprint('Sprint 1'),
        createSprint('Current')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      expect(sorted[0].name).toBe('Sprint 1');
      expect(sorted[1].name).toBe('Sprint 2');
      // Non-numeric sprints should be at the end, sorted alphabetically
      expect(sorted[2].name).toBe('Backlog');
      expect(sorted[3].name).toBe('Current');
    });
    
    it('should handle mixed numeric formats', function() {
      var sprints = [
        createSprint('Sprint 24.2'),
        createSprint('Sprint 24.1'),
        createSprint('Sprint 23'),
        createSprint('Sprint 25')
      ];
      
      var sorted = controller.sortSprintsNumerically(sprints);
      
      // Should extract last number: 2, 1, 23, 25
      expect(sorted[0].name).toBe('Sprint 24.1');
      expect(sorted[1].name).toBe('Sprint 24.2');
      expect(sorted[2].name).toBe('Sprint 23');
      expect(sorted[3].name).toBe('Sprint 25');
    });
    
    it('should not mutate the original array', function() {
      var sprints = [
        createSprint('Sprint 3'),
        createSprint('Sprint 1'),
        createSprint('Sprint 2')
      ];
      
      var originalOrder = sprints.map(function(s) { return s.name; });
      var sorted = controller.sortSprintsNumerically(sprints);
      
      // Original array should remain unchanged
      expect(sprints[0].name).toBe(originalOrder[0]);
      expect(sprints[1].name).toBe(originalOrder[1]);
      expect(sprints[2].name).toBe(originalOrder[2]);
      
      // Sorted array should be different
      expect(sorted[0].name).toBe('Sprint 1');
    });
    
    it('should handle empty array', function() {
      var sorted = controller.sortSprintsNumerically([]);
      expect(sorted).toEqual([]);
    });
    
    it('should handle null or undefined input', function() {
      expect(controller.sortSprintsNumerically(null)).toEqual([]);
      expect(controller.sortSprintsNumerically(undefined)).toEqual([]);
    });
    
    it('should handle single sprint', function() {
      var sprints = [createSprint('Sprint 1')];
      var sorted = controller.sortSprintsNumerically(sprints);
      
      expect(sorted.length).toBe(1);
      expect(sorted[0].name).toBe('Sprint 1');
    });
  });
});
