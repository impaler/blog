#!/usr/bin/env bash

# Docker helper script to start or build the https://github.com/impaler/cd-blog-phenomic.git site
# Eg. bash start.sh build
# Eg. bash start.sh start
# Get the ip for the start image docker inspect --format '{{ .NetworkSettings.IPAddress }}' $CID

CD_BLOG="christopherdecoster.com"
BUILD_DIR="/home/blogbuilder/cd-blog-phenomic"
PWD=$(pwd)

docker rm -f $CD_BLOG
docker build -t $CD_BLOG .

function start() {
    docker run -ti -v $PWD/assets:$BUILD_DIR/content/assets -v $PWD/posts:$BUILD_DIR/content/posts --rm $CD_BLOG start
}

function build() {
    rm -rf $PWD/dist
    mkdir $PWD/dist

    docker run --user $(id -u $USER) -v $PWD/assets:$BUILD_DIR/content/assets -v $PWD/posts:$BUILD_DIR/content/posts -v $PWD/dist:$BUILD_DIR/dist $CD_BLOG build
}

# Allow argument to invoke function
$*