/**
 * E2E test for node authors display logic with inheritance indicators
 * Tests the displayAuthors() function behavior with different author configurations
 */

const puppeteer = require('puppeteer');

async function runNodeAuthorsDisplayTest() {
  console.log('=== Testing Node Authors Display Logic with Puppeteer ===');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to node page
    await page.goto('http://localhost:8383/node-page.html?id=1', { waitUntil: 'networkidle2' });
    
    // Wait for page to load
    await page.waitForSelector('#authors-list');
    
    // Test Case 1: Node has authors, ROOT has authors
    console.log('\n--- Test 1: Node has authors, ROOT has authors ---');
    const result1 = await page.evaluate(() => {
      // Access the currentAuthors directly in the closure scope
      currentAuthors = [{ name: 'Alice', email: 'alice@test.com' }];
      map = { authors: [{ name: 'Bob', email: 'bob@test.com' }] };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT)');
      const hasEmptyListMsg = authorsList.innerHTML.includes('[empty list]');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 1:', result1);
    console.log('✓ Should NOT show inheritance note:', !result1.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 1 author:', result1.authorCount === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should NOT show empty list:', !result1.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 2: Node empty, ROOT has authors
    console.log('\n--- Test 2: Node empty, ROOT has authors ---');
    const result2 = await page.evaluate(() => {
      currentAuthors = [];
      map = { authors: [{ name: 'Bob', email: 'bob@test.com' }] };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT)');
      const hasEmptyListMsg = authorsList.innerHTML.includes('[empty list]');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 2:', result2);
    console.log('✓ Should show inheritance note:', result2.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 1 author:', result2.authorCount === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should NOT show empty list:', !result2.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 3: Node empty, ROOT empty
    console.log('\n--- Test 3: Node empty, ROOT empty ---');
    const result3 = await page.evaluate(() => {
      currentAuthors = [];
      map = { authors: [] };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT');
      const hasEmptyListMsg = authorsList.innerHTML.includes('empty list');
      const hasCombinedMessage = authorsList.innerHTML.includes('(Default authors from ROOT - empty list)');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        hasCombinedMessage,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 3:', result3);
    console.log('✓ Should show inheritance note:', result3.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show empty list message:', result3.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show combined message:', result3.hasCombinedMessage ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 0 authors:', result3.authorCount === 0 ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 4: Node has authors, ROOT empty
    console.log('\n--- Test 4: Node has authors, ROOT empty ---');
    const result4 = await page.evaluate(() => {
      currentAuthors = [{ name: 'Alice', email: 'alice@test.com' }];
      map = { authors: [] };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT)');
      const hasEmptyListMsg = authorsList.innerHTML.includes('[empty list]');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 4:', result4);
    console.log('✓ Should NOT show inheritance note:', !result4.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 1 author:', result4.authorCount === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should NOT show empty list:', !result4.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 5: Node undefined, ROOT has authors
    console.log('\n--- Test 5: Node undefined, ROOT has authors ---');
    const result5 = await page.evaluate(() => {
      currentAuthors = undefined;
      map = { authors: [{ name: 'Charlie', email: 'charlie@test.com' }] };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT)');
      const hasEmptyListMsg = authorsList.innerHTML.includes('[empty list]');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 5:', result5);
    console.log('✓ Should show inheritance note:', result5.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 1 author:', result5.authorCount === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should NOT show empty list:', !result5.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    
    // Test Case 6: Multiple authors inheritance
    console.log('\n--- Test 6: Multiple authors inheritance ---');
    const result6 = await page.evaluate(() => {
      currentAuthors = [];
      map = { 
        authors: [
          { name: 'Dave', email: 'dave@test.com' },
          { name: 'Eve', email: 'eve@test.com' }
        ]
      };
      
      const authorsFromFunction = getNodeAuthors();
      displayAuthors();
      
      const authorsList = document.getElementById('authors-list');
      const hasInheritanceNote = authorsList.innerHTML.includes('(Default authors from ROOT)');
      const hasEmptyListMsg = authorsList.innerHTML.includes('[empty list]');
      const authorTags = authorsList.querySelectorAll('.author-tag');
      const authorCount = authorTags.length;
      
      return {
        hasInheritanceNote,
        hasEmptyListMsg,
        authorCount,
        html: authorsList.innerHTML,
        authorsFromFunction: authorsFromFunction
      };
    });
    
    console.log('Result 6:', result6);
    console.log('✓ Should show inheritance note:', result6.hasInheritanceNote ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should show 2 authors:', result6.authorCount === 2 ? '✅ PASS' : '❌ FAIL');
    console.log('✓ Should NOT show empty list:', !result6.hasEmptyListMsg ? '✅ PASS' : '❌ FAIL');
    
    // Calculate overall results
    const allTests = [result1, result2, result3, result4, result5, result6];
    const testResults = [
      // Test 1: Node has authors, ROOT has authors
      !result1.hasInheritanceNote && result1.authorCount === 1 && !result1.hasEmptyListMsg,
      // Test 2: Node empty, ROOT has authors
      result2.hasInheritanceNote && result2.authorCount === 1 && !result2.hasEmptyListMsg,
      // Test 3: Node empty, ROOT empty
      result3.hasInheritanceNote && result3.hasEmptyListMsg && result3.hasCombinedMessage && result3.authorCount === 0,
      // Test 4: Node has authors, ROOT empty
      !result4.hasInheritanceNote && result4.authorCount === 1 && !result4.hasEmptyListMsg,
      // Test 5: Node undefined, ROOT has authors
      result5.hasInheritanceNote && result5.authorCount === 1 && !result5.hasEmptyListMsg,
      // Test 6: Multiple authors inheritance
      result6.hasInheritanceNote && result6.authorCount === 2 && !result6.hasEmptyListMsg
    ];
    
    const passedTests = testResults.filter(result => result).length;
    const totalTests = testResults.length;
    
    console.log('\n=== SUMMARY ===');
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log('Key Requirements Verified:');
    console.log('1. "(Default authors from ROOT)" shows when node authors are empty');
    console.log('2. "empty list" combines with inheritance note when both node and ROOT are empty');
    console.log('3. Combined message saves space: "(Default authors from ROOT - empty list)"');
    console.log('4. No inheritance note when node has its own authors');
    console.log('5. Multiple inherited authors display correctly');
    
    if (passedTests === totalTests) {
      console.log('✅ ALL TESTS PASSED - Node authors display logic working correctly!');
      return true;
    } else {
      console.log('❌ SOME TESTS FAILED - Check the results above');
      return false;
    }
    
  } catch (error) {
    console.error('Error running test:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test if called directly
if (require.main === module) {
  runNodeAuthorsDisplayTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runNodeAuthorsDisplayTest };
