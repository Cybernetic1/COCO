// Manual test to demonstrate percentage rescaling functionality
// Run this in the browser console on project-map.html

console.log('=== Percentage Rescaling Demo ===');

// Set up test data
window.projectMapRoot = {
  id: 0,
  labelEN: 'Test Project',
  percentage: 100,
  children: [
    { id: 1, labelEN: 'Design', percentage: 25, children: [] },
    { id: 2, labelEN: 'Development', percentage: 50, children: [] },
    { id: 3, labelEN: 'Testing', percentage: 15, children: [] },
    { id: 4, labelEN: 'Documentation', percentage: 10, children: [] }
  ]
};

console.log('Initial state:');
window.projectMapRoot.children.forEach(child => {
  console.log(`${child.labelEN}: ${child.percentage}%`);
});

console.log('\nTotal:', window.projectMapRoot.children.reduce((sum, child) => sum + child.percentage, 0), '%');

// Re-render the map
if (typeof renderCurrentMap === 'function') {
  renderCurrentMap();
}

console.log('\n✨ Test the rescaling:');
console.log('1. Click the menu button (☰) on any node');
console.log('2. Select "Edit Percentage"');
console.log('3. Enter a new percentage (try 60%)');
console.log('4. Watch other nodes automatically rescale to maintain 100% total');

// Function to manually test rescaling
window.testRescaling = function(nodeId, newPercentage) {
  const node = window.projectMapRoot.children.find(child => child.id === nodeId);
  if (!node) {
    console.log('Node not found');
    return;
  }
  
  console.log(`\n--- Testing: Change ${node.labelEN} from ${node.percentage}% to ${newPercentage}% ---`);
  
  const oldPercentage = node.percentage;
  
  // Simulate the rescaling that happens in showPercentageModal
  if (window.modalManager) {
    window.modalManager.rescaleSiblingPercentages(node, oldPercentage, newPercentage);
    node.percentage = newPercentage;
  }
  
  console.log('After rescaling:');
  window.projectMapRoot.children.forEach(child => {
    console.log(`${child.labelEN}: ${child.percentage}%`);
  });
  
  const total = window.projectMapRoot.children.reduce((sum, child) => sum + child.percentage, 0);
  console.log('Total:', total, '%');
  
  if (typeof renderCurrentMap === 'function') {
    renderCurrentMap();
  }
};

console.log('\n🧪 Try manual tests:');
console.log('testRescaling(1, 60) // Change Design to 60%');
console.log('testRescaling(2, 80) // Change Development to 80%');
console.log('testRescaling(3, 5)  // Change Testing to 5%');
