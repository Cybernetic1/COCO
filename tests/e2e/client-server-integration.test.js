const puppeteer = require('puppeteer');
const path = require('path');

describe('Client-Server API Integration', () => {
  let browser, page;
  const baseUrl = 'http://localhost:3000';
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: true,  // Run without opening browser window
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // For CI environments
    });
    page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('project-map save should use correct API format', async () => {
    // Intercept network requests to validate the actual client API calls
    const apiRequests = [];
    
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/saveJSON')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postData()
        });
        
        // Mock successful response to avoid actual file creation during test
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, filename: 'test.json' })
        });
      } else {
        request.continue();
      }
    });

    // Load the actual project-map.html page
    await page.goto(`${baseUrl}/project-map.html`);
    
    // Wait for page to fully load
    await page.waitForSelector('#map-container', { timeout: 10000 });
    
    // Set up test data in the browser context
    await page.evaluate(() => {
      // Create test project data
      window.projectMapRoot = {
        id: 0,
        "project-name": "test-project",
        labelEN: "Test Project",
        percentage: 0,
        children: [
          {
            id: 1,
            labelEN: "Test Child",
            percentage: 50.5,
            children: []
          }
        ]
      };
      window.projectName = "test-project";
    });
    
    // Mock the prompt dialog to automatically provide filename
    await page.evaluateOnNewDocument(() => {
      window.prompt = (message, defaultValue) => {
        console.log('Prompt intercepted:', message, 'default:', defaultValue);
        return 'test-e2e-project';
      };
    });
    
    // Trigger the save function by clicking the save menu item
    await page.click('#menuButton'); // Open menu
    await page.waitForSelector('#menuDropdown', { visible: true });
    await page.click('[onclick*="saveJSONMap"]'); // Click save option
    
    // Wait for the API request to be made
    await page.waitForTimeout(2000);
    
    // Validate that the API request was made with correct format
    expect(apiRequests).toHaveLength(1);
    
    const request = apiRequests[0];
    
    // Check URL format
    expect(request.url).toBe(`${baseUrl}/saveJSON`);
    expect(request.method).toBe('POST');
    
    // Check headers
    expect(request.headers['content-type']).toBe('application/json');
    
    // Check request body format
    expect(request.body).toBeTruthy();
    const body = JSON.parse(request.body);
    
    // Validate the expected API contract
    expect(body).toHaveProperty('filename');
    expect(body).toHaveProperty('data');
    expect(body.filename).toBe('test-e2e-project.json');
    expect(body.data).toMatchObject({
      id: 0,
      "project-name": "test-e2e-project",
      labelEN: "Test Project",
      children: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          labelEN: "Test Child",
          percentage: 50.5
        })
      ])
    });
    
    console.log('✅ API request format validation passed');
    console.log('Request URL:', request.url);
    console.log('Request body keys:', Object.keys(body));
  }, 15000); // Increase timeout for this test

  test('project-map should handle server errors gracefully', async () => {
    const apiRequests = [];
    
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/saveJSON')) {
        apiRequests.push(request);
        
        // Mock server error response
        request.respond({
          status: 500,
          contentType: 'text/html',
          body: '<!DOCTYPE html><html><body><pre>Internal Server Error</pre></body></html>'
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${baseUrl}/project-map.html`);
    await page.waitForSelector('#map-container');
    
    // Set up test data
    await page.evaluate(() => {
      window.projectMapRoot = { id: 0, labelEN: "Test", children: [] };
      window.prompt = () => 'error-test';
    });
    
    // Listen for alert dialogs
    const dialogPromises = [];
    page.on('dialog', async dialog => {
      dialogPromises.push(dialog.message());
      await dialog.accept();
    });
    
    // Trigger save
    await page.click('#menuButton');
    await page.click('[onclick*="saveJSONMap"]');
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Verify error was handled
    expect(apiRequests).toHaveLength(1);
    expect(dialogPromises.length).toBeGreaterThan(0);
    expect(dialogPromises[0]).toContain('Server Error');
  }, 15000);
});
