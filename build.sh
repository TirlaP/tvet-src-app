#!/bin/bash

# This is a build script for the TVET SRC Nomination App

echo "Building TVET SRC Nomination App..."

# Install dependencies (if needed)
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Run the Vite build command
echo "Running Vite build..."
npm run build

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
