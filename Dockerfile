# Use Node.js 20 Alpine base image (lightweight)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock first (to leverage Docker cache)
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the app
RUN yarn build

# Use a smaller runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built files and dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Set a non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application with Prisma migration
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:prod"]
