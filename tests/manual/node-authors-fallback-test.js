// Test script to verify node authors fallback functionality
// Run this in the browser console on node-page.html

console.log('=== Node Authors Fallback Test ===');

// Test data setup
const testRootWithAuthors = {
  id: 0,
  labelEN: 'Test Project',
  authors: [
    { id: 'root1', name: 'Root Author 1', email: 'root1@test.com' },
    { id: 'root2', name: 'Root Author 2', email: 'root2@test.com' }
  ],
  children: [
    { id: 1, labelEN: 'Task with Authors', authors: [{ id: 'task1', name: 'Task Author', email: 'task@test.com' }] },
    { id: 2, labelEN: 'Task without Authors', authors: [] },
    { id: 3, labelEN: 'Task with no authors property' }
  ]
};

const testRootWithoutAuthors = {
  id: 0,
  labelEN: 'Project No Authors',
  children: [
    { id: 1, labelEN: 'Task without Authors', authors: [] }
  ]
};

// Backup original data
const originalMap = window.map;
const originalCurrentAuthors = window.currentAuthors;

console.log('\n--- Test 1: Node with authors should return its own authors ---');
window.map = testRootWithAuthors;
window.currentAuthors = [{ id: 'task1', name: 'Task Author', email: 'task@test.com' }];
const result1 = getNodeAuthors();
console.log('Result:', result1);
console.log('Expected: Task Author');
console.log('Passed:', result1.length === 1 && result1[0].name === 'Task Author');

console.log('\n--- Test 2: Node with empty authors should return ROOT authors ---');
window.map = testRootWithAuthors;
window.currentAuthors = [];
const result2 = getNodeAuthors();
console.log('Result:', result2);
console.log('Expected: Root Author 1, Root Author 2');
console.log('Passed:', result2.length === 2 && result2[0].name === 'Root Author 1' && result2[1].name === 'Root Author 2');

console.log('\n--- Test 3: Node with empty authors, ROOT also empty ---');
window.map = testRootWithoutAuthors;
window.currentAuthors = [];
const result3 = getNodeAuthors();
console.log('Result:', result3);
console.log('Expected: Empty array');
console.log('Passed:', Array.isArray(result3) && result3.length === 0);

console.log('\n--- Test 4: ROOT authors as strings should be converted ---');
window.map = {
  id: 0,
  labelEN: 'String Authors Root',
  authors: ['String Author 1', 'String Author 2']
};
window.currentAuthors = [];
const result4 = getNodeAuthors();
console.log('Result:', result4);
console.log('Expected: Converted to objects');
console.log('Passed:', result4.length === 2 && 
           typeof result4[0] === 'object' && 
           result4[0].name === 'String Author 1' &&
           result4[1].name === 'String Author 2');

console.log('\n--- Test 5: No ROOT authors property ---');
window.map = {
  id: 0,
  labelEN: 'No Authors Property'
};
window.currentAuthors = [];
const result5 = getNodeAuthors();
console.log('Result:', result5);
console.log('Expected: Empty array');
console.log('Passed:', Array.isArray(result5) && result5.length === 0);

// Restore original data
window.map = originalMap;
window.currentAuthors = originalCurrentAuthors;

console.log('\n✅ Test completed. Check the "Passed" results above.');
console.log('💡 To test in the UI:');
console.log('1. Open a node page with empty authors');
console.log('2. Check if ROOT node authors are displayed');
console.log('3. Try adding/removing authors and see the fallback behavior');
