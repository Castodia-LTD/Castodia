import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.castodia.care',
  appName: 'CastodiaCare',
  webDir: 'public',

  server: {
    url: 'https://app.castodia.co.uk',
    cleartext: false,
  },
};

export default config;