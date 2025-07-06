# Step 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

# Step 2: Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (for npm install)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Build the app
RUN npm run build

# Step 7: Install the serve package globally to serve the build
RUN npm install -g serve

# Step 8: Expose the port the app will run on
EXPOSE 8080

# Step 9: Serve the app from the "dist" folder
CMD ["serve", "-s", "dist", "-l", "8080"]
