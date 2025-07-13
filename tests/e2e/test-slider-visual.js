const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSliderToggleVisual() {
  console.log('🧪 Testing slider toggle visual changes...');
  
  const browser = await puppeteer.launch({ headless: false }); // Run visible to see the changes
  const page = await browser.newPage();
  
  // Mock alert, prompt, and confirm to prevent hanging
  await page.evaluateOnNewDocument(() => {
    window.alert = (msg) => console.log('ALERT:', msg);
    window.prompt = (msg, defaultValue) => {
      console.log('PROMPT:', msg);
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
    await page.waitForTimeout(2000);
    
    console.log('✓ Page loaded, taking initial screenshot...');
    
    // Take screenshot of initial state (sliders visible)
    await page.screenshot({ path: 'slider-state-initial.png', fullPage: true });
    console.log('📸 Initial state screenshot saved as slider-state-initial.png');
    
    // Click the menu button to open dropdown
    await page.click('#menuButton');
    await page.waitForSelector('#menuDropdown[style*="block"]', { timeout: 2000 });
    
    // Click the "Show/hide % Sliders" menu item
    await page.evaluate(() => {
      const menuItems = document.querySelectorAll('.menu-item');
      for (const item of menuItems) {
        if (item.textContent.includes('Show/hide % Sliders')) {
          item.click();
          return;
        }
      }
    });
    
    // Wait for the toggle to take effect
    await page.waitForTimeout(1000);
    
    console.log('✓ Toggled to numeric mode, taking screenshot...');
    
    // Take screenshot of toggled state (numeric percentages visible)
    await page.screenshot({ path: 'slider-state-numeric.png', fullPage: true });
    console.log('📸 Numeric state screenshot saved as slider-state-numeric.png');
    
    // Demonstrate the visual difference by keeping browser open for a moment
    console.log('🔍 Browser will stay open for 5 seconds to see the numeric display...');
    await page.waitForTimeout(5000);
    
    // Toggle back to show both states work
    await page.click('#menuButton');
    await page.waitForSelector('#menuDropdown[style*="block"]', { timeout: 2000 });
    
    await page.evaluate(() => {
      const menuItems = document.querySelectorAll('.menu-item');
      for (const item of menuItems) {
        if (item.textContent.includes('Show/hide % Sliders')) {
          item.click();
          return;
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take final screenshot (back to sliders)
    await page.screenshot({ path: 'slider-state-final.png', fullPage: true });
    console.log('📸 Final state screenshot saved as slider-state-final.png');
    
    console.log('✅ Visual test completed successfully!');
    console.log('📁 Check the generated PNG files to see the visual differences:');
    console.log('   - slider-state-initial.png (sliders visible)');
    console.log('   - slider-state-numeric.png (percentage numbers in separate rows)');
    console.log('   - slider-state-final.png (back to sliders)');
    
    return true;
    
  } catch (error) {
    console.error('❌ Visual test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testSliderToggleVisual()
  .then(success => {
    if (success) {
      console.log('🎉 Visual slider toggle test completed');
      process.exit(0);
    } else {
      console.log('💥 Visual slider toggle test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
