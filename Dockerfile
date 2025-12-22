# Step 1: Use official Python image
FROM python:3.12-slim

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy Python generator first
COPY generator/ ./generator/

# Step 4: Install Python dependencies
RUN pip install --no-cache-dir -r generator/requirements.txt

# Step 5: Copy Node server code
COPY server/ ./server/

# Step 6: Install Node.js
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs build-essential \
    && npm install --prefix server

# Step 7: Expose port
EXPOSE 3000

# Step 8: Set Node working directory
WORKDIR /app/server

# Step 9: Run Node server
CMD ["node", "server.js"]