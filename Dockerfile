# Fetching the minified node image on apline linux
FROM node:slim

# Setting up the work directory
WORKDIR /celos

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "npm", "run", "start-prod" ]

# Exposing server port
EXPOSE 5000