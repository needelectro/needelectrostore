import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.needelectro.store',
  appName: 'Need Electro Store',
  webDir: 'android-shell',
  server: {
    // Connect securely to the live production storefront
    url: 'https://www.needelectro.store',
    cleartext: false,
    androidScheme: 'https',
    // Allow navigation across needelectro domain
    allowNavigation: [
      'needelectro.store',
      'www.needelectro.store',
      '*.needelectro.store',
      'needelectroerp.vercel.app',
      '*.supabase.co',
      '*.stripe.com',
      '*.sslcommerz.com',
      '*.bkash.com',
      '*.nagad.com.bd'
    ]
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#002B5B',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#002B5B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#002B5B',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
