const puppeteer = require('puppeteer');

async function testPercentageRescalingEdgeCases() {
  console.log('🧪 Testing percentage rescaling edge cases...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Mock prompt to return specific values for each test
  let promptCallCount = 0;
  const testValues = ['100', '0', '25']; // Test values for edge cases
  
  await page.evaluateOnNewDocument(() => {
    window.alert = (msg) => console.log('ALERT:', msg);
    window.promptCallCount = 0;
    window.testValues = ['100', '0', '25'];
    window.prompt = (msg, defaultValue) => {
      console.log('PROMPT:', msg, 'Default:', defaultValue);
      if (msg.includes('percentage')) {
        const value = window.testValues[window.promptCallCount] || '50';
        window.promptCallCount++;
        console.log('Returning value:', value);
        return value;
      }
      return defaultValue || 'Test Response';
    };
    window.confirm = (msg) => {
      console.log('CONFIRM:', msg);
      return true;
    };
  });
  
  try {
    await page.goto('http://localhost:8383/project-map.html');
    await page.waitForSelector('#map-container', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('✓ Page loaded, testing edge cases...');
    
    // Test Case 1: Setting one node to 100% (others should become 0%)
    await page.evaluate(() => {
      window.projectMapRoot = {
        id: 0,
        labelEN: 'Root',
        percentage: 100,
        children: [
          { id: 1, labelEN: 'A', percentage: 33.3, children: [] },
          { id: 2, labelEN: 'B', percentage: 33.3, children: [] },
          { id: 3, labelEN: 'C', percentage: 33.4, children: [] }
        ]
      };
      renderCurrentMap();
    });
    
    await page.waitForTimeout(500);
    
    // Click menu and edit percentage for first node to 100%
    await page.evaluate(() => {
      const nodeElements = document.querySelectorAll('.map-node');
      const firstChildNode = nodeElements[1];
      const menuButton = firstChildNode.querySelector('button');
      menuButton.click();
    });
    
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      const menuDivs = document.querySelectorAll('div');
      for (const div of menuDivs) {
        if (div.textContent === 'Edit Percentage') {
          div.click();
          break;
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    const testCase1Results = await page.evaluate(() => {
      return window.projectMapRoot.children.map(child => ({
        labelEN: child.labelEN,
        percentage: child.percentage
      }));
    });
    
    console.log('Test Case 1 - Set A to 100%:', testCase1Results);
    
    // Test Case 2: Setting one node to 0% (others should be redistributed)
    await page.evaluate(() => {
      window.projectMapRoot.children = [
        { id: 1, labelEN: 'A', percentage: 40, children: [] },
        { id: 2, labelEN: 'B', percentage: 30, children: [] },
        { id: 3, labelEN: 'C', percentage: 30, children: [] }
      ];
      renderCurrentMap();
    });
    
    await page.waitForTimeout(500);
    
    // Edit second node to 0%
    await page.evaluate(() => {
      const nodeElements = document.querySelectorAll('.map-node');
      const secondChildNode = nodeElements[2];
      const menuButton = secondChildNode.querySelector('button');
      menuButton.click();
    });
    
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      const menuDivs = document.querySelectorAll('div');
      for (const div of menuDivs) {
        if (div.textContent === 'Edit Percentage') {
          div.click();
          break;
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    const testCase2Results = await page.evaluate(() => {
      return window.projectMapRoot.children.map(child => ({
        labelEN: child.labelEN,
        percentage: child.percentage
      }));
    });
    
    console.log('Test Case 2 - Set B to 0%:', testCase2Results);
    
    // Test Case 3: Normal proportional rescaling
    await page.evaluate(() => {
      window.projectMapRoot.children = [
        { id: 1, labelEN: 'A', percentage: 20, children: [] },
        { id: 2, labelEN: 'B', percentage: 30, children: [] },
        { id: 3, labelEN: 'C', percentage: 50, children: [] }
      ];
      renderCurrentMap();
    });
    
    await page.waitForTimeout(500);
    
    // Edit third node to 25%
    await page.evaluate(() => {
      const nodeElements = document.querySelectorAll('.map-node');
      const thirdChildNode = nodeElements[3];
      const menuButton = thirdChildNode.querySelector('button');
      menuButton.click();
    });
    
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      const menuDivs = document.querySelectorAll('div');
      for (const div of menuDivs) {
        if (div.textContent === 'Edit Percentage') {
          div.click();
          break;
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    const testCase3Results = await page.evaluate(() => {
      return window.projectMapRoot.children.map(child => ({
        labelEN: child.labelEN,
        percentage: child.percentage
      }));
    });
    
    console.log('Test Case 3 - Set C to 25%:', testCase3Results);
    
    // Verify all totals are 100%
    const total1 = testCase1Results.reduce((sum, child) => sum + child.percentage, 0);
    const total2 = testCase2Results.reduce((sum, child) => sum + child.percentage, 0);
    const total3 = testCase3Results.reduce((sum, child) => sum + child.percentage, 0);
    
    console.log(`\nTotals: Case1=${total1}%, Case2=${total2}%, Case3=${total3}%`);
    
    const allTotalsValid = Math.abs(total1 - 100) < 0.1 && 
                          Math.abs(total2 - 100) < 0.1 && 
                          Math.abs(total3 - 100) < 0.1;
    
    if (allTotalsValid) {
      console.log('✅ All edge case tests passed!');
      return true;
    } else {
      console.log('❌ Some edge case tests failed');
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
testPercentageRescalingEdgeCases()
  .then(success => {
    if (success) {
      console.log('🎉 All percentage rescaling edge case tests completed successfully');
      process.exit(0);
    } else {
      console.log('💥 Some percentage rescaling edge case tests failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
