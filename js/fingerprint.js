// Array of 1000 diverse and logically consistent fingerprints
const fingerprints = [];

// Function to generate a large set of diverse but logically consistent fingerprints
function generateFingerprints() {
  // Platform-specific configurations to ensure consistency
  const platformConfigs = [
    // Windows configurations
    {
      platform: 'Win32',
      osType: 'Windows',
      resolutions: [{w: 1920, h: 1080}, {w: 1366, h: 768}, {w: 2560, h: 1440}, {w: 1600, h: 900}],
      devicePixelRatios: [1, 1.25, 1.5],
      hardwareConcurrencies: [4, 6, 8, 12, 16],
      deviceMemories: [4, 8, 16],
      webglVendors: ['Google Inc.', 'NVIDIA Corporation', 'Intel Inc.', 'AMD'],
      webglRenderers: [
        'ANGLE (Google, Vulkan 1.1.82 (SwiftShader Device) Direct3D11)',
        'Quadro K2200/PCIe/SSE2', 
        'ANGLE (NVIDIA, NVIDIA GeForce GTX 950 Direct3D11)',
        'ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11)',
        'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11)',
        'GeForce RTX 3080/PCIe/SSE2'
      ],
      touchSupport: false,
      baseUA: (version) => `Mozilla/5.0 (Windows NT 10.${Math.floor(Math.random() * 5) + 10}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
    },
    // MacIntel configurations
    {
      platform: 'MacIntel',
      osType: 'macOS',
      resolutions: [{w: 2560, h: 1440}, {w: 1920, h: 1080}, {w: 1440, h: 900}, {w: 2048, h: 1280}],
      devicePixelRatios: [2], // Mac typically has 2x for Retina displays
      hardwareConcurrencies: [6, 8, 12, 16],
      deviceMemories: [8, 16],
      webglVendors: ['Apple Inc.', 'Google Inc.', 'NVIDIA Corporation', 'AMD'],
      webglRenderers: [
        'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)',
        'ANGLE (Apple, Apple M2, Metal)',
        'ANGLE (Google, ANGLE Metal)',
        'ANGLE (NVIDIA, NVIDIA GeForce GTX 750 Ti Metal)',
        'ANGLE (AMD, AMD Radeon Pro Metal)'
      ],
      touchSupport: false,
      baseUA: (version) => `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_${15 + Math.floor(Math.random() * 8)}_${Math.floor(Math.random() * 10) + 1}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
    },
    // Linux configurations
    {
      platform: 'Linux x86_64',
      osType: 'Linux',
      resolutions: [{w: 1920, h: 1080}, {w: 1366, h: 768}, {w: 1600, h: 900}, {w: 1280, h: 1024}],
      devicePixelRatios: [1],
      hardwareConcurrencies: [2, 4, 6, 8],
      deviceMemories: [2, 4, 8],
      webglVendors: ['Intel Open Source Technology Center', 'NVIDIA Corporation', 'AMD', 'Google Inc.'],
      webglRenderers: [
        'Mesa DRI Intel(R) HD Graphics 5500 (Broadwell GT2)',
        'ANGLE (NVIDIA, GeForce GTX 1060 Direct3D11)',
        'ANGLE (AMD, Radeon RX 580 Direct3D11)',
        'ANGLE (Intel Open Source Technology Center, Mesa DRI Intel(R) Haswell Desktop)'
      ],
      touchSupport: false,
      baseUA: (version) => `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
    },
    // iPhone configurations
    {
      platform: 'iPhone',
      osType: 'iOS',
      resolutions: [{w: 1170, h: 2532}, {w: 828, h: 1792}, {w: 1242, h: 2688}, {w: 750, h: 1334}],
      devicePixelRatios: [3, 2], // Varies by model
      hardwareConcurrencies: [2, 4, 6],
      deviceMemories: [3, 4, 6], // iOS reports lower values
      webglVendors: ['Apple Inc.'],
      webglRenderers: [
        'Apple GPU',
        'Apple A14 GPU',
        'Apple A15 GPU',
        'Apple M1 GPU'
      ],
      touchSupport: true,
      baseUA: (version) => `Mozilla/5.0 (iPhone; CPU iPhone OS ${15 + Math.floor(Math.random() * 6)}_${Math.floor(Math.random() * 10)} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${version}.0.0.0 Mobile/15E148 Safari/604.1`
    },
    // iPad configurations
    {
      platform: 'iPad',
      osType: 'iOS',
      resolutions: [{w: 2048, h: 2732}, {w: 1668, h: 2388}, {w: 1536, h: 2048}, {w: 1024, h: 1366}],
      devicePixelRatios: [2],
      hardwareConcurrencies: [4, 6, 8],
      deviceMemories: [4, 6, 8],
      webglVendors: ['Apple Inc.'],
      webglRenderers: [
        'Apple GPU',
        'Apple A14 GPU',
        'Apple A15 GPU',
        'Apple M1 GPU'
      ],
      touchSupport: true,
      baseUA: (version) => `Mozilla/5.0 (iPad; CPU OS ${15 + Math.floor(Math.random() * 6)}_${Math.floor(Math.random() * 10)} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1`
    },
    // Android configurations
    {
      platform: 'Android',
      osType: 'Android',
      resolutions: [{w: 1080, h: 2340}, {w: 1440, h: 3040}, {w: 1080, h: 2160}, {w: 1440, h: 2960}],
      devicePixelRatios: [2.75, 3, 2.625, 2.5],
      hardwareConcurrencies: [4, 6, 8],
      deviceMemories: [4, 6, 8],
      webglVendors: ['Google Inc.', 'ARM', 'Qualcomm', 'Imagination Technologies'],
      webglRenderers: [
        'Adreno (TM) 650',
        'Mali-G78',
        'ANGLE (ARM, Mali-G78, OpenGL ES 3.2)',
        'ANGLE (Qualcomm, Adreno (TM) 650, OpenGL ES 3.2)',
        'ANGLE (Imagination Technologies, PowerVR Rogue GE8300, OpenGL ES 3.2)'
      ],
      touchSupport: true,
      baseUA: (version) => `Mozilla/5.0 (Linux; Android ${9 + Math.random() * 5}; ${['SM-', 'Pixel', 'GM19', 'ONEPLUS'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 100)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Mobile Safari/537.36`
    }
  ];

  const timeZones = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 
    'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'America/Toronto', 'Europe/Paris', 'Europe/Rome',
    'Asia/Kolkata', 'Asia/Dubai', 'Africa/Cairo', 'America/Mexico_City',
    'Asia/Jerusalem', 'Pacific/Auckland', 'Atlantic/Reykjavik', 'Asia/Riyadh',
    'Asia/Hong_Kong', 'America/Sao_Paulo', 'Asia/Seoul', 'Europe/Moscow'
  ];
  
  const languagesList = [
    ["en-US", "en"], ["en-GB", "en"], ["fr-FR", "fr", "en"], 
    ["de-DE", "de", "en"], ["es-ES", "es", "en"], ["it-IT", "it", "en"],
    ["ja-JP", "ja"], ["zh-CN", "zh"], ["ru-RU", "ru", "en"],
    ["pt-BR", "pt", "en"], ["ko-KR", "ko"], ["ar-SA", "ar"],
    ["hi-IN", "hi", "en"], ["nl-NL", "nl", "en"], ["sv-SE", "sv", "en"]
  ];
  
  const canvasRenderings = [
    'unlocked', 'standard', 'mobile-optimized', 'tablet-optimized', 
    'open-source', 'custom', 'enhanced', 'basic', 'advanced'
  ];
  
  const fontMetrics = [
    ['Arial', 'Times New Roman', 'Courier New'], 
    ['Helvetica', 'Arial', 'Times'],
    ['Liberation Sans', 'DejaVu Serif', 'Ubuntu'],
    ['SF Pro Display', 'SF Pro Text', 'Helvetica Neue'],
    ['Roboto', 'Open Sans', 'Lato'],
    ['Segoe UI', 'Tahoma', 'Verdana'],
    ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'],
    ['Meiryo', 'Yu Gothic', 'MS PGothic']
  ];
  
  const mouseMovements = [
    'natural', 'smooth', 'precise', 'touch-gestures',
    'measured', 'rhythmic', 'deliberate'
  ];
  
  const typingCadences = [
    'human-like', 'variable', 'methodical', 'moderate',
    'irregular', 'rhythmic', 'deliberate'
  ];
  
  const scrollBehaviors = [
    'natural', 'consistent', 'smooth-scroll',
    'smooth', 'step-wise'
  ];
  
  // Generate 1000 unique fingerprints ensuring consistency
  for (let i = 0; i < 1000; i++) {
    // Select a platform configuration
    const platformConfig = platformConfigs[i % platformConfigs.length];
    
    // Randomize values within the constraints of the platform
    const resolution = platformConfig.resolutions[Math.floor(Math.random() * platformConfig.resolutions.length)];
    const devicePixelRatio = platformConfig.devicePixelRatios[Math.floor(Math.random() * platformConfig.devicePixelRatios.length)];
    const hardwareConcurrency = platformConfig.hardwareConcurrencies[Math.floor(Math.random() * platformConfig.hardwareConcurrencies.length)];
    const deviceMemory = platformConfig.deviceMemories[Math.floor(Math.random() * platformConfig.deviceMemories.length)];
    
    const timeZone = timeZones[i % timeZones.length];
    const languages = languagesList[i % languagesList.length];
    const browserVersion = Math.floor(Math.random() * 15) + 110; // 110-124
    
    // Construct viewport size based on resolution and devicePixelRatio
    const viewportWidth = Math.min(resolution.w, Math.max(300, Math.floor(resolution.w * (0.8 + (Math.random() * 0.15)))));
    const viewportHeight = Math.min(resolution.h, Math.max(300, Math.floor(resolution.h * (0.8 + (Math.random() * 0.15)))));
    
    const newFingerprint = {
      userAgent: platformConfig.baseUA(browserVersion),
      platform: platformConfig.platform,
      osType: platformConfig.osType,
      browserVersion: `${browserVersion}.0.0.0`,
      screenResolution: { 
        width: resolution.w, 
        height: resolution.h 
      },
      colorDepth: 24, // Standard for modern displays
      viewportSize: { 
        width: viewportWidth,
        height: viewportHeight
      },
      devicePixelRatio: devicePixelRatio,
      touchSupport: platformConfig.touchSupport,
      languages: languages,
      timeZone: timeZone,
      locale: languages[0],
      apis: [
        'WebGL', 
        ...(platformConfig.touchSupport ? ['Touch Events'] : []), 
        ...(Math.random() > 0.3 ? ['WebRTC'] : []), 
        ...(Math.random() > 0.5 ? ['WebGPU'] : []),
        ...(Math.random() > 0.6 ? ['MediaDevices'] : []),
        ...(Math.random() > 0.7 ? ['ServiceWorker'] : [])
      ],
      permissions: [
        'camera', 
        'microphone', 
        ...(Math.random() > 0.5 ? ['notifications'] : []),
        ...(platformConfig.touchSupport ? ['geolocation'] : []),
        ...(Math.random() > 0.7 ? ['persistent-storage'] : [])
      ],
      plugins: [
        ...(platformConfig.platform.includes('iPhone') || platformConfig.platform.includes('iPad') ? [] : [
          'Chrome PDF Plugin', 
          'Chrome PDF Viewer'
        ]),
        ...(Math.random() > 0.5 ? ['Native Client'] : []),
        ...(Math.random() > 0.6 ? ['WidevineCdm'] : [])
      ],
      webglVendor: platformConfig.webglVendors[Math.floor(Math.random() * platformConfig.webglVendors.length)],
      webglRenderer: platformConfig.webglRenderers[Math.floor(Math.random() * platformConfig.webglRenderers.length)],
      canvasRendering: canvasRenderings[i % canvasRenderings.length],
      fontMetrics: fontMetrics[i % fontMetrics.length],
      audioContext: parseFloat((Math.random() * 0.1).toFixed(5)),
      cookiesEnabled: true,
      localStorage: true,
      sessionStorage: true,
      indexedDB: true,
      hardwareConcurrency: hardwareConcurrency,
      deviceMemory: deviceMemory,
      batteryAPI: Math.random() > 0.3,
      mouseMovement: mouseMovements[i % mouseMovements.length],
      typingCadence: typingCadences[i % typingCadences.length],
      scrollBehavior: scrollBehaviors[i % scrollBehaviors.length]
    };
    
    fingerprints.push(newFingerprint);
  }
}

// Generate the fingerprints
generateFingerprints();

// Function to get a random fingerprint
function getRandomFingerprint() {
  const randomIndex = Math.floor(Math.random() * fingerprints.length);
  return fingerprints[randomIndex];
}

module.exports = {
  getRandomFingerprint,
  fingerprints
};