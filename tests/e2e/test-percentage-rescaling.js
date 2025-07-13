const puppeteer = require('puppeteer');

async function testPercentageRescaling() {
  console.log('🧪 Testing percentage rescaling functionality...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Mock dialogs to prevent hanging
  await page.evaluateOnNewDocument(() => {
    window.alert = (msg) => console.log('ALERT:', msg);
    window.prompt = (msg, defaultValue) => {
      console.log('PROMPT:', msg, 'Default:', defaultValue);
      // Simulate user entering 40% for the first node
      if (msg.includes('percentage')) {
        return '40';
      }
      return defaultValue || 'Test Response';
    };
    window.confirm = (msg) => {
      console.log('CONFIRM:', msg);
      return true;
    };
  });
  
  try {
    // Navigate to project map
    await page.goto('http://localhost:8383/project-map.html');
    
    // Wait for the page to load and initialize
    await page.waitForSelector('#map-container', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('✓ Page loaded, setting up test data...');
    
    // Set up test data with specific percentages
    await page.evaluate(() => {
      // Create test data with known percentages
      window.projectMapRoot = {
        id: 0,
        labelEN: 'Root Project',
        percentage: 100,
        children: [
          { id: 1, labelEN: 'Task A', percentage: 30, children: [] },
          { id: 2, labelEN: 'Task B', percentage: 50, children: [] },
          { id: 3, labelEN: 'Task C', percentage: 20, children: [] }
        ]
      };
      
      // Re-render with new data
      if (typeof renderCurrentMap === 'function') {
        renderCurrentMap();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Get initial percentages
    const initialPercentages = await page.evaluate(() => {
      const root = window.projectMapRoot;
      return root.children.map(child => ({
        id: child.id,
        labelEN: child.labelEN,
        percentage: child.percentage
      }));
    });
    
    console.log('Initial percentages:', initialPercentages);
    
    // Find and click on the first node to access percentage editing
    await page.evaluate(() => {
      // Find the first child node and click its menu button
      const nodeElements = document.querySelectorAll('.map-node');
      if (nodeElements.length > 1) { // Skip root node
        const firstChildNode = nodeElements[1]; // Second node should be first child
        
        // Find the menu button (☰) in this node
        const menuButton = firstChildNode.querySelector('button');
        if (menuButton) {
          console.log('Clicking menu button for node');
          menuButton.click();
        } else {
          console.log('Menu button not found');
        }
      } else {
        console.log('No child nodes found');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Click on "Edit Percentage" from the context menu
    await page.evaluate(() => {
      // Look for the Edit Percentage menu item
      const menuDivs = document.querySelectorAll('div');
      for (const div of menuDivs) {
        if (div.textContent === 'Edit Percentage' && div.style.cursor === 'pointer') {
          console.log('Found Edit Percentage menu item, clicking...');
          div.click();
          return;
        }
      }
      console.log('Edit Percentage menu item not found');
    });
    
    await page.waitForTimeout(1000);
    
    // Get final percentages after the change
    const finalPercentages = await page.evaluate(() => {
      const root = window.projectMapRoot;
      return root.children.map(child => ({
        id: child.id,
        labelEN: child.labelEN,
        percentage: child.percentage
      }));
    });
    
    console.log('Final percentages:', finalPercentages);
    
    // Verify the rescaling worked
    const total = finalPercentages.reduce((sum, child) => sum + child.percentage, 0);
    console.log('Total percentage:', total);
    
    // Check if Task A was changed to 40% and others were rescaled
    const taskA = finalPercentages.find(child => child.labelEN === 'Task A');
    const taskB = finalPercentages.find(child => child.labelEN === 'Task B');
    const taskC = finalPercentages.find(child => child.labelEN === 'Task C');
    
    console.log(`Task A: ${taskA?.percentage}% (expected: 40%)`);
    console.log(`Task B: ${taskB?.percentage}% (expected: rescaled)`);
    console.log(`Task C: ${taskC?.percentage}% (expected: rescaled)`);
    
    // Verify total is close to 100% (allowing for rounding)
    const isValidTotal = Math.abs(total - 100) < 0.1;
    const taskAChanged = taskA && Math.abs(taskA.percentage - 40) < 0.1;
    
    if (isValidTotal && taskAChanged) {
      console.log('✅ Percentage rescaling test passed!');
      console.log(`- Task A changed to ~40%: ${taskAChanged}`);
      console.log(`- Total remains ~100%: ${isValidTotal} (${total}%)`);
      return true;
    } else {
      console.log('❌ Percentage rescaling test failed');
      console.log(`- Task A changed to ~40%: ${taskAChanged}`);
      console.log(`- Total remains ~100%: ${isValidTotal} (${total}%)`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testPercentageRescaling()
  .then(success => {
    if (success) {
      console.log('🎉 Percentage rescaling functionality test completed successfully');
      process.exit(0);
    } else {
      console.log('💥 Percentage rescaling functionality test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
