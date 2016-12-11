FROM node:6.9.1

RUN apt-get update
RUN apt-get install git

RUN useradd --user-group --create-home --shell /bin/false blogbuilder &&\
  npm install --global yarn@0.17.10


USER blogbuilder
WORKDIR /home/blogbuilder

RUN git clone https://github.com/impaler/cd-blog-phenomic.git cd-blog-phenomic

WORKDIR /home/blogbuilder/cd-blog-phenomic

RUN yarn install

EXPOSE 3000
CMD "ip add | grep global"
ENTRYPOINT ["/usr/local/bin/yarn", "run"]