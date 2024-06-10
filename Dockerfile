# Use the official Node.js image as a base
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000 and start the application
EXPOSE 3000
CMD ["npm", "run", "dev"]