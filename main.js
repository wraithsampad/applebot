const { createAppleBot } = require('./js/apple');

// Run the Apple ID creation bot
createAppleBot({
    headless: false,  // Show the browser window so we can see what's happening
    width: 1366,
    height: 768
}).catch(error => {
    console.error('Error running Apple bot:', error);
});