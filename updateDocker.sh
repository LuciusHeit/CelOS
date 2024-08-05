#! /usr/bin/bash

git pull

# docker hub username
USERNAME=badnarrators
# image name
IMAGE=celos
# program version
version=`cat VERSION`
echo "username: $USERNAME"
echo "image: $IMAGE"
echo "version: $version"


docker build -t $USERNAME/$IMAGE:$version .
docker stop $IMAGE
docker wait $IMAGE
docker rm $IMAGE
docker run -d --rm -p 1298:5000 --name $IMAGE $USERNAME/$IMAGE:$version
docker tag $USERNAME/$IMAGE:$version $USERNAME/$IMAGE:latest