FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Expose backend port
EXPOSE 4000

# Start server
CMD ["node", "server.js"]
