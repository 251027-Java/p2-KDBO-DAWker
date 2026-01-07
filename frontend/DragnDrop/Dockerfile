FROM node:20-alpine

WORKDIR /app

# Install dependencies first (to leverage Docker caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of your source code
COPY . .

# Vite dev server default port
EXPOSE 5173

# Run the dev server. 
# We use --host to ensure it binds to 0.0.0.0 so you can access it from outside the container.
CMD ["npm", "run", "dev", "--", "--host"]