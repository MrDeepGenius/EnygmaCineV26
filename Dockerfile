FROM node:20-alpine

WORKDIR /app

# Copiar solo enygma
COPY artifacts/enygma .

# Instalar sin workspace
RUN npm install --legacy-peer-deps --omit=dev

# Build
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]

