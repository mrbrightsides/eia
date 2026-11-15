import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.englishisland.adventure',
  appName: 'English Island Adventure',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
      '*.youtube.com',
      '*.googlevideo.com'
    ]
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
