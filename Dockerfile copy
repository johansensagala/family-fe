# Gunakan Node.js versi LTS
FROM node:20-alpine AS base

# Set direktori kerja
WORKDIR /app

# Copy file dependency
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy semua file proyek ke dalam container
COPY . .

# Build aplikasi Next.js
# RUN npm run build -- --no-lint
# RUN SKIP_ENV_VALIDATION=1 NEXT_IGNORE_TYPE_CHECKS=1 npm run build -- --no-lint

# Jalankan Next.js di dev mode
CMD ["npm", "run", "dev"]

# Port default Next.js (3000)
EXPOSE 3000
