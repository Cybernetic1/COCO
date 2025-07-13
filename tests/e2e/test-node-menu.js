const puppeteer = require('puppeteer');

async function testNodeMenuWithOpenPage() {
    console.log('🧪 Testing Node Menu - Open Node\'s Page option...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Suppress dialogs
        await page.evaluateOnNewDocument(() => {
            window.alert = () => {};
            window.confirm = () => true;
            window.prompt = (message, defaultValue) => defaultValue || 'test-project';
            
            // Track window.open calls
            window.openedUrls = [];
            window.open = function(url, target) {
                window.openedUrls.push({ url, target });
                console.log('window.open called with:', url, target);
                return { close: () => {} }; // Mock window object
            };
        });
        
        console.log('📄 Loading project map page...');
        await page.goto('http://localhost:8383/project-map.html', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        await page.waitForSelector('#map-container', { timeout: 5000 });
        await page.waitForTimeout(1000);
        
        console.log('🔍 Looking for node menu button...');
        
        // Find and click a node menu button
        const menuButtonClicked = await page.evaluate(() => {
            // Find the first node menu button (⋮)
            const menuButton = document.querySelector('.map-node button[title="Node options"]');
            if (menuButton) {
                menuButton.click();
                return true;
            }
            return false;
        });
        
        if (!menuButtonClicked) {
            throw new Error('Could not find node menu button');
        }
        
        console.log('📋 Checking if menu appeared...');
        
        // Wait for menu to appear and check options
        await page.waitForTimeout(200);
        
        const menuOptions = await page.evaluate(() => {
            const menu = document.querySelector('.node-context-menu');
            if (!menu) return null;
            
            const options = Array.from(menu.children).map(child => child.textContent);
            return options;
        });
        
        if (!menuOptions) {
            throw new Error('Node context menu did not appear');
        }
        
        console.log('📋 Menu options found:', menuOptions);
        
        // Check if "Open Node's Page" option exists
        if (!menuOptions.includes('Open Node\'s Page')) {
            throw new Error('Missing "Open Node\'s Page" option in menu');
        }
        
        console.log('🖱️ Clicking "Open Node\'s Page" option...');
        
        // Click the "Open Node's Page" option
        const openPageClicked = await page.evaluate(() => {
            const menu = document.querySelector('.node-context-menu');
            if (!menu) return false;
            
            const openPageOption = Array.from(menu.children).find(child => 
                child.textContent === 'Open Node\'s Page'
            );
            
            if (openPageOption) {
                openPageOption.click();
                return true;
            }
            return false;
        });
        
        if (!openPageClicked) {
            throw new Error('Could not click "Open Node\'s Page" option');
        }
        
        // Wait for window.open to be called
        await page.waitForTimeout(200);
        
        // Check if window.open was called with correct URL
        const openedUrls = await page.evaluate(() => window.openedUrls);
        
        console.log('🔗 Opened URLs:', openedUrls);
        
        if (openedUrls.length === 0) {
            throw new Error('window.open was not called');
        }
        
        const openedUrl = openedUrls[0];
        if (!openedUrl.url.includes('node-page.html?id=')) {
            throw new Error(`Expected URL to contain 'node-page.html?id=', got: ${openedUrl.url}`);
        }
        
        if (openedUrl.target !== '_blank') {
            throw new Error(`Expected target '_blank', got: ${openedUrl.target}`);
        }
        
        console.log('✅ Menu contains "Open Node\'s Page" option');
        console.log('✅ Clicking option calls window.open with correct URL');
        console.log('✅ Opens in new tab (_blank)');
        console.log('🎉 Test PASSED!');
        
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

testNodeMenuWithOpenPage()
    .then(() => {
        console.log('🏆 Node menu test completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error.message);
        process.exit(1);
    });
