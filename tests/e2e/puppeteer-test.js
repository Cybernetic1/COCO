const puppeteer = require('puppeteer');

async function testProjectMapSaveAPI() {
    console.log('Starting Puppeteer E2E test...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            protocolTimeout: 60000 // Increase timeout to 60 seconds
        });
        
        const page = await browser.newPage();
        
        // Set up console and error logging
        page.on('console', msg => {
            console.log('Browser console:', msg.type(), msg.text());
        });
        
        page.on('pageerror', error => {
            console.log('Browser error:', error.message);
        });
        
        // Mock the fetch function to intercept save requests AND suppress alerts
        let saveRequests = [];
        await page.evaluateOnNewDocument(() => {
            // Suppress all alerts to prevent hanging
            window.alert = function(message) {
                console.log('Alert suppressed:', message);
            };
            
            window.originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (url === '/saveJSON') {
                    // Store the request details for inspection
                    window.lastSaveRequest = { url, options: {...options} };
                    // Return a mock successful response
                    return Promise.resolve(new Response('{"success": true}', {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                return window.originalFetch(url, options);
            };
        });
        
        // Navigate to the project map page
        console.log('Navigating to project map page...');
        await page.goto('http://localhost:8383/project-map.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Wait for the page to be ready
        await page.waitForSelector('#map-container', { timeout: 10000 });
        console.log('Project map page loaded');
        
        // Wait a bit for scripts to initialize
        await page.waitForTimeout(2000);
        
        // Create a simple project map structure
        await page.evaluate(() => {
            // Set up the actual data structure that the save function expects
            window.projectMapRoot = {
                nodes: [
                    {
                        id: 'test-node-1',
                        labelEN: 'Test Node',
                        x: 100,
                        y: 100
                    }
                ],
                edges: []
            };
            
            // Also set the project name that's used in the title
            window.projectName = 'Test Project';
        });
        
        // Try to save the project map
        console.log('Attempting to save project map...');
        const saveResult = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                // Capture the original fetch to restore later
                const originalFetch = window.fetch;
                
                // Mock fetch to capture the request and resolve immediately
                window.fetch = function(url, options) {
                    if (url === '/saveJSON') {
                        // Store the request details
                        window.lastSaveRequest = { url, options: {...options} };
                        
                        // Restore original fetch
                        window.fetch = originalFetch;
                        
                        // Resolve the promise immediately with success
                        resolve({ success: true, request: window.lastSaveRequest });
                        
                        // Return a resolved promise to prevent the save function from hanging
                        return Promise.resolve(new Response('{"success": true}', {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    }
                    return originalFetch(url, options);
                };
                
                // Set timeout to avoid hanging
                setTimeout(() => {
                    reject(new Error('Save function timed out'));
                }, 5000);
                
                // Call the save function
                if (window.saveJSONMap) {
                    try {
                        window.saveJSONMap('test-project.json');
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('saveJSONMap function not found'));
                }
            });
        });
        
        console.log('Save operation completed');
        
        // Get the captured request
        const saveRequest = saveResult.request;
        
        if (!saveRequest) {
            throw new Error('No save request was made');
        }
        
        console.log('Save request captured:', {
            url: saveRequest.url,
            method: saveRequest.options.method,
            headers: saveRequest.options.headers,
            bodyPreview: saveRequest.options.body ? saveRequest.options.body.substring(0, 200) + '...' : null
        });
        
        // Verify the request format
        if (saveRequest.url !== '/saveJSON') {
            throw new Error(`Expected URL '/saveJSON', got '${saveRequest.url}'`);
        }
        
        if (saveRequest.options.method !== 'POST') {
            throw new Error(`Expected POST method, got '${saveRequest.options.method}'`);
        }
        
        if (!saveRequest.options.headers || saveRequest.options.headers['Content-Type'] !== 'application/json') {
            throw new Error('Expected Content-Type: application/json header');
        }
        
        // Parse and verify the request body
        let requestBody;
        try {
            requestBody = JSON.parse(saveRequest.options.body);
        } catch (e) {
            throw new Error('Request body is not valid JSON');
        }
        
        if (!requestBody.filename) {
            throw new Error('Request body missing "filename" field');
        }
        
        if (!requestBody.data) {
            throw new Error('Request body missing "data" field');
        }
        
        if (requestBody.filename !== 'test-project.json') {
            throw new Error(`Expected filename 'test-project.json', got '${requestBody.filename}'`);
        }
        
        // Verify the data structure
        const data = requestBody.data;
        if (!data.nodes || !Array.isArray(data.nodes)) {
            throw new Error('Data missing nodes array');
        }
        
        if (!data.edges || !Array.isArray(data.edges)) {
            throw new Error('Data missing edges array');
        }
        
        // Check that nodes don't have the old 'label' property
        for (const node of data.nodes) {
            if (node.label !== undefined) {
                throw new Error(`Node ${node.id} has deprecated 'label' property. Should use 'labelEN' only.`);
            }
            if (!node.labelEN) {
                throw new Error(`Node ${node.id} missing required 'labelEN' property`);
            }
        }
        
        console.log('✅ All API contract checks passed!');
        console.log('✅ Request uses correct URL: /saveJSON');
        console.log('✅ Request uses POST method');
        console.log('✅ Request has correct Content-Type header');
        console.log('✅ Request body has correct structure: {filename, data}');
        console.log('✅ Nodes use labelEN property instead of deprecated label');
        console.log('✅ E2E test completed successfully');
        
        return true;
        
    } catch (error) {
        console.error('❌ E2E test failed:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testProjectMapSaveAPI()
    .then(() => {
        console.log('Test passed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
    });
