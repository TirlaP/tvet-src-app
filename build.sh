#!/bin/bash

# This is a simple build script for the TVET SRC Nomination App

echo "Building TVET SRC Nomination App..."

# Install dependencies (if needed)
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Create the dist folder if it doesn't exist
mkdir -p dist

# Copy public assets
echo "Copying public assets..."
cp -r public/* dist/ 2>/dev/null || :
cp index.html dist/

echo "Build completed successfully!"
echo ""
echo "To run the app in a production environment, you would need to:"
echo "1. Set up a web server (like nginx, Apache, or a Node.js server)"
echo "2. Configure it to serve the 'dist' directory"
echo "3. Handle proper routing for the SPA (Single Page Application)"
echo ""
echo "For local testing, you can run:"
echo "npx serve dist"

# Make the script executable
chmod +x build.sh
