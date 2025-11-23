FROM node:20

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Fresh install inside the container
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
