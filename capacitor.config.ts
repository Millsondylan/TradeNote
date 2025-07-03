import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradenote.app',
  appName: 'TradeNote',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1a1a2e",
      showSpinner: true,
      spinnerColor: "#0ea5e9"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0ea5e9"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config; 