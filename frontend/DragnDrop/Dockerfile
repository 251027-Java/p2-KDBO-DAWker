# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files from the specific app folder to install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the specific app's source code
COPY . .

# Build the production-ready files
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine
# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=build /app/dist /usr/share/nginx/html

# If you are using React Router, you need this custom Nginx config 
# to prevent 404s on page refresh
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]