#!/bin/sh

# Install backend dependencies
cd server
npm install

# Go back to root
cd ..

# Install frontend dependencies
npm install --prefix client

# Build frontend
npm run build --prefix client

# Start the backend server
npm start --prefix server

