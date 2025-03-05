#!/bin/sh

# Navigate to the server directory and install dependencies
cd server
npm install

# Start the backend server
npm start &

# Navigate to the client directory, install dependencies, and build frontend
cd ../client
npm install
npm run build
