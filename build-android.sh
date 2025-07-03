#!/bin/bash

# TradeNote Android Build Script
# This script prepares the app for Android Studio deployment

echo "🚀 Starting TradeNote Android build process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Capacitor CLI is installed
if ! command -v npx cap &> /dev/null; then
    echo "📦 Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the web app..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

echo "📱 Adding Android platform..."
npx cap add android

echo "🔄 Syncing with Android..."
npx cap sync android

echo "🔧 Copying web assets..."
npx cap copy android

echo "✅ Build process completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Open Android Studio"
echo "2. Open the 'android' folder in this project"
echo "3. Wait for Gradle sync to complete"
echo "4. Connect an Android device or start an emulator"
echo "5. Click 'Run' to build and install the app"
echo ""
echo "🔧 Alternative commands:"
echo "- Open in Android Studio: npx cap open android"
echo "- Build APK: npx cap build android"
echo "- Run on device: npx cap run android"
echo ""
echo "📱 The app is now ready for Android Studio!" 