const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Read password from text/password.text
function getPassword() {
    const filePath = path.join(__dirname, '..', 'text', 'password.text');
    return fs.readFileSync(filePath, 'utf8').trim();
}

// Read phone numbers from text/number.text
function getPhoneNumbers() {
    const filePath = path.join(__dirname, '..', 'text', 'number.text');
    const content = fs.readFileSync(filePath, 'utf8');
    return content
        .replace(/[{}]/g, '')
        .split(',')
        .map(e => e.trim().replace(/^["']|["']$/g, ''))
        .filter(e => e.length > 0);
}

// Remove a phone number from text/number.text
function removePhoneNumber(phoneNumber) {
    const filePath = path.join(__dirname, '..', 'text', 'number.text');
    const content = fs.readFileSync(filePath, 'utf8');
    const numbers = content
        .replace(/[{}]/g, '')
        .split(',')
        .map(e => e.trim().replace(/^["']|["']$/g, ''))
        .filter(e => e.length > 0 && e !== phoneNumber);
    fs.writeFileSync(filePath, '{\n' + numbers.map(n => `"${n}"`).join(',\n') + '\n}', 'utf8');
    console.log(`Removed phone number ${phoneNumber} from number.text. ${numbers.length} remaining.`);
}

// Country calling code to ISO code mapping for phone dropdown
const phoneCodeMap = {
    '+93': 'AF', '+358': 'AX', '+355': 'AL', '+213': 'DZ', '+1': 'US',
    '+376': 'AD', '+244': 'AO', '+672': 'AQ', '+54': 'AR', '+374': 'AM',
    '+297': 'AW', '+61': 'AU', '+43': 'AT', '+994': 'AZ', '+973': 'BH',
    '+880': 'BD', '+1-246': 'BB', '+375': 'BY', '+32': 'BE', '+501': 'BZ',
    '+229': 'BJ', '+975': 'BT', '+591': 'BO', '+387': 'BA', '+267': 'BW',
    '+55': 'BR', '+673': 'BN', '+359': 'BG', '+226': 'BF', '+257': 'BI',
    '+855': 'KH', '+237': 'CM', '+238': 'CV', '+236': 'CF', '+235': 'TD',
    '+56': 'CL', '+86': 'CN', '+57': 'CO', '+269': 'KM', '+682': 'CK',
    '+506': 'CR', '+225': 'CI', '+385': 'HR', '+53': 'CU', '+357': 'CY',
    '+420': 'CZ', '+243': 'CD', '+45': 'DK', '+253': 'DJ', '+1-767': 'DM',
    '+1-809': 'DO', '+593': 'EC', '+20': 'EG', '+503': 'SV', '+240': 'GQ',
    '+291': 'ER', '+372': 'EE', '+268': 'SZ', '+251': 'ET', '+500': 'FK',
    '+298': 'FO', '+679': 'FJ', '+33': 'FR', '+594': 'GF', '+689': 'PF',
    '+241': 'GA', '+220': 'GM', '+995': 'GE', '+49': 'DE', '+233': 'GH',
    '+350': 'GI', '+30': 'GR', '+299': 'GL', '+1-473': 'GD', '+590': 'GP',
    '+502': 'GT', '+224': 'GN', '+245': 'GW', '+592': 'GY', '+509': 'HT',
    '+504': 'HN', '+852': 'HK', '+36': 'HU', '+354': 'IS', '+91': 'IN',
    '+62': 'ID', '+964': 'IQ', '+353': 'IE', '+972': 'IL', '+39': 'IT',
    '+1-876': 'JM', '+81': 'JP', '+962': 'JO', '+7': 'RU', '+254': 'KE',
    '+686': 'KI', '+383': 'XK', '+965': 'KW', '+996': 'KG', '+856': 'LA',
    '+371': 'LV', '+961': 'LB', '+266': 'LS', '+231': 'LR', '+218': 'LY',
    '+423': 'LI', '+370': 'LT', '+352': 'LU', '+853': 'MO', '+261': 'MG',
    '+265': 'MW', '+60': 'MY', '+960': 'MV', '+223': 'ML', '+356': 'MT',
    '+692': 'MH', '+596': 'MQ', '+222': 'MR', '+230': 'MU', '+52': 'MX',
    '+691': 'FM', '+373': 'MD', '+377': 'MC', '+976': 'MN', '+382': 'ME',
    '+212': 'MA', '+258': 'MZ', '+95': 'MM', '+264': 'NA', '+674': 'NR',
    '+977': 'NP', '+31': 'NL', '+687': 'NC', '+64': 'NZ', '+505': 'NI',
    '+227': 'NE', '+234': 'NG', '+683': 'NU', '+389': 'MK', '+47': 'NO',
    '+968': 'OM', '+92': 'PK', '+680': 'PW', '+970': 'PS', '+507': 'PA',
    '+675': 'PG', '+595': 'PY', '+51': 'PE', '+63': 'PH', '+48': 'PL',
    '+351': 'PT', '+974': 'QA', '+242': 'CG', '+40': 'RO', '+250': 'RW',
    '+290': 'SH', '+1-869': 'KN', '+1-758': 'LC', '+1-784': 'VC', '+685': 'WS',
    '+378': 'SM', '+239': 'ST', '+966': 'SA', '+221': 'SN', '+381': 'RS',
    '+248': 'SC', '+232': 'SL', '+65': 'SG', '+421': 'SK', '+386': 'SI',
    '+677': 'SB', '+252': 'SO', '+27': 'ZA', '+82': 'KR', '+211': 'SS',
    '+34': 'ES', '+94': 'LK', '+249': 'SD', '+597': 'SR', '+46': 'SE',
    '+41': 'CH', '+886': 'TW', '+992': 'TJ', '+255': 'TZ', '+66': 'TH',
    '+670': 'TL', '+228': 'TG', '+690': 'TK', '+676': 'TO', '+1-868': 'TT',
    '+216': 'TN', '+90': 'TR', '+993': 'TM', '+688': 'TV', '+256': 'UG',
    '+380': 'UA', '+971': 'AE', '+44': 'GB', '+598': 'UY', '+998': 'UZ',
    '+678': 'VU', '+39-06': 'VA', '+58': 'VE', '+84': 'VN', '+681': 'WF',
    '+212-5288': 'EH', '+967': 'YE', '+260': 'ZM', '+263': 'ZW'
};

// Country ISO code to countrySelect dropdown value mapping
const countrySelectMap = {
    'AF': 'AFG', 'AX': 'ALA', 'AL': 'ALB', 'DZ': 'DZA', 'AS': 'ASM',
    'AD': 'AND', 'AO': 'AGO', 'AI': 'AIA', 'AQ': 'ATA', 'AG': 'ATG',
    'AR': 'ARG', 'AM': 'ARM', 'AW': 'ABW', 'AU': 'AUS', 'AT': 'AUT',
    'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD', 'BB': 'BRB',
    'BY': 'BLR', 'BE': 'BEL', 'BZ': 'BLZ', 'BJ': 'BEN', 'BM': 'BMU',
    'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA', 'BV': 'BVT',
    'BR': 'BRA', 'VG': 'VGB', 'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA',
    'BI': 'BDI', 'KH': 'KHM', 'CM': 'CMR', 'CA': 'CAN', 'CV': 'CPV',
    'BQ': 'BES', 'KY': 'CYM', 'CF': 'CAF', 'TD': 'TCD', 'IO': 'IOT',
    'CL': 'CHL', 'CN': 'CHN', 'CX': 'CXR', 'CC': 'CCK', 'CO': 'COL',
    'KM': 'COM', 'CK': 'COK', 'CR': 'CRI', 'CI': 'CIV', 'HR': 'HRV',
    'CW': 'CUW', 'CY': 'CYP', 'CZ': 'CZE', 'CD': 'COD', 'DK': 'DNK',
    'DJ': 'DJI', 'DM': 'DMA', 'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY',
    'SV': 'SLV', 'GQ': 'GNQ', 'ER': 'ERI', 'EE': 'EST', 'SZ': 'SWZ',
    'ET': 'ETH', 'FK': 'FLK', 'FO': 'FRO', 'FJ': 'FJI', 'FI': 'FIN',
    'FR': 'FRA', 'GF': 'GUF', 'PF': 'PYF', 'TF': 'ATF', 'GA': 'GAB',
    'GM': 'GMB', 'GE': 'GEO', 'DE': 'DEU', 'GH': 'GHA', 'GI': 'GIB',
    'GR': 'GRC', 'GL': 'GRL', 'GD': 'GRD', 'GP': 'GLP', 'GU': 'GUM',
    'GT': 'GTM', 'GG': 'GGY', 'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY',
    'HT': 'HTI', 'HM': 'HMD', 'HN': 'HND', 'HK': 'HKG', 'HU': 'HUN',
    'IS': 'ISL', 'IN': 'IND', 'ID': 'IDN', 'IQ': 'IRQ', 'IE': 'IRL',
    'IM': 'IMN', 'IL': 'ISR', 'IT': 'ITA', 'JM': 'JAM', 'JP': 'JPN',
    'JE': 'JEY', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN', 'KI': 'KIR',
    'XK': 'XKS', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO', 'LV': 'LVA',
    'LB': 'LBN', 'LS': 'LSO', 'LR': 'LBR', 'LY': 'LBY', 'LI': 'LIE',
    'LT': 'LTU', 'LU': 'LUX', 'MO': 'MAC', 'MG': 'MDG', 'MW': 'MWI',
    'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL',
    'MQ': 'MTQ', 'MR': 'MRT', 'MU': 'MUS', 'YT': 'MYT', 'MX': 'MEX',
    'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'MN': 'MNG', 'ME': 'MNE',
    'MS': 'MSR', 'MA': 'MAR', 'MZ': 'MOZ', 'MM': 'MMR', 'NA': 'NAM',
    'NR': 'NRU', 'NP': 'NPL', 'NL': 'NLD', 'NC': 'NCL', 'NZ': 'NZL',
    'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA', 'NU': 'NIU', 'NF': 'NFK',
    'MP': 'MNP', 'MK': 'MKD', 'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK',
    'PW': 'PLW', 'PS': 'PSE', 'PA': 'PAN', 'PG': 'PNG', 'PY': 'PRY',
    'PE': 'PER', 'PH': 'PHL', 'PN': 'PCN', 'PL': 'POL', 'PT': 'PRT',
    'PR': 'PRI', 'QA': 'QAT', 'CG': 'COG', 'RE': 'REU', 'RO': 'ROU',
    'RU': 'RUS', 'RW': 'RWA', 'BL': 'BLM', 'SH': 'SHN', 'KN': 'KNA',
    'LC': 'LCA', 'MF': 'MAF', 'VC': 'VCT', 'WS': 'WSM', 'SM': 'SMR',
    'ST': 'STP', 'SA': 'SAU', 'SN': 'SEN', 'RS': 'SRB', 'SC': 'SYC',
    'SL': 'SLE', 'SG': 'SGP', 'SX': 'SXM', 'SK': 'SVK', 'SI': 'SVN',
    'SB': 'SLB', 'SO': 'SOM', 'ZA': 'ZAF', 'GS': 'SGS', 'KR': 'KOR',
    'SS': 'SSD', 'ES': 'ESP', 'LK': 'LKA', 'PM': 'SPM', 'SD': 'SDN',
    'SR': 'SUR', 'SJ': 'SJM', 'SE': 'SWE', 'CH': 'CHE', 'TW': 'TWN',
    'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA', 'TL': 'TLS', 'TG': 'TGO',
    'TK': 'TKL', 'TO': 'TON', 'TT': 'TTO', 'TN': 'TUN', 'TR': 'TUR',
    'TM': 'TKM', 'TC': 'TCA', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR',
    'AE': 'ARE', 'GB': 'GBR', 'US': 'USA', 'UM': 'UMI', 'UY': 'URY',
    'UZ': 'UZB', 'VU': 'VUT', 'VA': 'VAT', 'VE': 'VEN', 'VN': 'VNM',
    'VI': 'VIR', 'WF': 'WLF', 'EH': 'ESH', 'YE': 'YEM', 'ZM': 'ZMB',
    'ZW': 'ZWE'
};

// Extract country code from phone number and return matching dropdown values
function getCountryFromPhone(phoneNumber) {
    // Try longest match first (e.g. +1-868 before +1)
    const sortedCodes = Object.keys(phoneCodeMap).sort((a, b) => b.length - a.length);
    for (const code of sortedCodes) {
        if (phoneNumber.startsWith(code)) {
            const iso = phoneCodeMap[code];
            const countryValue = countrySelectMap[iso];
            return { phoneCode: iso, countryValue };
        }
    }
    return null;
}

// Generate a random unique first name
function getRandomFirstName() {
    const names = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Raymond','Gregory','Frank','Alexander','Patrick','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Adam','Nathan','Henry','Douglas','Peter','Zachary','Kyle','Noah','Ethan','Jeremy','Walter','Christian','Keith','Roger','Terry','Austin','Sean','Gerald','Carl','Harold','Dylan','Arthur','Lawrence','Jordan','Jesse','Bryan','Billy','Bruce','Gabriel','Joe','Logan','Albert','Willie','Alan','Juan','Elijah','Randy','Wayne','Vincent','Russell','Philip','Louis','Bobby','Johnny','Bradley'];
    return names[Math.floor(Math.random() * names.length)];
}

// Generate a random unique last name
function getRandomLastName() {
    const names = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez'];
    return names[Math.floor(Math.random() * names.length)];
}

// Helper function to simulate human-like typing
async function humanType(element, text, minDelay = 5, maxDelay = 30) {
    for (let char of text) {
        await element.type(char);
        await new Promise(resolve => setTimeout(resolve, Math.random() * (maxDelay - minDelay) + minDelay));
    }
}

// Helper to wait and get element with retries
async function waitForElement(page, selector, timeout = 15000) {
    try {
        await page.waitForSelector(selector, { timeout, visible: true });
        return await page.$(selector);
    } catch (e) {
        console.log(`Could not find element: ${selector}`);
        return null;
    }
}

// Fill a text input by name attribute
async function fillInput(page, name, value) {
    const selector = `input[name="${name}"]`;
    const el = await waitForElement(page, selector);
    if (!el) return false;

    await el.click({ clickCount: 3 });
    await el.focus();
    await humanType(el, value);

    await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    }, selector);

    return true;
}

// Set a native <select> element's value
async function setSelectValue(page, selector, value) {
    const el = await waitForElement(page, selector);
    if (!el) return false;

    await page.evaluate((sel, val) => {
        const select = document.querySelector(sel);
        if (select) {
            select.value = val;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, selector, value);

    return true;
}

async function fillAppleIdForm(page) {
    console.log('Navigating to Apple account creation page...');

    await page.goto('https://appleid.apple.com/account', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });

    console.log('Waiting for form to load...');

    await page.waitForSelector('#aid-create-widget-iFrame', { timeout: 30000 });
    console.log('Iframe detected. Switching context...');

    const frame = await page.$('#aid-create-widget-iFrame');
    const contentFrame = await frame.contentFrame();
    await fillFormFields(contentFrame, page);
}

async function fillFormFields(pageOrFrame, browserPage) {
    const p = pageOrFrame;
    const mainPage = browserPage || pageOrFrame;

    async function safeFill(name, value, label) {
        try {
            const success = await fillInput(p, name, value);
            if (success) {
                console.log(`Filled ${label}: ${value}`);
            }
            await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
        } catch (e) {
            console.log(`Failed to fill ${label}: ${e.message}`);
        }
    }

    // Fill First Name
    const firstName = getRandomFirstName();
    await safeFill('firstName', firstName, 'First Name');

    // Fill Last Name
    const lastName = getRandomLastName();
    await safeFill('lastName', lastName, 'Last Name');

    // Generate random birthday (age between 20-65)
    const currentYear = new Date().getFullYear();
    const age = Math.floor(Math.random() * 46) + 20; // 20 to 65
    const birthYear = currentYear - age;
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const maxDay = new Date(birthYear, parseInt(birthMonth), 0).getDate();
    const birthDay = String(Math.floor(Math.random() * maxDay) + 1).padStart(2, '0');

    // Fill Birthday - Month
    try {
        await setSelectValue(p, '[data-testid="select-month"]', birthMonth);
        console.log(`Selected birthday month: ${birthMonth}`);
    } catch (e) {
        console.log('Failed to select month:', e.message);
    }

    // Fill Birthday - Day
    try {
        await setSelectValue(p, '[data-testid="select-day"]', birthDay);
        console.log(`Selected birthday day: ${birthDay}`);
    } catch (e) {
        console.log('Failed to select day:', e.message);
    }

    // Fill Birthday - Year
    try {
        await setSelectValue(p, '[data-testid="select-year"]', String(birthYear));
        console.log(`Selected birthday year: ${birthYear}`);
    } catch (e) {
        console.log('Failed to select year:', e.message);
    }

    // Email - user enters manually

    // Fill Password
    const password = getPassword();
    await safeFill('password', password, 'Password');

    // Fill Confirm Password
    await safeFill('confirmPassword', password, 'Confirm Password');

    // Read phone numbers and select country based on phone number
    const phoneNumbers = getPhoneNumbers();
    const phoneNumber = phoneNumbers[0];
    console.log(`Using phone number: ${phoneNumber}`);
    if (phoneNumber) {
        removePhoneNumber(phoneNumber);
        const countryInfo = getCountryFromPhone(phoneNumber);
        console.log(`Country info: ${JSON.stringify(countryInfo)}`);
        if (countryInfo) {
            // Select Country/Region dropdown - use native select method
            try {
                const countrySelected = await p.evaluate((val) => {
                    const select = document.querySelector('select[name="countrySelect"]');
                    if (select) {
                        select.value = val;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        select.dispatchEvent(new Event('input', { bubbles: true }));
                        // Also trigger React's synthetic event
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
                        nativeInputValueSetter.call(select, val);
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        return true;
                    }
                    return false;
                }, countryInfo.countryValue);
                
                if (countrySelected) {
                    console.log(`Selected country/region: ${countryInfo.countryValue}`);
                } else {
                    console.log('Country select element not found');
                }
            } catch (e) {
                console.log('Failed to select country/region:', e.message);
            }

            // Select Phone Code dropdown
            try {
                await setSelectValue(p, 'select[name="phoneCode"]', countryInfo.phoneCode);
                console.log(`Selected phone code: ${countryInfo.phoneCode}`);
            } catch (e) {
                console.log('Failed to select phone code:', e.message);
            }

            // Fill Phone Number (strip the country code prefix)
            let phoneDigits = phoneNumber;
            const sortedCodes = Object.keys(phoneCodeMap).sort((a, b) => b.length - a.length);
            for (const code of sortedCodes) {
                if (phoneNumber.startsWith(code)) {
                    phoneDigits = phoneNumber.substring(code.length);
                    break;
                }
            }
            await safeFill('phoneNumber', phoneDigits, 'Phone Number');
            console.log(`Filled phone: ${phoneNumber} (digits: ${phoneDigits})`);
        } else {
            console.log(`Could not determine country for phone: ${phoneNumber}`);
        }
    } else {
        console.log('No phone numbers found in text/number.text');
    }

    // Dismiss any "is-error" classes that might block submission
    try {
        await p.evaluate(() => {
            document.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
            document.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
        });
        console.log('Cleared validation error states');
    } catch (e) {
        console.log('Could not clear error states:', e.message);
    }

    // Take screenshot to verify
    try {
        if (p.screenshot) {
            await p.screenshot({ path: 'form-filled.png', fullPage: true });
            console.log('Screenshot saved as form-filled.png');
        }
    } catch (e) {
        // Frame might not have screenshot
    }

    console.log('Form filling complete.');

    // Wait for user input to continue
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise((resolve, reject) => {
        rl.question('Press Enter to continue to next page...', async () => {
            rl.close();

            // Click the continue/submit button
            try {
                const continueButton = await p.$('button[type="submit"], button[data-testid="continue-button"], button.continue-btn, button.submit-btn');
                if (continueButton) {
                    await continueButton.click();
                    console.log('Clicked continue button');
                } else {
                    const buttons = await p.$$('button');
                    for (const button of buttons) {
                        const text = await p.evaluate(el => el.textContent, button);
                        if (text && (text.toLowerCase().includes('continue') || text.toLowerCase().includes('next'))) {
                            await button.click();
                            console.log('Clicked continue button');
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log('Could not click continue button:', e.message);
            }

            // Wait for iframe to navigate to verification page, then re-get iframe content
            try {
                console.log('Waiting for verification code page inside iframe...');
                
                // Wait longer for page to load
                await new Promise(r => setTimeout(r, 8000));

                // Re-get the iframe reference since it navigated
                const iframeEl = await mainPage.$('#aid-create-widget-iFrame');
                if (!iframeEl) {
                    console.log('Iframe element not found after navigation');
                } else {
                    const newFrame = await iframeEl.contentFrame();
                    if (!newFrame) {
                        console.log('Could not get iframe content frame');
                    } else {
                        // Debug: Log the page content to see what we're working with
                        try {
                            const pageContent = await newFrame.evaluate(() => document.body.innerHTML);
                            console.log('Page content length:', pageContent.length);
                            
                            // Check if we're on the verify phone page
                            const isVerifyPage = pageContent.includes('Verify Phone Number');
                            console.log('Is verification page:', isVerifyPage);
                            
                            if (isVerifyPage) {
                                console.log('On verification page, looking for "Didn\'t get a code?" button...');
                            }
                        } catch (e) {
                            console.log('Could not get page content:', e.message);
                        }

                        // Loop through phone numbers
                        const allPhoneNumbers = getPhoneNumbers();
                        console.log(`Found ${allPhoneNumbers.length} phone numbers to try`);

                        for (let phoneIndex = 0; phoneIndex < allPhoneNumbers.length; phoneIndex++) {
                            console.log(`\n--- Phone number cycle ${phoneIndex + 1}/${allPhoneNumbers.length} ---`);

                            // Re-get iframe reference each cycle (page may have navigated)
                            const iframeEl2 = await mainPage.$('#aid-create-widget-iFrame');
                            if (!iframeEl2) {
                                console.log('Iframe element not found');
                                break;
                            }
                            const cycleFrame = await iframeEl2.contentFrame();
                            if (!cycleFrame) {
                                console.log('Could not get iframe content frame');
                                break;
                            }

                            // Step 1: Click "Didn't get a code?"
                            let clicked = false;
                            for (let attempt = 0; attempt < 30 && !clicked; attempt++) {
                                try {
                                    clicked = await cycleFrame.evaluate(() => {
                                        const buttons = document.querySelectorAll('button');
                                        for (const btn of buttons) {
                                            const text = btn.textContent || '';
                                            if (text.includes("Didn") && text.includes("get a code")) {
                                                btn.click();
                                                return true;
                                            }
                                        }
                                        return false;
                                    });
                                    if (clicked) console.log('Clicked "Didn\'t get a code?" button');
                                } catch (frameErr) { }
                                if (!clicked) await new Promise(r => setTimeout(r, 1000));
                            }
                            if (!clicked) {
                                console.log('Could not find "Didn\'t get a code?" button');
                                break;
                            }

                            // Step 2: Click "Use a Different Number"
                            await new Promise(r => setTimeout(r, 2000));
                            let clickedDifferent = false;
                            for (let attempt = 0; attempt < 30 && !clickedDifferent; attempt++) {
                                try {
                                    clickedDifferent = await cycleFrame.evaluate(() => {
                                        const buttons = document.querySelectorAll('button');
                                        for (const btn of buttons) {
                                            const text = btn.textContent || '';
                                            if (text.includes("Use a Different Number")) {
                                                btn.click();
                                                return true;
                                            }
                                        }
                                        return false;
                                    });
                                    if (clickedDifferent) console.log('Clicked "Use a Different Number" button');
                                } catch (frameErr) { }
                                if (!clickedDifferent) await new Promise(r => setTimeout(r, 1000));
                            }
                            if (!clickedDifferent) {
                                console.log('Could not find "Use a Different Number" button');
                                break;
                            }

                            // Step 3: Fill phone number
                            await new Promise(r => setTimeout(r, 3000));
                            const newPhoneNumber = allPhoneNumbers[phoneIndex];
                            console.log(`Using phone number: ${newPhoneNumber}`);
                            removePhoneNumber(newPhoneNumber);

                            let newPhoneDigits = newPhoneNumber;
                            const sortedCodesNew = Object.keys(phoneCodeMap).sort((a, b) => b.length - a.length);
                            for (const code of sortedCodesNew) {
                                if (newPhoneNumber.startsWith(code)) {
                                    newPhoneDigits = newPhoneNumber.substring(code.length);
                                    break;
                                }
                            }

                            // Re-get iframe again after page change
                            const iframeEl3 = await mainPage.$('#aid-create-widget-iFrame');
                            const fillFrame = await iframeEl3.contentFrame();

                            let phoneFilled = false;
                            for (let attempt = 0; attempt < 15 && !phoneFilled; attempt++) {
                                try {
                                    phoneFilled = await fillInput(fillFrame, 'phoneNumber', newPhoneDigits);
                                    if (phoneFilled) console.log(`Filled phone number: ${newPhoneDigits}`);
                                } catch (e) {
                                    console.log(`Attempt ${attempt + 1}: waiting for phone input...`);
                                }
                                if (!phoneFilled) await new Promise(r => setTimeout(r, 1000));
                            }

                            // Step 4: Click Continue
                            if (phoneFilled) {
                                await new Promise(r => setTimeout(r, 1000));
                                let continueClicked = false;
                                for (let attempt = 0; attempt < 15 && !continueClicked; attempt++) {
                                    try {
                                        continueClicked = await fillFrame.evaluate(() => {
                                            const btn = document.querySelector('button[type="submit"][form="updatePhone"]');
                                            if (btn) {
                                                btn.click();
                                                return true;
                                            }
                                            const buttons = document.querySelectorAll('button[type="submit"]');
                                            for (const b of buttons) {
                                                if (b.textContent.trim() === 'Continue') {
                                                    b.click();
                                                    return true;
                                                }
                                            }
                                            return false;
                                        });
                                        if (continueClicked) console.log('Clicked Continue button');
                                    } catch (e) { }
                                    if (!continueClicked) await new Promise(r => setTimeout(r, 1000));
                                }
                                if (!continueClicked) {
                                    console.log('Could not find Continue button');
                                    break;
                                }

                                // Wait and check for error message
                                await new Promise(r => setTimeout(r, 5000));
                                const iframeEl4 = await mainPage.$('#aid-create-widget-iFrame');
                                const checkFrame = await iframeEl4.contentFrame();
                                
                                const hasError = await checkFrame.evaluate(() => {
                                    const allText = document.body.innerText || '';
                                    if (allText.includes("Verification codes can") && allText.includes("sent to this phone number")) {
                                        return true;
                                    }
                                    const redTexts = document.querySelectorAll('.text-color-glyph-red');
                                    for (const el of redTexts) {
                                        if (el.textContent.includes("Verification codes can")) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });

                                if (hasError) {
                                    console.log('Error: Verification codes cannot be sent to this phone number. Restarting entire process...');
                                    throw new Error('RESTART_REQUIRED');
                                }
                            } else {
                                console.log('Could not fill phone number');
                                break;
                            }

                            // Wait before next cycle
                            await new Promise(r => setTimeout(r, 3000));
                        }
                        console.log('\nAll phone numbers processed.');
                    }
                }
            } catch (e) {
                if (e.message === 'RESTART_REQUIRED') {
                    reject(e);
                    return;
                }
                console.log('Error:', e.message);
            }

            console.log('Done. Press Ctrl+C to stop.');
            resolve();
        });
    });
}

async function createAppleBot(options = {}) {
    const maxRestarts = 10;
    let restartCount = 0;

    while (restartCount < maxRestarts) {
        let browser = null;
        try {
            console.log(`\n=== Starting attempt ${restartCount + 1}/${maxRestarts} ===\n`);

            browser = await puppeteer.launch({
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
                    '--disable-blink-features=AutomationControlled'
                ],
                defaultViewport: {
                    width: options.width || 1366,
                    height: options.height || 768,
                    deviceScaleFactor: 1,
                }
            });

            const page = await browser.newPage();

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                delete navigator.__proto__.webdriver;

                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) =>
                    parameters.name === 'notifications'
                        ? Promise.resolve({ state: Notification.permission })
                        : originalQuery(parameters);

                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });

                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
            });

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            page.on('dialog', async (dialog) => {
                console.log(`Dialog: ${dialog.message()}`);
                await dialog.dismiss();
            });

            await fillAppleIdForm(page);

            console.log('Bot is running. Press Ctrl+C to stop.');
            await new Promise(() => {});
        } catch (error) {
            if (error.message === 'RESTART_REQUIRED') {
                restartCount++;
                console.log(`\n=== Restarting process (attempt ${restartCount}/${maxRestarts}) ===\n`);
                if (browser) {
                    await browser.close();
                    console.log('Browser closed. Waiting 5 seconds before restart...');
                    await new Promise(r => setTimeout(r, 5000));
                }
                continue;
            }
            console.error(`Error: ${error.message}`);
        }

        if (browser) {
            await browser.close();
        }
        break;
    }

    if (restartCount >= maxRestarts) {
        console.log('Max restarts reached. Stopping.');
    }
}

module.exports = { createAppleBot, fillAppleIdForm };
