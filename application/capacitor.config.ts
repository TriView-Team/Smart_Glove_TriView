import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fcd59a0be7c14b54bd367df190da0f8b',
  appName: 'smart-thread-detect',
  webDir: 'dist',
  server: {
    url: 'https://fcd59a0b-e7c1-4b54-bd36-7df190da0f8b.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning for Triview glove…',
        cancel: 'Cancel',
        availableDevices: 'Available devices',
        noDeviceFound: 'No Triview glove found',
      },
    },
  },
};

export default config;
