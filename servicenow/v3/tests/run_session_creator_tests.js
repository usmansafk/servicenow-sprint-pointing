/**
 * Simple test runner for Session Creator sprint sorting tests
 * This validates the logic outside of ServiceNow environment
 */

// Mock controller implementation
function createMockController() {
  var c = {};
  
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

function createSprint(name) {
  return { name: name, sys_id: 'mock-' + Math.random() };
}

// Run tests
console.log('Session Creator Sprint Sorting Tests');
console.log('=====================================\n');

var controller = createMockController();
var passed = 0;
var failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log('✓ ' + description);
    passed++;
  } catch (e) {
    console.log('✗ ' + description);
    console.log('  Error: ' + e.message);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || 'Expected ' + expected + ' but got ' + actual);
  }
}

// Test extractNumericValue
console.log('extractNumericValue tests:');
test('Extract single digit', function() {
  assertEqual(controller.extractNumericValue('Sprint 1'), 1);
  assertEqual(controller.extractNumericValue('Sprint 9'), 9);
});

test('Extract multi-digit', function() {
  assertEqual(controller.extractNumericValue('Sprint 10'), 10);
  assertEqual(controller.extractNumericValue('Sprint 24'), 24);
});

test('Handle no numbers', function() {
  assertEqual(controller.extractNumericValue('Backlog'), null);
  assertEqual(controller.extractNumericValue('Current Sprint'), null);
});

// Test sortSprintsNumerically
console.log('\nsortSprintsNumerically tests:');

test('Sprint 1 before Sprint 2 (Requirement 1.1)', function() {
  var sprints = [createSprint('Sprint 2'), createSprint('Sprint 1')];
  var sorted = controller.sortSprintsNumerically(sprints);
  assertEqual(sorted[0].name, 'Sprint 1');
  assertEqual(sorted[1].name, 'Sprint 2');
});

test('Sprint 9 before Sprint 10 (Requirement 1.2)', function() {
  var sprints = [createSprint('Sprint 10'), createSprint('Sprint 9')];
  var sorted = controller.sortSprintsNumerically(sprints);
  assertEqual(sorted[0].name, 'Sprint 9');
  assertEqual(sorted[1].name, 'Sprint 10');
});

test('Handle non-numeric prefixes (Requirement 1.3)', function() {
  var sprints = [
    createSprint('Q4 Sprint 3'),
    createSprint('Q4 Sprint 1'),
    createSprint('Q4 Sprint 2')
  ];
  var sorted = controller.sortSprintsNumerically(sprints);
  assertEqual(sorted[0].name, 'Q4 Sprint 1');
  assertEqual(sorted[1].name, 'Q4 Sprint 2');
  assertEqual(sorted[2].name, 'Q4 Sprint 3');
});

test('Sort realistic sequence', function() {
  var sprints = [
    createSprint('Sprint 10'),
    createSprint('Sprint 2'),
    createSprint('Sprint 1'),
    createSprint('Sprint 9'),
    createSprint('Sprint 15'),
    createSprint('Sprint 3')
  ];
  var sorted = controller.sortSprintsNumerically(sprints);
  assertEqual(sorted[0].name, 'Sprint 1');
  assertEqual(sorted[1].name, 'Sprint 2');
  assertEqual(sorted[2].name, 'Sprint 3');
  assertEqual(sorted[3].name, 'Sprint 9');
  assertEqual(sorted[4].name, 'Sprint 10');
  assertEqual(sorted[5].name, 'Sprint 15');
});

test('Handle sprints without numbers', function() {
  var sprints = [
    createSprint('Sprint 2'),
    createSprint('Backlog'),
    createSprint('Sprint 1'),
    createSprint('Current')
  ];
  var sorted = controller.sortSprintsNumerically(sprints);
  assertEqual(sorted[0].name, 'Sprint 1');
  assertEqual(sorted[1].name, 'Sprint 2');
  assertEqual(sorted[2].name, 'Backlog');
  assertEqual(sorted[3].name, 'Current');
});

test('Handle empty array', function() {
  var sorted = controller.sortSprintsNumerically([]);
  assertEqual(sorted.length, 0);
});

test('Handle null input', function() {
  var sorted = controller.sortSprintsNumerically(null);
  assertEqual(sorted.length, 0);
});

test('Do not mutate original array', function() {
  var sprints = [createSprint('Sprint 3'), createSprint('Sprint 1')];
  var originalFirst = sprints[0].name;
  controller.sortSprintsNumerically(sprints);
  assertEqual(sprints[0].name, originalFirst, 'Original array was mutated');
});

// Summary
console.log('\n=====================================');
console.log('Tests passed: ' + passed);
console.log('Tests failed: ' + failed);
console.log('Total: ' + (passed + failed));

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
