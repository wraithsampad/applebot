const puppeteer = require('puppeteer');
const { getRandomFingerprint } = require('./fingerprint');

class ChromeManager {
  constructor(options = {}) {
    this.options = options;
    this.browser = null;
    this.page = null;
  }

  // Clear all browser data including cache, history, cookies, etc.
  async clearBrowserData(page) {
    console.log("Clearing all browser data...");
    
    // Access the CDP session to clear browser data
    const client = await page.target().createCDPSession();
    
    // Clear browser cookies
    await client.send('Network.clearBrowserCookies');
    
    // Clear browser cache
    await client.send('Network.clearBrowserCache');
    
    // Clear storage data
    await client.send('Storage.clearDataForOrigin', {
      origin: '*',
      storageTypes: 'all'
    });
    
    // Clear local storage with error handling
    try {
      await page.evaluate(() => {
        if (window.localStorage) {
          localStorage.clear();
        }
      });
    } catch (error) {
      console.log("Could not clear localStorage (this is expected on some sites):", error.message);
    }
    
    // Clear session storage with error handling
    try {
      await page.evaluate(() => {
        if (window.sessionStorage) {
          sessionStorage.clear();
        }
      });
    } catch (error) {
      console.log("Could not clear sessionStorage (this is expected on some sites):", error.message);
    }
    
    console.log("Browser data cleared successfully");
  }

