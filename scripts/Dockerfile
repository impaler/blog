FROM node:6.9.1

# Setup env dependencies
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install git yarn -y

# Use the base image guid 1000 user node for building for easier
# Permissions in development
USER node

# Setup the phenomic static blog project
WORKDIR /home/node
RUN git clone https://github.com/impaler/cd-blog-phenomic.git cd-blog-phenomic -b develop
WORKDIR /home/node/cd-blog-phenomic
RUN git checkout develop

# Add host content and for the build
#ADD posts /home/node/cd-blog-phenomic/content/posts
#ADD assets /home/node/cd-blog-phenomic/content/assets

RUN yarn install

# allow the phenomic watch port for development
EXPOSE 3000
