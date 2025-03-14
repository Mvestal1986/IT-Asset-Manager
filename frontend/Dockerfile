# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# First copy package.json
COPY package.json ./

# Use npm install instead of npm ci if no package-lock.json exists
RUN npm install

# Copy all frontend files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app with hot-reloading
CMD ["npm", "start"]