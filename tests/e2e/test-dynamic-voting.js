/**
 * E2E test for dynamic voting slider functionality
 * Tests that voting sliders work correctly when authors are added/removed dynamically
 */

const puppeteer = require('puppeteer');

async function runDynamicVotingTest() {
  console.log('=== Testing Dynamic Voting Sliders ===');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to node page
    await page.goto('http://localhost:8383/node-page.html?id=1', { waitUntil: 'networkidle2' });
    
    // Wait for page to load
    await page.waitForSelector('#voting-container');
    
    // Test Case 1: Empty authors list should show "No authors available"
    console.log('\n--- Test 1: Empty authors list ---');
    const result1 = await page.evaluate(() => {
      // Clear authors and create voting sliders
      currentAuthors = [];
      map = { authors: [] };
      createVotingSliders();
      
      const votingContainer = document.getElementById('voting-container');
      const hasNoAuthorsMessage = votingContainer.innerHTML.includes('No authors available for voting');
      const sliders = votingContainer.querySelectorAll('.slider');
      
      return {
        hasNoAuthorsMessage,
        sliderCount: sliders.length,
        votesArray: window.votes
      };
    });
    
    console.log('✓ Should show no authors message:', result1.hasNoAuthorsMessage ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should have 0 sliders:', result1.sliderCount === 0 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Votes array should be empty:', Array.isArray(result1.votesArray) && result1.votesArray.length === 0 ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 2: Add one author
    console.log('\n--- Test 2: Add one author ---');
    const result2 = await page.evaluate(() => {
      // Add one author
      currentAuthors = [{ name: 'Alice', email: 'alice@test.com', id: 'alice' }];
      createVotingSliders();
      
      // Wait a bit for initialization
      return new Promise(resolve => {
        setTimeout(() => {
          const sliders = document.querySelectorAll('.slider');
          const scores = document.querySelectorAll('.score');
          const total = document.getElementById('total');
          
          // Check for NaN values
          let hasNaN = false;
          scores.forEach(score => {
            if (score.textContent.includes('NaN')) {
              hasNaN = true;
            }
          });
          
          resolve({
            sliderCount: sliders.length,
            scoreCount: scores.length - 1, // -1 for total
            totalText: total ? total.textContent : 'missing',
            hasNaN,
            votesArray: window.votes,
            firstScoreText: scores[0] ? scores[0].textContent : 'missing'
          });
        }, 50);
      });
    });
    
    console.log('✓ Should have 1 slider:', result2.sliderCount === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should have no NaN values:', !result2.hasNaN ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Total should be 0.00:', result2.totalText === '0.00' ? '✅ PASS' : '❌ FAIL');
    console.log('✓ First score should be 0.00:', result2.firstScoreText === '0.00' ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Votes array should have 1 element:', result2.votesArray && result2.votesArray.length === 1 ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 3: Add second author dynamically
    console.log('\n--- Test 3: Add second author dynamically ---');
    const result3 = await page.evaluate(() => {
      // Add second author
      currentAuthors.push({ name: 'Bob', email: 'bob@test.com', id: 'bob' });
      createVotingSliders();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const sliders = document.querySelectorAll('.slider');
          const scores = document.querySelectorAll('.score');
          const total = document.getElementById('total');
          
          // Check for NaN values
          let hasNaN = false;
          scores.forEach(score => {
            if (score.textContent.includes('NaN')) {
              hasNaN = true;
            }
          });
          
          resolve({
            sliderCount: sliders.length,
            scoreCount: scores.length - 1, // -1 for total
            totalText: total ? total.textContent : 'missing',
            hasNaN,
            votesArray: window.votes,
            allScoreTexts: Array.from(scores).map(s => s.textContent)
          });
        }, 50);
      });
    });
    
    console.log('✓ Should have 2 sliders:', result3.sliderCount === 2 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should have no NaN values:', !result3.hasNaN ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Total should be 0.00:', result3.totalText === '0.00' ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Votes array should have 2 elements:', result3.votesArray && result3.votesArray.length === 2 ? '✅ PASS' : '❌ FAIL');
    console.log('All score texts:', result3.allScoreTexts);
    
    // Test Case 4: Move slider and check redistribution
    console.log('\n--- Test 4: Move slider and check redistribution ---');
    const result4 = await page.evaluate(() => {
      return new Promise(resolve => {
        // Wait for sliders to be ready
        setTimeout(() => {
          const sliders = document.querySelectorAll('.slider');
          if (sliders.length > 0) {
            // Simulate moving first slider to 500
            const firstSlider = sliders[0];
            firstSlider.value = 500;
            firstSlider.dispatchEvent(new Event('input'));
            
            // Wait for redistribution
            setTimeout(() => {
              const scores = document.querySelectorAll('.score');
              const total = document.getElementById('total');
              
              // Check for NaN values
              let hasNaN = false;
              scores.forEach(score => {
                if (score.textContent.includes('NaN')) {
                  hasNaN = true;
                }
              });
              
              resolve({
                hasNaN,
                totalText: total ? total.textContent : 'missing',
                allScoreTexts: Array.from(scores).map(s => s.textContent),
                votesArray: window.votes
              });
            }, 100);
          } else {
            resolve({ error: 'No sliders found' });
          }
        }, 100);
      });
    });
    
    console.log('✓ Should have no NaN after slider move:', !result4.hasNaN ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Total should be 100.00:', result4.totalText === '100.00' ? '✅ PASS' : '❌ FAIL');
    console.log('Score texts after redistribution:', result4.allScoreTexts);
    
    console.log('\n=== Dynamic Voting Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Export for use in test runner
module.exports = { runDynamicVotingTest };

// Run if called directly
if (require.main === module) {
  runDynamicVotingTest();
}
