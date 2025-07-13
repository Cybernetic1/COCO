const puppeteer = require('puppeteer');

async function quickAPITest() {
    console.log('🚀 Quick API Contract Test Starting...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Capture network requests instead of mocking
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('/saveJSON')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                });
                // Abort the request to prevent hanging
                request.abort();
            } else {
                request.continue();
            }
        });
        
        await page.setRequestInterception(true);
        
        console.log('📄 Loading project map page...');
        await page.goto('http://localhost:8383/project-map.html', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        // Wait for scripts to load
        await page.waitForSelector('#map-container', { timeout: 5000 });
        await page.waitForTimeout(1000);
        
        console.log('🔧 Setting up test data...');
        await page.evaluate(() => {
            // Set up minimal required data
            window.projectMapRoot = {
                nodes: [{ id: 'test', labelEN: 'Test Node', x: 0, y: 0 }],
                edges: []
            };
            window.projectName = 'Test Project';
            
            // Suppress ALL user interaction dialogs
            window.alert = () => {};
            window.confirm = () => true;
            window.prompt = (message, defaultValue) => defaultValue || 'test-project';
        });
        
        console.log('💾 Triggering save...');
        // Try to trigger the save and catch any errors
        const saveError = await page.evaluate(() => {
            try {
                if (typeof window.saveJSONMap === 'function') {
                    window.saveJSONMap('test.json');
                    return null;
                } else {
                    return 'saveJSONMap function not found';
                }
            } catch (e) {
                return e.message;
            }
        });
        
        if (saveError) {
            throw new Error('Save function error: ' + saveError);
        }
        
        // Wait briefly for the request to be captured
        await page.waitForTimeout(500);
        
        console.log('🔍 Checking captured requests...');
        if (requests.length === 0) {
            throw new Error('No /saveJSON request was captured');
        }
        
        const request = requests[0];
        console.log('📦 Request captured:', {
            url: request.url,
            method: request.method,
            contentType: request.headers['content-type'],
            bodyLength: request.postData ? request.postData.length : 0
        });
        
        // Verify API contract
        if (!request.url.endsWith('/saveJSON')) {
            throw new Error(`❌ Wrong URL: ${request.url}`);
        }
        
        if (request.method !== 'POST') {
            throw new Error(`❌ Wrong method: ${request.method}`);
        }
        
        if (request.headers['content-type'] !== 'application/json') {
            throw new Error(`❌ Wrong Content-Type: ${request.headers['content-type']}`);
        }
        
        if (!request.postData) {
            throw new Error('❌ No POST data');
        }
        
        // Parse request body
        let body;
        try {
            body = JSON.parse(request.postData);
        } catch (e) {
            throw new Error('❌ Invalid JSON in request body');
        }
        
        if (!body.filename) {
            throw new Error('❌ Missing filename in request');
        }
        
        if (!body.data) {
            throw new Error('❌ Missing data in request');
        }
        
        if (!body.data.nodes || !Array.isArray(body.data.nodes)) {
            throw new Error('❌ Missing or invalid nodes array');
        }
        
        // Check for the old 'label' vs 'labelEN' issue
        for (const node of body.data.nodes) {
            if (node.label !== undefined) {
                throw new Error(`❌ Node ${node.id} still uses deprecated 'label' property!`);
            }
            if (!node.labelEN) {
                throw new Error(`❌ Node ${node.id} missing 'labelEN' property!`);
            }
        }
        
        console.log('✅ URL: /saveJSON');
        console.log('✅ Method: POST');
        console.log('✅ Content-Type: application/json');
        console.log('✅ Body structure: {filename, data}');
        console.log('✅ Nodes use labelEN (not label)');
        console.log('🎉 API contract test PASSED!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

quickAPITest()
    .then(() => {
        console.log('🏆 Test completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error.message);
        process.exit(1);
    });
