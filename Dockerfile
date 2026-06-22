FROM node:20-slim

WORKDIR /app

# Copiar solo enygma
COPY artifacts/enygma .

# Instalar sin workspace, solo production
RUN npm install --legacy-peer-deps --production

# Build
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]

