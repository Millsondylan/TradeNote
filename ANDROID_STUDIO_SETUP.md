# TradeNote Android Studio Setup Guide

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Android Studio** (latest version) - [Download here](https://developer.android.com/studio)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** (installed via Android Studio)

### Android Studio Setup
1. Install Android Studio
2. Open Android Studio and complete the setup wizard
3. Install Android SDK (API level 33 or higher recommended)
4. Create an Android Virtual Device (AVD) for testing

## Quick Start

### Option 1: Automated Build (Recommended)
```bash
# Run the automated build script
./build-android.sh
```

### Option 2: Manual Build
```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Add Android platform (if not already added)
npx cap add android

# Sync with Android
npx cap sync android

# Copy web assets
npx cap copy android
```

## Opening in Android Studio

### Method 1: Command Line
```bash
npx cap open android
```

### Method 2: Manual
1. Open Android Studio
2. Select "Open an existing Android Studio project"
3. Navigate to your project folder
4. Select the `android` folder
5. Click "OK"

## Building and Running

### Build APK
```bash
# Command line
npx cap build android

# Or in Android Studio
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Run on Device/Emulator
```bash
# Command line
npx cap run android

# Or in Android Studio
# Click the green "Run" button
```

## Project Structure

```
TradeNote/
├── android/                 # Android Studio project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/       # Native Android code
│   │   │   ├── res/        # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── dist/                   # Built web assets
├── src/                    # Source code
├── capacitor.config.ts     # Capacitor configuration
└── package.json
```

## Configuration Files

### Capacitor Config (`capacitor.config.ts`)
- App ID: `com.tradenote.app`
- App Name: `TradeNote`
- Web Directory: `dist`
- Android scheme: `https`

### Android Manifest (`android/app/src/main/AndroidManifest.xml`)
- Permissions for camera, storage, internet, notifications
- File provider configuration
- Portrait orientation lock
- Touch screen requirement

## Troubleshooting

### Common Issues

#### 1. Gradle Sync Failed
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

#### 2. Missing Dependencies
```bash
# Reinstall node modules
rm -rf node_modules package-lock.json
npm install
npx cap sync android
```

#### 3. Build Errors
```bash
# Clear all caches
npm run build
npx cap sync android
npx cap copy android
```

#### 4. Permission Issues
- Ensure Android Studio has necessary permissions
- Check that Android SDK is properly installed
- Verify JDK installation

### Debug Mode
```bash
# Enable debug logging
export CAPACITOR_DEBUG=1
npx cap run android
```

## Development Workflow

### 1. Make Changes
- Edit files in `src/`
- Test in browser: `npm run dev`

### 2. Build for Mobile
```bash
npm run build
npx cap sync android
```

### 3. Test on Device
```bash
npx cap run android
```

### 4. Debug
- Use Chrome DevTools for web debugging
- Use Android Studio's debugger for native issues
- Check logs: `adb logcat`

## Performance Optimization

### Build Optimizations
- Source maps disabled for production
- Console logs removed in production
- Assets optimized and chunked
- Small assets inlined

### Mobile Optimizations
- Portrait orientation lock
- Touch-friendly UI components
- Offline-first architecture
- SQLite local storage

## Deployment

### Debug APK
```bash
npx cap build android
# APK will be in: android/app/build/outputs/apk/debug/
```

### Release APK
1. Configure signing in `android/app/build.gradle`
2. Update version in `package.json`
3. Build release APK in Android Studio
4. Test thoroughly before distribution

## Support

For issues related to:
- **Capacitor**: Check [Capacitor documentation](https://capacitorjs.com/docs)
- **Android Studio**: Check [Android documentation](https://developer.android.com/studio)
- **TradeNote**: Check project issues or documentation

## Next Steps

After successful setup:
1. Test all features on device
2. Configure app signing for release
3. Set up CI/CD pipeline
4. Prepare for app store submission 