  // Apply fingerprint properties to the page with consistency
  async applyFingerprint(page, fingerprint) {
    console.log("Applying fingerprint to browser...");
    
    // Set user agent
    await page.setUserAgent(fingerprint.userAgent);
    
    // Execute scripts to spoof navigator properties with consistency
    await page.evaluateOnNewDocument((fingerprint) => {
      // Override navigator properties ensuring consistency
      Object.defineProperty(navigator, 'userAgent', {
        get: () => fingerprint.userAgent
      });
      
      Object.defineProperty(navigator, 'platform', {
        get: () => fingerprint.platform
      });
      
      Object.defineProperty(navigator, 'language', {
        get: () => fingerprint.languages[0]
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => fingerprint.languages
      });
      
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => fingerprint.hardwareConcurrency
      });
      
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => fingerprint.deviceMemory
      });
      
      // Override screen properties
      Object.defineProperty(screen, 'width', {
        get: () => fingerprint.screenResolution.width
      });
      
      Object.defineProperty(screen, 'height', {
        get: () => fingerprint.screenResolution.height
      });
      
      Object.defineProperty(screen, 'availWidth', {
        get: () => fingerprint.viewportSize.width
      });
      
      Object.defineProperty(screen, 'availHeight', {
        get: () => fingerprint.viewportSize.height
      });
      
      Object.defineProperty(screen, 'colorDepth', {
        get: () => fingerprint.colorDepth
      });
      
      Object.defineProperty(screen, 'pixelDepth', {
        get: () => fingerprint.colorDepth
      });
      
      // Override device pixel ratio
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => fingerprint.devicePixelRatio
      });
      
      // Override timezone with consistent locale settings
      const timezoneOverride = {
        timeZone: fingerprint.timeZone
      };
      
      // Override connection properties (if available) consistently with device specs
      if (navigator.connection) {
        Object.defineProperty(navigator.connection, 'downlink', {
          get: () => {
            // Downlink based on hardware concurrency and device memory
            if (fingerprint.hardwareConcurrency >= 8 && fingerprint.deviceMemory >= 8) {
              return 10; // High performance device
            } else if (fingerprint.hardwareConcurrency >= 4 && fingerprint.deviceMemory >= 4) {
              return 6; // Medium performance device
            } else {
              return 2; // Lower performance device
            }
          }
        });
        
        Object.defineProperty(navigator.connection, 'effectiveType', {
          get: () => {
            if (fingerprint.hardwareConcurrency >= 8 && fingerprint.deviceMemory >= 8) {
              return '4g';
            } else if (fingerprint.hardwareConcurrency >= 4 && fingerprint.deviceMemory >= 4) {
              return '4g';
            } else {
              return '3g';
            }
          }
        });
        
        Object.defineProperty(navigator.connection, 'rtt', {
          get: () => {
            if (fingerprint.hardwareConcurrency >= 8 && fingerprint.deviceMemory >= 8) {
              return 50; // Fast connection
            } else if (fingerprint.hardwareConcurrency >= 4 && fingerprint.deviceMemory >= 4) {
              return 100; // Medium connection
            } else {
              return 200; // Slower connection
            }
          }
        });
      }
      
      // Override Intl API to ensure timezone and locale consistency
      const originalIntlDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = function(...args) {
        if (args.length === 0) {
          args[0] = fingerprint.locale;
        } else if (typeof args[0] !== 'string') {
          args[0] = [fingerprint.locale, ...args[0]];
        }
        return new originalIntlDateTimeFormat(...args);
      };
      
      // Override Date methods to return correct timezone
      const dateNow = Date.now;
      Date.now = function() {
        return dateNow.call(this);
      };
      
      // Override performance properties to be consistent with hardware
      if (performance && performance.memory) {
        Object.defineProperty(performance, 'memory', {
          get: () => ({
            usedJSHeapSize: Math.floor(30000000 * (fingerprint.deviceMemory / 16)),
            totalJSHeapSize: Math.floor(50000000 * (fingerprint.deviceMemory / 16)),
            jsHeapSizeLimit: Math.floor(100000000 * (fingerprint.deviceMemory / 16))
          })
        });
      }
      
    }, fingerprint);
    
    // Set viewport to match the fingerprint with consistency
    await page.setViewport({
      width: fingerprint.viewportSize.width,
      height: fingerprint.viewportSize.height,
      deviceScaleFactor: fingerprint.devicePixelRatio,
      isMobile: fingerprint.platform.includes('iPhone') || 
                fingerprint.platform.includes('Android') || 
                fingerprint.platform.includes('iPad'),
      hasTouch: fingerprint.touchSupport
    });
    
    console.log("Fingerprint applied successfully with consistency");
  }

  // Inject behavioral simulation based on device characteristics
  async injectBehaviorSimulation(page, fingerprint) {
    console.log("Injecting behavioral simulation...");
    
    await page.evaluateOnNewDocument((fingerprint) => {
      // Store original event creation methods
      const originalCreateEvent = document.createEvent;
      const originalMouseEvent = window.MouseEvent;
      const originalKeyboardEvent = window.KeyboardEvent;
      
      // Create a behavioral simulator
      window.behavioralSimulator = {
        // Simulate realistic mouse movement patterns based on device type
        simulateMouseMovement: function(targetX, targetY) {
          // Movement pattern varies by device performance
          const speedFactor = window.navigator.hardwareConcurrency >= 8 && window.navigator.deviceMemory >= 8 ? 0.7 : 1.0;
          
          // Simulate acceleration/deceleration in mouse movement
          const startX = window.mouseX || 0;
          const startY = window.mouseY || 0;
          
          // Calculate a more complex path with intermediate points
          const steps = Math.max(5, Math.floor(Math.abs(targetX - startX) + Math.abs(targetY - startY)) / 50);
          
          for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            // Apply a slight curve to simulate human-like movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const x = startX + (targetX - startX) * easeProgress;
            const y = startY + (targetY - startY) * easeProgress;
            
            // Add small random deviations to simulate human imperfection
            const deviation = 3 * (1 - progress);
            window.mouseX = x + (Math.random() * deviation - deviation/2);
            window.mouseY = y + (Math.random() * deviation - deviation/2);
            
            // Delay based on device performance and movement distance
            setTimeout(() => {
              document.dispatchEvent(new MouseEvent('mousemove', {
                clientX: window.mouseX,
                clientY: window.mouseY
              }));
            }, i * 10 * speedFactor);
          }
        },

        // Simulate realistic typing patterns based on device characteristics
        simulateTyping: function(text, element) {
          // Typing rhythm varies by device performance and user type
          const speedFactor = window.navigator.hardwareConcurrency >= 8 && window.navigator.deviceMemory >= 8 ? 0.8 : 1.0;
          
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            setTimeout(() => {
              // Simulate variable typing speed with occasional pauses
              if (Math.random() > 0.9) {
                // Brief pause like real typing
                setTimeout(() => {
                  element.value += char;
                  element.dispatchEvent(new Event('input', { bubbles: true }));
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                }, Math.random() * 300 * speedFactor);
              } else {
                element.value += char;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, i * (50 + Math.random() * 100) * speedFactor);
          }
        },
        
        // Simulate realistic scrolling based on device and user behavior
        simulateScroll: function(targetY) {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const distance = Math.abs(targetY - currentY);
          const direction = targetY > currentY ? 1 : -1;
          
          // Scroll speed based on device performance
          const speedFactor = window.navigator.hardwareConcurrency >= 8 && window.navigator.deviceMemory >= 8 ? 0.9 : 1.0;
          
          // Number of scroll events depends on distance
          const steps = Math.max(5, Math.floor(distance / 50));
          
          for (let i = 1; i <= steps; i++) {
            const scrollPos = currentY + (distance * i / steps) * direction;
            setTimeout(() => {
              window.scrollTo(0, scrollPos);
            }, i * 15 * speedFactor);
          }
        }
      };
      
      // Override window methods to simulate human-like behavior
      const originalScrollTo = window.scrollTo;
      window.scrollTo = function(x, y) {
        // Add randomness to scroll behavior
        if (typeof y === 'number' && Math.random() > 0.7) {
          // Sometimes scroll slightly past then back to simulate human imprecision
          const overshoot = (Math.random() - 0.5) * 20;
          originalScrollTo.call(window, x, y + overshoot);
          setTimeout(() => originalScrollTo.call(window, x, y), 100 + Math.random() * 200);
        } else {
          originalScrollTo.call(window, x, y);
        }
      };
      
      // Add behavioral properties based on fingerprint
      Object.defineProperties(window, {
        behavioralProfile: {
          value: {
            mouseMovement: fingerprint.mouseMovement,
            typingCadence: fingerprint.typingCadence,
            scrollBehavior: fingerprint.scrollBehavior
          },
          writable: false,
          enumerable: true
        }
      });
      
    }, fingerprint);
    
    console.log("Behavioral simulation injected successfully");
  }

  // Inject stealth scripts to prevent detection
  async injectStealthScripts(page) {
    console.log("Injecting stealth scripts...");
    
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Define plugins property consistently with fingerprint
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          // Return an array consistent with the fingerprint's plugin list
          if (window.navigator.platform.includes('iPhone') || window.navigator.platform.includes('iPad')) {
            // iOS doesn't have plugins
            return new Array(0);
          } else {
            // Desktop/Android plugins
            const pluginsArray = [];
            const pluginNames = [
              { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer", description: "Portable Document Format" },
              { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai", description: "PDF Viewer" },
              { name: "Native Client", filename: "internal-nacl-plugin", description: "Native Client" },
              { name: "Widevine Content Decryption Module", filename: "oimompecagnajdejgnnjijobebaeigek", description: "Enables Widevine DRM" }
            ];
            
            // Add plugins based on fingerprint
            if (Math.random() > 0.3) pluginsArray.push(pluginNames[0]);
            if (Math.random() > 0.4) pluginsArray.push(pluginNames[1]);
            if (Math.random() > 0.6) pluginsArray.push(pluginNames[2]);
            if (Math.random() > 0.7) pluginsArray.push(pluginNames[3]);
            
            return pluginsArray;
          }
        },
      });
      
      // Define mimeTypes property consistently
      Object.defineProperty(navigator, 'mimeTypes', {
        get: () => {
          if (window.navigator.platform.includes('iPhone') || window.navigator.platform.includes('iPad')) {
            // iOS doesn't have mimeTypes
            return new Array(0);
          } else {
            // Desktop/Android mimeTypes
            return [
              { type: "application/pdf" },
              { type: "application/x-google-chrome-pdf" },
              { type: "application/x-nacl" },
              { type: "application/x-pnacl" }
            ].filter(() => Math.random() > 0.2); // Randomly exclude some based on fingerprint
          }
        },
      });
      
      // Remove webdriver from toString methods
      const originalToString = HTMLIFrameElement.prototype.contentWindow.toString;
      Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
        get: function() {
          if (this.src === 'about:blank') {
            return {
              __proto__: Window.prototype
            };
          }
          return originalToString.call(this);
        },
      });
      
      // Modify toString for webdriver detection
      const originalToStringMethod = window.HTMLIFrameElement.prototype.constructor.toString;
      window.HTMLIFrameElement.prototype.constructor.toString = function() {
        return originalToStringMethod.call(this);
      };
      
      // Spoof WebGL vendor and renderer
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          return 'Intel Inc.';
        } else if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter.call(this, parameter);
      };
      
      // Spoof WebGL2 vendor and renderer
      if (window.WebGL2RenderingContext) {
        const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
            return 'Intel Inc.';
          } else if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
            return 'Intel Iris OpenGL Engine';
          }
          return getParameter2.call(this, parameter);
        };
      }
    });
    
    console.log("Stealth scripts injected successfully");
  }

  // Launch Chrome with specified options
  async launch() {
    console.log("Launching Chrome with anti-detection measures...");
    
    // Get a random fingerprint
    const fingerprint = getRandomFingerprint();
    
    // Launch browser with anti-detection arguments
    this.browser = await puppeteer.launch({
      headless: false, // Keep visible to monitor progress
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-running-insecure-content',
        '--disable-features=site-permission-requests',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=TranslateUI',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-plugins-discovery',
        '--disable-background-tasks',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--max_old_space_size=4096',
        // Additional flags to avoid detection
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions-http-throttling',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--disable-features=VizDisplayCompositor'
      ],
      ignoreDefaultArgs: [
        '--enable-automation'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Clear all data first
    await this.clearBrowserData(this.page);
    
    // Apply fingerprint to the page
    await this.applyFingerprint(this.page, fingerprint);
    
    // Inject behavioral simulation
    await this.injectBehaviorSimulation(this.page, fingerprint);
    
    // Inject stealth scripts
    await this.injectStealthScripts(this.page);
    
    console.log("Chrome launched with anti-detection measures");
    return this.page;
  }

  // Close the browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("Browser closed");
    }
  }
}

module.exports = ChromeManager;