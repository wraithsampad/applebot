const puppeteer = require('puppeteer');

// Helper function to simulate human-like typing
async function humanType(element, text, minDelay = 50, maxDelay = 200) {
    for (let char of text) {
        await element.type(char);
        // Random delay between keystrokes to simulate human typing
        await new Promise(resolve => setTimeout(resolve, Math.random() * (maxDelay - minDelay) + minDelay));
    }
}

async function fillAppleIdFormDirect(page) {
    console.log('Navigating directly to Apple ID creation widget...');
    
    // Navigate directly to the Apple ID creation page
    await page.goto('https://account.apple.com/account', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    console.log('Waiting for form elements to load...');
    
    try {
        // Wait for the page to load
        await page.waitForSelector('input[name*="firstName"], input[placeholder*="First"], #firstName', { timeout: 30000 });
        
        console.log('Form elements detected, attempting to fill them...');
        
        // Fill first name with human-like typing
        const firstNameInput = await page.$('input[name*="firstName"], input[placeholder*="First"], #firstName');
        if (firstNameInput) {
            await firstNameInput.click();
            await firstNameInput.focus();
            await humanType(firstNameInput, 'John');
        }
        
        // Fill last name with human-like typing
        const lastNameInput = await page.$('input[name*="lastName"], input[placeholder*="Last"], #lastName');
        if (lastNameInput) {
            await lastNameInput.click();
            await lastNameInput.focus();
            await humanType(lastNameInput, 'Doe');
        }
        
        // Fill email with human-like typing
        const emailInput = await page.$('input[name*="appleId"], input[placeholder*="name@example.com"], #form-textbox-1775134436451-0');
        if (emailInput) {
            await emailInput.click();
            await emailInput.focus();
            await humanType(emailInput, 'john.doe.test@example.com');
        }
        
        // Wait for and fill password fields with human-like typing
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        const passwordInput = await page.$('input[name="password"]');
        if (passwordInput) {
            await passwordInput.click();
            await passwordInput.focus();
            await humanType(passwordInput, 'SecurePassword123!');
        }
        
        // Fill confirm password field with human-like typing
        const confirmPasswordInput = await page.$('input[name="confirmPassword"]');
        if (confirmPasswordInput) {
            await confirmPasswordInput.click();
            await confirmPasswordInput.focus();
            await humanType(confirmPasswordInput, 'SecurePassword123!');
        }
        
        // Fill birth date - month
        const monthSelect = await page.$('#form-dropdown-1775134436448-2');
        if (monthSelect) {
            await monthSelect.select('06'); // June
        }
        
        // Fill birth date - day
        const daySelect = await page.$('#form-dropdown-1775134436449-0');
        if (daySelect) {
            await daySelect.select('15'); // 15th
        }
        
        // Fill birth date - year
        const yearSelect = await page.$('#form-dropdown-1775134436449-1');
        if (yearSelect) {
            await yearSelect.select('1990'); // 1990
        }
        
        // Select country
        const countrySelect = await page.$('select[name="countrySelect"]');
        if (countrySelect) {
            await countrySelect.select('USA'); // USA
        }
        
        console.log('Form filled successfully with human-like typing. Waiting for user instruction before clicking continue.');
        
    } catch (error) {
        console.log(`Error filling form: ${error.message}`);
        
        // If the direct approach didn't work, try with the main appleid.apple.com page
        await fillAppleIdForm(page);
    }
}

async function fillAppleIdForm(page) {
    console.log('Navigating to Apple ID main page...');
    
    // Navigate to the Apple ID creation page
    await page.goto('https://appleid.apple.com/account', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    console.log('Waiting for iframe to load...');
    try {
        // Wait for the iframe to be present
        await page.waitForSelector('#aid-create-widget-iFrame', { timeout: 30000 });
        
        console.log('Found the iframe, waiting for it to load content...');
        
        // Wait for iframe to finish loading
        await page.waitForFunction(() => {
            const iframe = document.querySelector('#aid-create-widget-iFrame');
            return iframe && iframe.offsetWidth > 0 && iframe.offsetHeight > 0;
        }, { timeout: 30000 });
        
        console.log('Iframe loaded and is visible.');
        
        // Scroll to the iframe to ensure it's visible
        await page.evaluate(() => {
            document.querySelector('#aid-create-widget-iFrame').scrollIntoView();
        });
        
        // Take a screenshot to see what's visible
        await page.screenshot({ path: 'before-interaction.png', fullPage: true });
        
        console.log('The Apple ID creation form should now be visible in the browser.');
        console.log('The script will wait. You can manually fill the form or let it wait.');
        
    } catch (error) {
        console.log(`Error interacting with iframe: ${error.message}`);
    }
}

async function createAppleBot(options = {}) {
    const browser = await puppeteer.launch({
        headless: options.headless !== undefined ? options.headless : false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            // Adding user agent to avoid detection
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ 
        width: options.width || 1366, 
        height: options.height || 768,
        deviceScaleFactor: options.deviceScaleFactor || 1,
    });

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Handle any dialogs that might appear
    page.on('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.dismiss(); // Dismiss any dialogs that appear
    });

    try {
        // Try the direct approach first
        await fillAppleIdFormDirect(page);
        
        // Wait indefinitely until user stops the script
        console.log('Form is filled and visible. Script is waiting. Stop the script when you want to proceed.');
        await new Promise(() => {}); // Keep the script running indefinitely
    } catch (error) {
        console.error(`Error during automation: ${error.message}`);
    }

    // Close the browser when done (this won't be reached until the promise resolves)
    await browser.close();
}

module.exports = { createAppleBot, fillAppleIdForm, fillAppleIdFormDirect };