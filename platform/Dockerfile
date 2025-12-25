# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# Railway automatically passes all environment variables during build
# VITE_* variables are needed at build time for Vite to inline them
# All VITE_* variables must be declared as ARG and ENV for Docker builds
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# CLERK_PUBLISHABLE_KEY is needed at runtime for server-side Clerk middleware
# If not provided, it will fall back to VITE_CLERK_PUBLISHABLE_KEY in server/index.ts
ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY:-$VITE_CLERK_PUBLISHABLE_KEY}

ARG VITE_PAYMENT_EMAIL
ENV VITE_PAYMENT_EMAIL=$VITE_PAYMENT_EMAIL

ARG VITE_VENMO_USERNAME
ENV VITE_VENMO_USERNAME=$VITE_VENMO_USERNAME

ARG VITE_PAYPAL_USERNAME
ENV VITE_PAYPAL_USERNAME=$VITE_PAYPAL_USERNAME

ARG VITE_WALMART_USERNAME
ENV VITE_WALMART_USERNAME=$VITE_WALMART_USERNAME

ARG VITE_CHIME_USERNAME
ENV VITE_CHIME_USERNAME=$VITE_CHIME_USERNAME

ARG VITE_WISE_USERNAME
ENV VITE_WISE_USERNAME=$VITE_WISE_USERNAME

ARG VITE_ZELLE_EMAIL
ENV VITE_ZELLE_EMAIL=$VITE_ZELLE_EMAIL

ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

# Expose port (Railway sets PORT env var)
EXPOSE ${PORT:-5000}

# Start the application
CMD ["npm", "run", "start"]

