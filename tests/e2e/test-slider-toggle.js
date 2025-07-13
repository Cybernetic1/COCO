const puppeteer = require('puppeteer');

async function testSliderToggle() {
  console.log('🧪 Testing slider toggle functionality...');
  
  const browser = await puppeteer.launch({ headless: true });
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
    
    // Wait for the page to load
    console.log('Waiting for page elements...');
    await page.waitForSelector('#map-container', { timeout: 10000 });
    
    // Wait a bit more for JavaScript to initialize
    await page.waitForTimeout(2000);
    
    // Check if modules exist
    const modulesReady = await page.evaluate(() => {
      return typeof ProjectMapRenderer !== 'undefined' && 
             typeof ProjectMapDataManager !== 'undefined';
    });
    
    console.log(`Modules ready: ${modulesReady}`);
    
    // Wait for modules to initialize
    try {
      await page.waitForFunction(() => window.renderer && window.projectMapRoot, { timeout: 10000 });
    } catch (error) {
      console.log('Warning: modules may not be fully initialized, continuing anyway...');
    }
    
    // Check initial state - sliders should be visible
    console.log('✓ Page loaded, checking initial slider visibility...');
    
    const initialSliderVisible = await page.evaluate(() => {
      const sliderContainer = document.querySelector('.slider-container');
      return sliderContainer && !sliderContainer.closest('.sliders-hidden');
    });
    
    console.log(`Initial sliders visible: ${initialSliderVisible}`);
    
    // Check if percentage numbers are initially hidden
    const initialPercentageNumbersVisible = await page.evaluate(() => {
      const percentageNumbers = document.querySelectorAll('.percentage-number');
      return Array.from(percentageNumbers).some(num => 
        window.getComputedStyle(num).display !== 'none'
      );
    });
    
    console.log(`Initial percentage numbers visible: ${initialPercentageNumbersVisible}`);
    
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
      throw new Error('Show/hide % Sliders menu item not found');
    });
    
    // Wait a moment for the toggle to take effect
    await page.waitForTimeout(500);
    
    // Check if sliders are now hidden
    const slidersHiddenAfterToggle = await page.evaluate(() => {
      const mapContainer = document.getElementById('map-container');
      return mapContainer && mapContainer.classList.contains('sliders-hidden');
    });
    
    console.log(`Sliders hidden after toggle: ${slidersHiddenAfterToggle}`);
    
    // Check if percentage numbers are now visible
    const percentageNumbersVisibleAfterToggle = await page.evaluate(() => {
      const percentageNumbers = document.querySelectorAll('.percentage-number');
      return Array.from(percentageNumbers).some(num => 
        window.getComputedStyle(num).display !== 'none'
      );
    });
    
    console.log(`Percentage numbers visible after toggle: ${percentageNumbersVisibleAfterToggle}`);
    
    // Test toggling back
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
    
    await page.waitForTimeout(500);
    
    // Check if sliders are visible again
    const slidersVisibleAfterSecondToggle = await page.evaluate(() => {
      const mapContainer = document.getElementById('map-container');
      return !mapContainer.classList.contains('sliders-hidden');
    });
    
    console.log(`Sliders visible after second toggle: ${slidersVisibleAfterSecondToggle}`);
    
    // Validate results
    if (initialSliderVisible && 
        !initialPercentageNumbersVisible && 
        slidersHiddenAfterToggle && 
        percentageNumbersVisibleAfterToggle && 
        slidersVisibleAfterSecondToggle) {
      console.log('✅ All slider toggle tests passed!');
      return true;
    } else {
      console.log('❌ Some slider toggle tests failed');
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
testSliderToggle()
  .then(success => {
    if (success) {
      console.log('🎉 Slider toggle functionality test completed successfully');
      process.exit(0);
    } else {
      console.log('💥 Slider toggle functionality test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
